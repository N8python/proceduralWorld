class Tree extends Entity {
    constructor(obj) {
        super(obj);
        this.falling = false;
        this.fallDir = 0;
        this.xVel = 0;
        this.fade = false;
        this.opacity = 1;
        this.health = 150;
        this.scene = mainScene;
        this.terrainEntity = true;
    }
    update() {
        this.health = Math.min(Math.max(this.health, 0), 150);
        if (this.falling) {
            this.mesh.rotation.x += this.xVel * this.fallDir * mainScene.timeScale;
            this.xVel += 0.0005;
            this.xVel *= 0.99;
        }
        if (this.fade) {
            this.opacity -= 0.05 * mainScene.timeScale;
            this.mesh.traverse(child => {
                if ((child.isMesh || child.isSprite) && child.material) {
                    //child.material.transparent = true;
                    child.material.opacity = this.opacity;
                }
            })
        }
        if (Math.abs(this.mesh.rotation.x) > (Math.PI / 2 - 0.1) && !this.fade) {
            this.fade = true;
            this.falling = false;
            this.mesh.traverse(child => {
                if ((child.isMesh || child.isSprite) && child.material) {
                    child.material = child.material.clone();
                    child.material.transparent = true;
                }
            });
            if (this.source === mainScene.player) {
                mainScene.playerController.cameraShakeTick = Math.max(10 - 3 * Math.hypot(this.mesh.position.x - mainScene.player.position.x, this.mesh.position.z - mainScene.player.position.z), 0);
            }
            let toDrop = [{
                item: "wood",
                amount: 2 + Math.floor(Math.random() * 3)
            }, {
                item: "leaf",
                amount: 1 + Math.floor(Math.random() * 2)
            }];
            for (let i = 0; i < Math.floor(Math.random() * 6); i++) {
                toDrop.push({
                    item: "wood",
                    amount: 1 + Math.floor(Math.random() * 2)
                })
            }
            for (let i = 0; i < Math.floor(Math.random() * 6); i++) {
                toDrop.push({
                    item: "leaf",
                    amount: 1 + Math.floor(Math.random() * 1)
                })
            }
            // const dir = new THREE.Vector3();
            //this.mesh.getWorldDirection(dir);
            // this.scene.third.add.sphere({ radius: 0.1, y: 0.4, x: this.mesh.position.x + dir.x, z: this.mesh.position.z + dir.z });
            this.drop(toDrop, {
                range: 0.175
            });
            /*this.remove(mainScene);
            const cachePlace = mainScene.chunkLoader.chunkCache[this.chunk.mesh.position.x + "," + this.chunk.mesh.position.z];
            cachePlace.splice(cachePlace.indexOf(this), 1);*/
        }
        if (this.opacity < 0) {
            this.remove(mainScene);
            const cachePlace = mainScene.chunkLoader.chunkCache[this.chunk.mesh.position.x + "," + this.chunk.mesh.position.z];
            cachePlace.splice(cachePlace.indexOf(this), 1);
        }
    }
    hit(power, theta, source) {
        //this.remove(mainScene);
        //const cachePlace = mainScene.chunkLoader.chunkCache[this.chunk.mesh.position.x + "," + this.chunk.mesh.position.z];
        //cachePlace.splice(cachePlace.indexOf(this), 1);
        this.source = source;
        if (source === mainScene.player && !this.falling) {
            mainScene.playerController.cameraShakeTick = 7;
        }
        this.health -= (Math.random() * 20 * power) + 10;
        this.health = Math.min(Math.max(this.health, 0), 150);
        if (this.health < 1 && !this.falling) {
            this.fallDir = Math.random() < 0.5 ? -1 : 1;
            this.falling = true;
        }
    }
}