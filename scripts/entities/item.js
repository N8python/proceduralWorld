class Item extends Entity {
    constructor({
        x,
        y,
        z,
        item,
        amount
    }) {
        super({
            x,
            y,
            z,
            scale: (Item.itemScale[item] ? Item.itemScale[item] : [0.05, 0.05, 0.05]).map(x => x * (Math.random() * 0.2 + 0.9)),
            model: mainScene.models[item]
        });
        this.mesh.rotation.y = Math.random() * 2 * Math.PI;
        this.item = item;
        this.amount = amount;
        this.scene = mainScene;
        this.chunk = mainScene.chunkLoader.chunkAt(Math.round(this.mesh.position.x), Math.round(this.mesh.position.z));
        if (this.scene.chunkLoader.hasChunk(Math.round(this.mesh.position.x), Math.round(this.mesh.position.z))) {
            try {
                this.mesh.position.y = this.scene.chunkLoader.fastHeightAt(this.mesh.position.x, this.mesh.position.z);;
            } catch (e) {

            }
        }
        const cachePlace = mainScene.chunkLoader.chunkCache[this.chunk.mesh.position.x + "," + this.chunk.mesh.position.z];
        cachePlace.push(this);
    }
    update() {
        if (Math.hypot(mainScene.player.position.x - this.mesh.position.x, mainScene.player.position.z - this.mesh.position.z) < 0.1) {
            this.remove(mainScene);
            const cachePlace = mainScene.chunkLoader.chunkCache[this.chunk.mesh.position.x + "," + this.chunk.mesh.position.z];
            cachePlace.splice(cachePlace.indexOf(this), 1);
            mainScene.playerController.addToInventory({ item: this.item, amount: this.amount });
        }
        if (Math.hypot(mainScene.player.position.x - this.mesh.position.x, mainScene.player.position.z - this.mesh.position.z) < 0.2) {
            const angleToPlayer = Math.atan2(mainScene.player.position.x - this.mesh.position.x, mainScene.player.position.z - this.mesh.position.z);
            this.mesh.position.x += 0.01 * Math.sin(angleToPlayer);
            this.mesh.position.z += 0.01 * Math.cos(angleToPlayer);
            this.mesh.position.y = this.scene.chunkLoader.fastHeightAt(this.mesh.position.x, this.mesh.position.z);;
        }
    }
}
Item.itemScale = {
    "leaf": [0.1, 0.1, 0.1],
    "rock": [0.00015, 0.00015, 0.00015],
    "flower": [0.00025, 0.00025, 0.00025],
    "berries": [0.02, 0.02, 0.02],
}