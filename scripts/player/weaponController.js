class WeaponController {
    constructor({
        weapon,
        scene,
        defaultPosition = { x: 0.6, y: -0.5, z: 0.015 },
        defaultRotation = { x: 0, y: 0, z: 0 }
    }) {
        this.weapon = weapon;
        this.scene = scene;
        this.defaultPosition = defaultPosition;
        this.defaultRotation = defaultRotation;
        this.raycaster = new THREE.Raycaster();
        this.targetWeaponRotations = [
            // { x: 0.3, y: 0, z: -0.2, time: 2, progress: 0 }
        ];
        this.currWeaponRotation = { x: 0, y: 0, z: 0 };
        this.targetWeaponPositions = [

        ];
        this.currWeaponPosition = { x: 0, y: 0, z: 0 };
    }
    handleSwing({ leftBound = -Math.PI / 4, rightBound = Math.PI / 4, strength = 1 }) {
        if (!this.scene) {
            return;
        }
        [...this.scene.entities, ...this.scene.chunkLoader.chunkAt(Math.round(this.scene.player.position.x), Math.round(this.scene.player.position.z)).entities].forEach(object => {
            const theta = Math.atan2(object.mesh.position.x - this.scene.player.position.x, object.mesh.position.z - this.scene.player.position.z);
            const dist = Math.hypot(object.mesh.position.x - this.scene.player.position.x, object.mesh.position.z - this.scene.player.position.z);
            const direction = new THREE.Vector3();
            const rotation = this.scene.third.camera.getWorldDirection(direction);
            const cTheta = Math.atan2(rotation.x, rotation.z);
            const angleDiff = cTheta - theta;
            if (angleDiff < rightBound && angleDiff > leftBound) {
                if (Math.abs(object.mesh.position.y - this.scene.player.position.y) < 0.4 && dist < 0.4) {
                    object.hit(strength, cTheta, this.scene.player);
                }
            }
        })
    }
    update() {
        const deltaRot = new THREE.Vector3();
        if (this.targetWeaponRotations.length > 0) {
            const target = this.targetWeaponRotations[0];
            target.progress += this.scene.delta;
            const percent = easeInOut(target.progress / target.time);
            const rp = target.progress / target.time;
            deltaRot.x = angleDifference(this.currWeaponRotation.x, target.x) * percent;
            deltaRot.y = angleDifference(this.currWeaponRotation.y, target.y) * percent;
            deltaRot.z = angleDifference(this.currWeaponRotation.z, target.z) * percent;
            if (rp >= 1) {
                deltaRot.multiplyScalar(0);
                this.currWeaponRotation = this.targetWeaponRotations.shift();
            }
        }
        const weaponChange = new THREE.Vector3();
        if (this.targetWeaponPositions.length > 0) {
            const target = this.targetWeaponPositions[0];
            if (target.progress === 0 && target.attack) {
                this.handleSwing(target.attack);
                target.attack = undefined;
            }
            target.progress += this.scene.delta;
            const percent = easeInOut(target.progress / target.time);
            const rp = target.progress / target.time;
            //this.sword.rotateX((target.x - this.currWeaponPosition.x) * percent);
            //this.sword.rotateY((target.y - this.currWeaponPosition.y) * percent);
            // this.sword.rotateZ((target.z - this.currWeaponPosition.z) * percent);
            weaponChange.x = (target.x - this.currWeaponPosition.x) * percent;
            weaponChange.y = (target.y - this.currWeaponPosition.y) * percent;
            weaponChange.z = (target.z - this.currWeaponPosition.z) * percent;
            if (rp >= 1) {
                weaponChange.multiplyScalar(0);
                this.currWeaponPosition = this.targetWeaponPositions.shift();
            }
        }
        this.raycaster.setFromCamera({ x: this.defaultPosition.x + this.currWeaponPosition.x + weaponChange.x, y: this.defaultPosition.y + this.currWeaponPosition.y + weaponChange.y }, this.scene.third.camera);
        const pos = new THREE.Vector3();
        pos.copy(this.raycaster.ray.direction);
        pos.multiplyScalar(this.defaultPosition.z + this.currWeaponPosition.z + weaponChange.z);
        pos.add(this.scene.third.camera.position);
        this.weapon.position.copy(pos);
        this.weapon.rotation.copy(this.scene.third.camera.rotation);
        this.weapon.rotateX(this.defaultRotation.x + this.currWeaponRotation.x + deltaRot.x);
        this.weapon.rotateY(this.defaultRotation.y + this.currWeaponRotation.y + deltaRot.y);
        this.weapon.rotateZ(this.defaultRotation.z + this.currWeaponRotation.z + deltaRot.z);
    }
    addTargetPosition(x, y, z, time, attack) {
        this.targetWeaponPositions.push({ x, y, z, time, attack, progress: 0 });
    }
    addTargetRotation(x, y, z, time, attack) {
        this.targetWeaponRotations.push({ x, y, z, time, attack, progress: 0 });
    }
    smoothTransition() {
        const tp = this.targetWeaponPositions[this.targetWeaponPositions.length - 1];
        if (tp.x === 0 && tp.y === 0 && tp.z === 0) {
            this.targetWeaponPositions.pop();
        }
        const tr = this.targetWeaponRotations[this.targetWeaponRotations.length - 1];
        if (tr.x === 0 && tr.y === 0 && tr.z === 0) {
            this.targetWeaponRotations.pop();
        }
    }
    idle() {
        return this.targetWeaponPositions.length === 0 && this.targetWeaponRotations.length === 0 && mainScene.playerController.weaponState !== "block";
        /* this.currWeaponPosition.x === 0 && this.currWeaponPosition.y === 0 && this.currWeaponPosition.z === 0 &&
         this.currWeaponRotation.x === 0 && this.currWeaponRotation.y === 0 && this.currWeaponRotation.z === 0;*/
    }
}