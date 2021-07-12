class ChunkManager {
    constructor({
        scene
    }) {
        this.scene = scene;
        this.chunks = [];
        this.edges = [];
    }
    hasEdge(chunk1, chunk2) {
        return this.edges.some(e => (e[0] === chunk1 && e[1] === chunk2) || (e[0] === chunk2 && e[1] === chunk1));
    }
    mergeChunks(newChunks = this.chunks) {
        newChunks.forEach(chunk => {
            const neighbors = this.chunks.filter(c => ((Math.abs(c.x - chunk.x) + Math.abs(c.z - chunk.z)) <= 1) && c !== chunk);
            let belowChunk = neighbors.find(c => c.z - chunk.z === 1);
            let upChunk = neighbors.find(c => c.z - chunk.z === -1);
            let rightChunk = neighbors.find(c => c.x - chunk.x === 1);
            let leftChunk = neighbors.find(c => c.x - chunk.x === -1);
            if (this.hasEdge(chunk, belowChunk) /* || (belowChunk && chunk.size !== belowChunk.size)*/ ) {
                belowChunk = undefined;
            }
            if (this.hasEdge(chunk, upChunk) /*|| (upChunk && chunk.size !== upChunk.size)*/ ) {
                upChunk = undefined;
            }
            if (this.hasEdge(chunk, rightChunk) /* || (rightChunk && chunk.size !== rightChunk.size)*/ ) {
                rightChunk = undefined;
            }
            if (this.hasEdge(chunk, leftChunk) /* || (leftChunk && chunk.size !== leftChunk.size)*/ ) {
                leftChunk = undefined;
            }
            let belowAttr, upAttr, rightAttr, leftAttr;
            if (belowChunk) {
                //this.edges.push([chunk, belowChunk]);
                belowAttr = belowChunk.mesh.geometry.attributes.position;
            }
            if (upChunk) {
                //this.edges.push([chunk, upChunk]);
                upAttr = upChunk.mesh.geometry.attributes.position;
            }
            if (rightChunk) {
                //this.edges.push([chunk, rightChunk]);
                rightAttr = rightChunk.mesh.geometry.attributes.position;
            }
            if (leftChunk) {
                //this.edges.push([chunk, leftChunk]);
                leftAttr = leftChunk.mesh.geometry.attributes.position;
            }
            const positionAttribute = chunk.mesh.geometry.attributes.position;
            /*for (let i = 0; i < chunk.size; i++) {
                if (belowChunk) {
                    let scaledI = Math.floor(i / (chunk.size / belowChunk.size));
                    let tx = belowAttr.getX(scaledI + (belowChunk.size + 1) * belowChunk.size);
                    let ty = belowAttr.getY(scaledI + (belowChunk.size + 1) * belowChunk.size);
                    let tz = belowAttr.getZ(scaledI + (belowChunk.size + 1) * belowChunk.size);
                    positionAttribute.setXYZ(i, tx, ty + (((chunk.size === belowChunk.size) ? chunk.size : chunk.size + 1) / chunk.size), tz);
                };

                if (upChunk) {
                    let scaledI = Math.floor(i / (chunk.size / upChunk.size));
                    let tx = upAttr.getX(scaledI);
                    let ty = upAttr.getY(scaledI);
                    let tz = upAttr.getZ(scaledI);
                    positionAttribute.setXYZ(i + (chunk.size + 1) * chunk.size, tx, ty - (((chunk.size === upChunk.size) ? chunk.size + 1 : chunk.size) / chunk.size), tz);
                }
                if (rightChunk) {
                    let scaledI = Math.floor(i / (chunk.size / rightChunk.size));
                    let tx = rightAttr.getX((rightChunk.size + 1) * scaledI);
                    let ty = rightAttr.getY((rightChunk.size + 1) * scaledI);
                    let tz = rightAttr.getZ((rightChunk.size + 1) * scaledI);
                    positionAttribute.setXYZ(i * (chunk.size + 1) + chunk.size, tx + (((chunk.size === rightChunk.size) ? chunk.size : chunk.size + 1) / chunk.size), ty, tz);
                }
                if (leftChunk) {
                    let scaledI = Math.floor(i / (chunk.size / leftChunk.size));
                    let tx = leftAttr.getX(scaledI * (leftChunk.size + 1) + leftChunk.size);
                    let ty = leftAttr.getY(scaledI * (leftChunk.size + 1) + leftChunk.size);
                    let tz = leftAttr.getZ(scaledI * (leftChunk.size + 1) + leftChunk.size);
                    positionAttribute.setXYZ((chunk.size + 1) * i, tx - (((chunk.size === leftChunk.size) ? chunk.size : chunk.size + 1) / chunk.size), ty, tz);
                };
            }*/
            for (let i = 0; i <= chunk.size; i++) {
                if (belowChunk) {
                    let scaledI = Math.floor(i / (chunk.size / belowChunk.size));
                    let tx = belowAttr.getX(scaledI + (belowChunk.size + 1) * belowChunk.size);
                    let ty = belowAttr.getY(scaledI + (belowChunk.size + 1) * belowChunk.size);
                    let tz = belowAttr.getZ(scaledI + (belowChunk.size + 1) * belowChunk.size);
                    positionAttribute.setXYZ(i, tx, ty + 1, tz)
                }
                if (upChunk) {
                    let scaledI = Math.floor(i / (chunk.size / upChunk.size));
                    let tx = upAttr.getX(scaledI);
                    let ty = upAttr.getY(scaledI);
                    let tz = upAttr.getZ(scaledI);
                    positionAttribute.setXYZ(i + (chunk.size + 1) * chunk.size, tx, ty - 1, tz);
                }
                if (leftChunk) {
                    let scaledI = Math.floor(i / (chunk.size / leftChunk.size));
                    let tx = leftAttr.getX(scaledI * (leftChunk.size + 1) + leftChunk.size);
                    let ty = leftAttr.getY(scaledI * (leftChunk.size + 1) + leftChunk.size);
                    let tz = leftAttr.getZ(scaledI * (leftChunk.size + 1) + leftChunk.size);
                    positionAttribute.setXYZ((chunk.size + 1) * i, tx - 1, ty, tz);
                };
                if (rightChunk) {
                    let scaledI = Math.floor(i / (chunk.size / rightChunk.size));
                    let tx = rightAttr.getX((rightChunk.size + 1) * scaledI);
                    let ty = rightAttr.getY((rightChunk.size + 1) * scaledI);
                    let tz = rightAttr.getZ((rightChunk.size + 1) * scaledI);
                    positionAttribute.setXYZ(i * (chunk.size + 1) + chunk.size, tx + 1, ty, tz);
                }
            }
            positionAttribute.needsUpdate = true;
            if (belowAttr) {
                belowAttr.needsUpdate = true;
            }
            if (upAttr) {
                upAttr.needsUpdate = true;
            }
            if (leftAttr) {
                leftAttr.needsUpdate = true;
            }
            if (rightAttr) {
                rightAttr.needsUpdate = true;
            }
        });
    }
    add(chunk) {
        this.chunks.push(chunk);
        this.scene.third.add.existing(chunk.mesh);
        chunk.entities.forEach(entity => {
            entity.add(this.scene);
        });
        // this.scene.third.physics.add.existing(chunk.mesh, { shape: "hull" });
        // chunk.mesh.body.setCollisionFlags(2);
    }
    addAtCoords(x, z, size, entities) {
        const c = new Chunk({
            size,
            x,
            z,
            entities
        });
        this.add(c);
        return c;
    }
    remove(chunk) {
        this.chunks.splice(this.chunks.indexOf(chunk), 1);
        chunk.remove(this.scene);
    }
    removeAtCoords(x, z) {
        this.remove(this.chunkAt(x, z));
    }
    hasChunk(x, z) {
        return this.chunks.some(chunk => chunk.x === x && chunk.z === z);
    }
    chunkAt(x, z) {
        return this.chunks.find(chunk => chunk.x === x && chunk.z === z);
    }
    addRange({
        start,
        end,
        size
    }) {
        for (let x = start.x; x <= end.x; x++) {
            for (let z = start.z; z <= end.z; z++) {
                if (!this.hasChunk(x, z)) {
                    this.add(new Chunk({
                        size,
                        x,
                        z
                    }));
                }
            }
        }
    }
    removeRange({ start, end }) {
        for (let x = start.x; x <= end.x; x++) {
            for (let z = start.z; z <= end.z; z++) {
                if (this.hasChunk(x, z)) {
                    this.removeAtCoords(x, z);
                }
            }
        }
    }
    update() {

    }
}