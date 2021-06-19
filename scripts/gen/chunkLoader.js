class ChunkLoader extends ChunkManager {
    constructor({
        scene,
        target
    }) {
        super({ scene });
        this.target = target;
        this.currCenterChunk = {
            x: Infinity,
            z: Infinity
        };
        this.needToLoad = [];
    }
    load({
        maxTime,
        toLoad
    } = {}) {
        let origin = {
            x: Math.floor(this.target.position.x),
            z: Math.floor(this.target.position.z)
        }
        const chunksNeeded = toLoad !== undefined ? toLoad : [];
        if (chunksNeeded.length === 0) {
            for (let x = origin.x - 8; x <= origin.x + 8; x++) {
                for (let z = origin.z - 8; z <= origin.z + 8; z++) {
                    let size = 128;
                    if (Math.abs(x - origin.x) > 1 || Math.abs(z - origin.z) > 1) {
                        size = 64;
                    }
                    if (Math.abs(x - origin.x) > 3 || Math.abs(z - origin.z) > 3) {
                        size = 32;
                    }
                    if (Math.abs(x - origin.x) > 5 || Math.abs(z - origin.z) > 5) {
                        size = 16;
                    }
                    chunksNeeded.push([x, z, size]);
                }
            }
        }
        chunksNeeded.sort((a, b) => this.chunkDist({ x: a[0], z: a[1] }) - this.chunkDist({ x: b[0], z: b[1] }));
        let timeLoading = 0;
        let lastLoad = performance.now();
        let chunksToCompute = [];
        const hasStopped = chunksNeeded.some(([x, z, size], i) => {
            if (this.chunkDist({ x, z }) > 8) {
                return;
            }
            if (!this.hasChunk(x, z)) {
                chunksToCompute.push(this.addAtCoords(x, z, size));
            } else {
                const c = this.chunkAt(x, z);
                if (c.size !== size) {
                    this.removeAtCoords(x, z, size);
                    chunksToCompute.push(this.addAtCoords(x, z, size));
                }
            }
            timeLoading += performance.now() - lastLoad;
            lastLoad = performance.now();
            if (timeLoading > maxTime) {
                this.needToLoad = chunksNeeded.slice(i);
                return true;
            }
        });
        if (!hasStopped) {
            this.needToLoad = [];
        }
        this.edges = [];
        this.sortChunks();
        this.mergeChunks();
    }
    chunkDist(chunk) {
        return Math.max(Math.abs(chunk.x - Math.floor(this.target.position.x - 0.5)), Math.abs(chunk.z - Math.floor(this.target.position.z - 0.5)));
    }
    sortChunks() {
        this.chunks.sort((a, b) => this.chunkDist(a) - this.chunkDist(b));
    }
    centerChunk() {
        return this.chunkAt(this.currCenterChunk.x, this.currCenterChunk.z);
    }
    heightAt(x, z) {
        const theChunk = this.chunkAt(Math.round(x), Math.round(z));
        const startPoint = new THREE.Vector3(x, 300, z);
        const endPoint = new THREE.Vector3(x, -300, z);
        const raycaster = new THREE.Raycaster(endPoint, startPoint.sub(endPoint).normalize());
        const intersects = raycaster.intersectObjects([...theChunk.entities.map(e => e.mesh), theChunk.mesh], true);
        let highestPoint = -Infinity;
        intersects.forEach(sect => {
            if (sect.point.y > highestPoint) {
                highestPoint = sect.point.y;
            }
        })
        return highestPoint;
    }
    update() {
        if (this.currCenterChunk.x !== Math.floor(this.target.position.x) || this.currCenterChunk.z !== Math.floor(this.target.position.z)) {
            this.load({
                maxTime: 1
            });
            this.currCenterChunk.x = Math.floor(this.target.position.x);
            this.currCenterChunk.z = Math.floor(this.target.position.z);
        }
        if (this.needToLoad.length > 0) {
            this.load({
                maxTime: 1,
                toLoad: this.needToLoad
            });
        }
        this.chunks.forEach(chunk => {
            if (this.chunkDist(chunk) > 8) {
                this.remove(chunk);
            }
        });
    }
}