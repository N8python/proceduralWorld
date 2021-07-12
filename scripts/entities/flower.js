class Flower extends Entity {
    constructor(obj) {
        super(obj);
        this.health = 10;
        this.opacity = 1;
        this.fade = false;
        this.scene = mainScene;
        this.terrainEntity = true;
    }
    update() {
        this.health = Math.min(Math.max(this.health, 0), 300);
        if (this.fade) {
            this.opacity -= 1 * mainScene.timeScale;
            this.mesh.traverse(child => {
                if ((child.isMesh || child.isSprite) && child.material) {
                    //child.material.transparent = true;
                    child.material.opacity = this.opacity;
                }
            });
        }
        if (this.opacity < 0) {
            let toDrop = [{
                item: "flower",
                amount: 1
            }];
            this.drop(toDrop, {
                range: 0
            });
            this.remove(mainScene);
            const cachePlace = mainScene.chunkLoader.chunkCache[this.chunk.mesh.position.x + "," + this.chunk.mesh.position.z];
            cachePlace.splice(cachePlace.indexOf(this), 1);
        }
    }
    hit(power, theta, source) {
        //this.remove(mainScene);
        //const cachePlace = mainScene.chunkLoader.chunkCache[this.chunk.mesh.position.x + "," + this.chunk.mesh.position.z];
        //cachePlace.splice(cachePlace.indexOf(this), 1);
        if (source === mainScene.player && !this.fade) {
            mainScene.playerController.cameraShakeTick = 7;
        }
        this.health -= (Math.random() * 20 * power) + 10;
        this.health = Math.min(Math.max(this.health, 0), 300);
        if (this.health < 1 && !this.fade) {
            this.mesh.traverse(child => {
                if ((child.isMesh || child.isSprite) && child.material) {
                    child.material = child.material.clone();
                    child.material.transparent = true;
                }
            });
            this.fade = true;
        }
    }
}