class Goblin extends Entity {
    constructor(obj) {
        obj.rigged = true;
        super(obj)
        this.initiated = false;
        //mainScene.third.load.fbx("goblin").then(goblin => {})
    }
    async add(scene) {
        this.scene = scene;
        this.added = true;
        super.add(scene);
        /*scene.third.load.fbx(`./assets/models/enemies/goblin/Breathing Idle (13).fbx`).then(object => {
            console.log(JSON.stringify(object.animations[0]));
        });*/
        scene.third.animationMixers.add(this.mesh.animation.mixer);
        const animsToLoad = ["idle"];
        for (const anim of animsToLoad) {
            const animText = await fetch(`./assets/models/enemies/goblin/animations/${anim}.json`);
            const animJson = await animText.json();
            const clip = THREE.AnimationClip.parse(animJson);
            clip.animName = anim;
            this.mesh.animation.add(anim, clip);
        }
        this.mesh.animation.play("idle");
        this.initiated = true;
    }
    update() {
        if (this.scene.chunkLoader.hasChunk(Math.round(this.mesh.position.x), Math.round(this.mesh.position.z))) {
            try {
                const theGeometry = this.scene.chunkLoader.chunkAt(Math.round(this.mesh.position.x), Math.round(this.mesh.position.z)).mesh.geometry;
                const segments = theGeometry.parameters.widthSegments;
                let forceIdx = 64 * 129 + 64;
                //console.log(forceIdx);
                const targetX = theGeometry.attributes.position.getX(forceIdx);
                const targetY = theGeometry.attributes.position.getY(forceIdx);
                const theChunk = this.scene.chunkLoader.chunkAt(Math.round(this.mesh.position.x), Math.round(this.mesh.position.z));
                let offsetX = (this.mesh.position.x - (theChunk.mesh.position.x - 0.5));
                let offsetY = (this.mesh.position.z - (theChunk.mesh.position.z - 0.5));
                if (offsetX < 0) {
                    offsetX = 1 + offsetX;
                }
                if (offsetY < 0) {
                    offsetY = 1 + offsetY;
                }
                offsetY = 1 - offsetY;
                //offsetX = 1 - offsetX;
                //offsetY = 1 - offsetY;
                //console.log(offsetY, offsetX)
                offsetX = Math.ceil(offsetX * segments);
                offsetY = Math.ceil(offsetY * segments);
                const idx = offsetY * (segments + 1) + offsetX;
                //console.log(idx);
                //console.log(idx);
                const targetHeight = theGeometry.attributes.position.getZ(idx);
                //console.log(targetHeight)
                //const targetHeight = this.scene.chunkLoader.heightAt(this.mesh.position.x, this.mesh.position.z);
                if (Number.isFinite(this.mesh.position.y)) {
                    //this.mesh.position.x = targetX;
                    //this.mesh.position.z = targetY;
                    //this.scene.testSphere.position.x = theChunk.mesh.position.x + theGeometry.attributes.position.getX(idx);
                    //this.scene.testSphere.position.z = theChunk.mesh.position.z + theGeometry.attributes.position.getY(idx);
                    this.mesh.position.y = -targetHeight;
                    //this.scene.testSphere.position.y = -targetHeight;
                }
            } catch (e) {}
        }
    }
}