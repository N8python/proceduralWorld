class PlayerController {
    constructor({
        player,
        scene,
        keys
    }) {
        this.player = player;
        this.scene = scene;
        this.keys = keys;
        this.onGround = true;
        this.hasBounced = false;
        this.velocity = new THREE.Vector3();
        this.weapon = new ExtendedObject3D();
        this.weapon.add(mainScene.models.axe.clone());
        this.weapon.scale.set(0.002, 0.002, 0.002);
        this.scene.third.add.existing(this.weapon);
        this.weaponController = new WeaponController({
            weapon: this.weapon,
            scene: this.scene,
            defaultRotation: { x: 0, y: -Math.PI / 2.4, z: 0 }
        });
        this.bob = 0;
        this.weaponState = "idle";
        this.weaponStates = [];
    }
    update() {
        const worldVector = new THREE.Vector3();
        this.scene.third.camera.getWorldDirection(worldVector);
        const theta = Math.atan2(worldVector.x, worldVector.z);
        const speed = 0.001;
        this.bob += 0.000005 * Math.sin(performance.now() / 250) * this.scene.timeScale;
        let bobFactor = 1;
        if (this.keys.w.isDown) {
            this.velocity.x += speed * this.scene.timeScale * Math.sin(theta);
            this.velocity.z += speed * this.scene.timeScale * Math.cos(theta);
            bobFactor = 2;
        }
        if (this.keys.s.isDown) {
            this.velocity.x -= speed * this.scene.timeScale * Math.sin(theta);
            this.velocity.z -= speed * this.scene.timeScale * Math.cos(theta);
            bobFactor = 2;
        }
        if (this.keys.a.isDown) {
            this.velocity.x += speed * this.scene.timeScale * Math.sin(theta + Math.PI / 2);
            this.velocity.z += speed * this.scene.timeScale * Math.cos(theta + Math.PI / 2);
            bobFactor = 2;
        }
        if (this.keys.d.isDown) {
            this.velocity.x += speed * this.scene.timeScale * Math.sin(theta - Math.PI / 2);
            this.velocity.z += speed * this.scene.timeScale * Math.cos(theta - Math.PI / 2);
            bobFactor = 2;
        }
        if (this.keys.space.isDown && this.onGround) {
            this.velocity.y += 0.01;
            this.onGround = false;
        }
        //this.player.position.x += this.player.velocity.x;
        //this.player.position.y += this.player.velocity.y;
        //this.player.position.z += this.player.velocity.z;
        this.player.position.add(this.velocity);
        this.velocity.multiplyScalar(0.95);
        //if (performance.now() < 3000) {
        //}
        //generateChunk();
        if (this.scene.chunkLoader.hasChunk(Math.round(this.player.position.x), Math.round(this.player.position.z))) {
            try {
                const targetHeight = this.scene.chunkLoader.heightAt(this.player.position.x, this.player.position.z) + 0.2;
                if (Number.isFinite(targetHeight)) {
                    if (this.onGround) {
                        if ((targetHeight - this.player.position.y) < 0.2) {
                            this.player.position.y += (targetHeight - this.player.position.y) / 10;
                        } else {
                            this.velocity.x *= -0.9;
                            this.velocity.z *= -0.9;
                            this.player.position.x += 2 * this.velocity.x;
                            this.player.position.z += 2 * this.velocity.z;
                        }
                    }
                    if ((this.player.position.y - targetHeight) > 0.2) {
                        this.onGround = false;
                    } else {
                        this.onGround = true;
                    }
                    if (this.onGround) {
                        this.hasBounced = false;
                    }
                    if (!this.onGround) {
                        this.velocity.y -= 0.0015;
                        if (this.scene.chunkLoader.objectAbove(this.player.position.x, this.player.position.y, this.player.position.z, 0.2) && !this.hasBounced) {
                            this.hasBounced = true;
                            this.velocity.y *= -0.1;
                        }
                    }
                }
            } catch (e) {
                console.log(e);
            }
        }
        this.weaponController.update();
        this.scene.third.camera.position.y += this.bob * bobFactor;
        if (this.weaponStates.length > 0) {
            if (this.weaponState === "idle") {
                const wState = this.weaponStates.shift();
                if (wState === "hit") {
                    this.weaponController.addTargetPosition(-0.3, 0.1, 0.0025, 200);
                    this.weaponController.addTargetPosition(0, 0, 0, 200);
                    this.weaponController.addTargetRotation(-0.5, -0.3, 0.3, 200);
                    this.weaponController.addTargetRotation(0, 0, 0, 200)
                    this.weaponState = "hit";
                }
                if (wState === "slash") {
                    this.weaponController.addTargetPosition(-1, 0, 0, 350);
                    this.weaponController.addTargetPosition(0, 0, 0, 350);
                    this.weaponController.addTargetRotation(-0.7, 1, 0, 350);
                    this.weaponController.addTargetRotation(0, 0, 0, 350)
                    this.weaponState = "slash";
                }
                if (wState === "smash") {
                    this.weaponController.addTargetPosition(-0.5, 0.5, 0, 200);
                    this.weaponController.addTargetPosition(-0.5, -0.5, 0, 200);
                    this.weaponController.addTargetPosition(0, 0, 0, 350);
                    this.weaponController.addTargetRotation(0, -0.6, 0, 200);
                    this.weaponController.addTargetRotation(-1.5, -0.6, 0, 200);
                    this.weaponController.addTargetRotation(0, 0, 0, 350)
                    this.weaponState = "smash";
                }
                if (wState === "block") {
                    this.weaponController.addTargetPosition(-0.5, 0, 0, 200);
                    this.weaponController.addTargetRotation(-0.3, 1, 0.5, 200);
                    this.weaponState = "block";
                }
            }
        }
        if (this.weaponController.idle() && this.weaponState !== "idle") {
            this.weaponState = "idle";
        }
        if (!this.scene.input.mousePointer.rightButtonDown()) {
            if (this.weaponState === "block") {
                this.weaponState = "idle";
                this.weaponController.addTargetPosition(0, 0, 0, 200);
                this.weaponController.addTargetRotation(0, 0, 0, 200);
            }
        }
    }
    registerClick(input) {
        if (this.keys.tab.isDown) {
            if (this.weaponStates.length === 0 && (this.weaponState === "idle" || this.weaponState === "hit" || this.weaponState === "slash")) {
                if (this.weaponState === "hit" || this.weaponState === "slash") {
                    this.weaponController.smoothTransition();
                }
                this.weaponStates.push("smash");
            }
        } else if (this.keys.shift.isDown) {
            if (this.weaponStates.length === 0 && (this.weaponState === "idle" || this.weaponState === "hit")) {
                if (this.weaponState === "hit") {
                    this.weaponController.smoothTransition();
                }
                this.weaponStates.push("slash");
            }
        } else if (input.mousePointer.rightButtonDown()) {
            if (this.weaponStates.length === 0 && (this.weaponState === "idle" || this.weaponState === "hit" || this.weaponState === "slash" || this.weaponState === "smash")) {
                if (this.weaponState === "hit" || this.weaponState === "slash" || this.weaponState === "smash") {
                    this.weaponController.smoothTransition();
                }
                this.weaponStates.push("block");
            }
        } else {
            if (this.weaponStates.length === 0 && this.weaponState === "idle") {
                this.weaponStates.push("hit");
            }
        }
    }
}