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
        this.weaponName = "axe";
        this.weaponState = "idle";
        this.weaponStates = [];
        this.roll = 0;
        this.targetRoll = 0;
        this.cameraOffset = new THREE.Vector3(0, 0, 0);
        this.cameraShakeTick = 0;
        this.health = {
            fleshWounds: 0,
            criticalWounds: 0,
            lethalWounds: 0
        }
        this.inventory = [
            [null, null, null],
            [null, { item: "axe", amount: 1 }, null],
            [null, null, null]
        ];
        this.inventoryNode = document.getElementById("inventoryDisplay");
        //this.displayInventory(this.inventoryNode);
        setTimeout(() => {
            this.displayInventory(this.inventoryNode);
        }, 500);
        setTimeout(() => {
            this.displayInventory(this.inventoryNode);
        }, 600);
        //this.displayInventory(this.inventoryNode);
    }
    displayInventory(node) {
        node = node.children[0]
        Array.from(node.children).forEach((child, i) => {
            Array.from(child.children).forEach((child2, j) => {
                if (this.inventory[i][j] !== null) {
                    const img = document.createElement("img");
                    img.src = `assets/images/items/${this.inventory[i][j].item}.png`;
                    let height = 0;
                    let width = 0;
                    if (img.width > img.height) {
                        width = "40px";
                        height = "auto";
                    } else {
                        width = "auto";
                        height = "40px";
                    }
                    //child2.innerHTML = `<div draggable="true"><img src="assets/images/items/${this.inventory[i][j].item}.png" height="${height}" width="${width}"><span style="position:relative;">${this.inventory[i][j].amount > 1 ? this.inventory[i][j].amount: ""}<span></div>`;
                    child2.innerHTML = "";
                    child2.ondragstart = (e) => {
                        e.dataTransfer.setData('text/plain', JSON.stringify({ items: this.inventory[i][j], source: [i, j] }));
                    }
                    child2.ondragenter = (e) => {
                        e.preventDefault();
                    }
                    child2.ondragover = (e) => {
                        e.preventDefault();
                    }
                    child2.ondrop = (e) => {
                        const transfer = e.dataTransfer.getData('text/plain');
                        const data = JSON.parse(transfer);
                        if (this.inventory[i][j].item === this.inventory[data.source[0]][data.source[1]].item) {
                            const temp = this.inventory[i][j];
                            if (this.keys.shift.isDown && this.inventory[i][j].amount < STACK_SIZE) {
                                this.inventory[data.source[0]][data.source[1]].amount--;
                                this.inventory[i][j].amount++;
                                if (this.inventory[data.source[0]][data.source[1]] <= 0) {
                                    this.inventory[data.source[0]][data.source[1]] = null;
                                }
                            } else {
                                let transferAmount = Math.min(data.items.amount, STACK_SIZE - temp.amount);
                                this.inventory[i][j] = { item: data.items.item, amount: transferAmount + temp.amount };
                                this.inventory[data.source[0]][data.source[1]].amount -= transferAmount;
                                if (this.inventory[data.source[0]][data.source[1]].amount <= 0) {
                                    this.inventory[data.source[0]][data.source[1]] = null;
                                }
                            }
                        } else {
                            const temp = this.inventory[i][j];
                            this.inventory[i][j] = data.items;
                            this.inventory[data.source[0]][data.source[1]] = temp;
                        }
                        this.displayInventory(this.inventoryNode);
                    }
                    child2.oncontextmenu = (e) => {
                        e.preventDefault();
                    }
                    const itemDiv = document.createElement("div");
                    itemDiv.setAttribute("draggable", true);
                    itemDiv.style.userSelect = "none";
                    itemDiv.oncontextmenu = (e) => {
                        e.preventDefault();
                    }
                    const itemImg = document.createElement("img");
                    itemImg.src = `assets/images/items/${this.inventory[i][j].item}.png`;
                    itemImg.setAttribute("height", height);
                    itemImg.setAttribute("width", width);
                    const spanTab = document.createElement("span");
                    spanTab.style.position = "absolute";
                    spanTab.style.marginTop = "24px";
                    if (width === "40px") {
                        spanTab.style.marginLeft = "-12px";
                    }
                    spanTab.innerHTML = this.inventory[i][j].amount > 1 ? this.inventory[i][j].amount : "";
                    itemDiv.appendChild(itemImg);
                    itemDiv.appendChild(spanTab);
                    child2.appendChild(itemDiv);
                } else {
                    child2.innerHTML = "";
                    child2.ondragenter = (e) => {
                        e.preventDefault();
                    }
                    child2.ondragover = (e) => {
                        e.preventDefault();
                    }
                    child2.ondrop = (e) => {
                        const transfer = e.dataTransfer.getData('text/plain');
                        const data = JSON.parse(transfer);
                        if (this.inventory[i][j] === null) {
                            if (this.keys.shift.isDown) {
                                this.inventory[data.source[0]][data.source[1]].amount--;
                                if (this.inventory[data.source[0]][data.source[1]] <= 0) {
                                    this.inventory[data.source[0]][data.source[1]] = null;
                                }
                                this.inventory[i][j] = { item: data.items.item, amount: 1 };
                            } else {
                                this.inventory[i][j] = data.items;
                                this.inventory[data.source[0]][data.source[1]] = null;
                            }
                            this.displayInventory(this.inventoryNode);
                        }
                    }
                    const itemDiv = document.createElement("div")
                    itemDiv.style.width = "40px";
                    itemDiv.style.height = "40px";
                    child2.appendChild(itemDiv);
                    //child2.innerHTML = `<div style="width:40px;height:40px;"></div>`;
                }
            });
        });
    }
    addToInventory(item) {
        item = {...item };
        let itemsToAdd = [item];
        if (item.amount > STACK_SIZE) {
            itemsToAdd = []
            while (item.amount > STACK_SIZE) {
                item.amount -= STACK_SIZE;
                itemsToAdd.push({ item: item.item, amount: STACK_SIZE });
            }
            itemsToAdd.push({ item: item.item, amount: item.amount });
        }
        const idxsAdded = [];
        itemsToAdd.forEach((item, idx) => {
            let added = false;
            for (let i = 0; i < this.inventory.length; i++) {
                for (let j = 0; j < this.inventory[0].length; j++) {
                    if (this.inventory[i][j] === null && !added) {
                        this.inventory[i][j] = item;
                        idxsAdded.push(idx);
                        added = true;
                    } else if (this.inventory[i][j] !== null && this.inventory[i][j].item === item.item) {
                        const transferAmount = Math.min(item.amount, STACK_SIZE - this.inventory[i][j].amount);
                        this.inventory[i][j].amount += transferAmount;
                        if (transferAmount === item.amount) {
                            idxsAdded.push(idx);
                            added = true;
                        }
                        item.amount -= transferAmount;
                    }
                }
            }
        });
        itemsToAdd.forEach((item, idx) => {
            if (!idxsAdded.includes(idx)) {

            }
        })
        this.displayInventory(this.inventoryNode);
    }
    update() {
        const o = new THREE.Vector3();
        o.copy(this.cameraOffset);
        o.applyQuaternion(this.scene.third.camera.quaternion)
        this.scene.third.camera.position.add(o);
        const worldVector = new THREE.Vector3();
        this.scene.third.camera.getWorldDirection(worldVector);
        const theta = Math.atan2(worldVector.x, worldVector.z);
        let speedMultiplier = Math.max(1 - 0.04 * this.health.fleshWounds - 0.12 * this.health.criticalWounds, 0.4);
        const speed = 0.001 * speedMultiplier;
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
        if (this.keys.space.isDown && this.onGround && !this.doJump) {
            this.velocity.y += 0.01 * speedMultiplier * this.scene.timeScale;
            //this.onGround = false;
            this.doJump = true;
        }
        this.roll += (this.targetRoll - this.roll) / 10;
        if (Math.abs(this.targetRoll - this.roll) < 0.005) {
            this.targetRoll = 0;
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
                        if ((targetHeight - this.player.position.y) < 0.2 && !this.doJump) {
                            this.player.position.y += (targetHeight - this.player.position.y) / 5;
                        } else {
                            this.velocity.x *= -0.9;
                            this.velocity.z *= -0.9;
                            this.player.position.x += 2 * this.velocity.x;
                            this.player.position.z += 2 * this.velocity.z;
                        }
                        if (this.doJump) {
                            this.velocity.y += 0.01 * speedMultiplier * this.scene.timeScale;
                        }
                    }
                    if ((this.player.position.y - targetHeight) > 0.2) {
                        this.onGround = false;
                        this.doJump = false;
                    } else {
                        this.onGround = true;
                    }
                    if (this.onGround) {
                        this.hasBounced = false;
                    }
                    if (!this.onGround) {
                        this.velocity.y -= 0.002 * this.scene.timeScale;
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
        if (this.inventory[1][1] && this.inventory[1][1].item !== this.weaponName) {
            this.weaponName = this.inventory[1][1].item;
            this.weapon.children = [];
            let weaponModel = mainScene.models[this.weaponName].clone();
            this.weapon.add(weaponModel);
            this.weapon.scale.set(...(PlayerController.items[this.weaponName] ? PlayerController.items[this.weaponName] : [0.002, 0.002, 0.002]));
            weaponModel.rotation.set(...(PlayerController.itemsRot[this.weaponName] ? PlayerController.itemsRot[this.weaponName] : [0, 0, 0]));
            weaponModel.position.set(...(PlayerController.itemsPos[this.weaponName] ? PlayerController.itemsPos[this.weaponName] : [0, 0, 0]));
        } else if (this.inventory[1][1] === null && this.weaponName !== null) {
            this.weaponName = null;
            this.weapon.children = [];
        }
        this.scene.third.camera.position.y += this.bob * bobFactor;
        let timeMultiplier = Math.min(1 + 0.04 * this.health.fleshWounds + 0.12 * this.health.criticalWounds, 1.6);
        if (this.weaponStates.length > 0) {
            if (this.weaponState === "idle") {
                const wState = this.weaponStates.shift();
                if (wState === "hit") {
                    this.weaponController.addTargetPosition(-0.3, 0.1, 0.0025, 200 * timeMultiplier, { leftBound: -Math.PI / 8, rightBound: Math.PI / 6, strength: 1 });
                    this.weaponController.addTargetPosition(0, 0, 0, 200 * timeMultiplier);
                    this.weaponController.addTargetRotation(-0.5, -0.3, 0.3, 200 * timeMultiplier);
                    this.weaponController.addTargetRotation(0, 0, 0, 200 * timeMultiplier)
                    this.weaponState = "hit";
                }
                if (wState === "slash") {
                    this.weaponController.addTargetPosition(-1, 0, 0, 350 * timeMultiplier, { leftBound: -Math.PI / 4, rightBound: Math.PI / 4, strength: 1.5 });
                    this.weaponController.addTargetPosition(0, 0, 0, 350 * timeMultiplier);
                    this.weaponController.addTargetRotation(-0.7, 1, 0, 350 * timeMultiplier);
                    this.weaponController.addTargetRotation(0, 0, 0, 350 * timeMultiplier)
                    this.weaponState = "slash";
                }
                if (wState === "smash") {
                    this.weaponController.addTargetPosition(-0.5, 0.5, 0, 200 * timeMultiplier);
                    this.weaponController.addTargetPosition(-0.5, -0.5, 0, 200 * timeMultiplier, { leftBound: -Math.PI / 8, rightBound: Math.PI / 8, strength: 2 });
                    this.weaponController.addTargetPosition(0, 0, 0, 350 * timeMultiplier);
                    this.weaponController.addTargetRotation(0, -0.6, 0, 200 * timeMultiplier);
                    this.weaponController.addTargetRotation(-1.5, -0.6, 0, 200 * timeMultiplier);
                    this.weaponController.addTargetRotation(0, 0, 0, 350 * timeMultiplier)
                    this.weaponState = "smash";
                }
                if (wState === "block") {
                    this.weaponController.addTargetPosition(-0.5, 0, 0, 200 * timeMultiplier);
                    this.weaponController.addTargetRotation(-0.3, 1, 0.5, 200 * timeMultiplier);
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
                this.weaponController.addTargetPosition(0, 0, 0, 200 * timeMultiplier);
                this.weaponController.addTargetRotation(0, 0, 0, 200 * timeMultiplier);
            }
        }
        if (this.cameraShakeTick > 0) {
            this.cameraOffset.x += Math.random() * 0.015 - 0.0075;
            this.cameraOffset.y += Math.random() * 0.015 - 0.0075;
            this.cameraShakeTick--;
        } else {
            this.cameraOffset.x *= 0.9;
            this.cameraOffset.y *= 0.9;
        }
        this.scene.third.camera.rotation.z += this.roll;
        //this.scene.healthCtx.fillRect(0, 0, 300, 300);
        const healthCtx = this.scene.healthCtx;
        healthCtx.clearRect(0, 0, 300, 300);
        healthCtx.drawImage(this.scene.images.fleshWound, 10, 0, 64, 64);
        healthCtx.drawImage(this.scene.images.critWound, 10, 69, 64, 64);
        healthCtx.drawImage(this.scene.images.lethalWound, 10, 69 + 69, 64, 64);
        healthCtx.font = "48px Arial";
        healthCtx.fillStyle = "#F5F5DC";
        healthCtx.fillText(this.health.fleshWounds, 84, 50);
        healthCtx.fillStyle = "yellow";
        healthCtx.fillText(this.health.criticalWounds, 84, 50 + 69);
        healthCtx.fillStyle = "black";
        healthCtx.fillRect(84, 50 + 69 + (69 / 2) + 6, 100, 24);
        healthCtx.fillStyle = "red";
        healthCtx.fillRect(87, 50 + 69 + (69 / 2) + 6 + 3, 94 * this.health.lethalWounds, 18);
        this.health.lethalWounds = Math.max(Math.min(this.health.lethalWounds, 1), 0);
        if (this.health.criticalWounds > 5) {
            this.health.lethalWounds += 0.0005;
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
    takeDamage(power) {
        let fleshChance = Math.max(0.8 - power * 0.3, 0.2);
        let miss = 0.25 ** power;
        let oldCriticalWounds = this.health.criticalWounds;
        let oldFleshWounds = this.health.fleshWounds;
        if (Math.random() < miss) {
            return;
        }
        if (Math.random() < fleshChance) {
            this.health.fleshWounds += Math.round(1 + power * Math.random());
            if (Math.random() < fleshChance) {
                this.health.fleshWounds += 1;
            }
        } else {
            this.health.criticalWounds += Math.round(1 + (power / 2) * Math.random());
        }
        if (this.health.criticalWounds > 5) {
            this.health.lethalWounds += 0.2 * (this.health.criticalWounds - oldCriticalWounds);
            this.health.lethalWounds += 0.05 * (this.health.fleshWounds - oldFleshWounds);
        }
        this.health.lethalWounds = Math.max(Math.min(this.health.lethalWounds, 1), 0);
    }
}
PlayerController.items = {
    "axe": [0.002, 0.002, 0.002],
    "berries": [0.002, 0.002, 0.002],
    "leaf": [0.0075, 0.0075, 0.0075],
    "wood": [0.003, 0.003, 0.003],
    "flower": [0.000025, 0.000025, 0.000025],
    "rock": [0.000025, 0.000025, 0.000025]
}
PlayerController.itemsRot = {
    "leaf": [Math.PI / 2, 0, 0],
    "wood": [Math.PI / 2, 0, 0],
    "rock": [Math.PI / 2, 0, 0],
}
PlayerController.itemsPos = {
    "leaf": [0, 0, 0],
    "berries": [0, -1.25, 0],
    "flower": [0, -125, 0],
    "rock": [0, 0, 0]
}