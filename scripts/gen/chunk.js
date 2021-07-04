class Chunk {
    constructor({
        size,
        x,
        z
    }) {
        this.x = x;
        this.z = z;
        this.id = x * Math.abs(x) + z * Math.abs(z);
        this.size = size;
        this.entities = [];
        this.mesh = this.build();
        //console.log("First: " + this.entities.length);
        for (let i = 0; i < 3; i++) {
            this.entities.forEach(entity => {
                this.entities.forEach(entity2 => {
                    if (entity !== entity2 && entity.mesh.position.distanceTo(entity2.mesh.position) < 0.01) {
                        this.entities.splice(this.entities.indexOf(entity2), 1);
                        //entity2.remove(mainScene);
                    }
                })
            });
        }
        //console.log("Last: " + this.entities.length);
    }
    build() {
        const width = this.size;
        const height = this.size;
        const size = width * height;
        const data = new Uint8Array(3 * size);
        const ground = new THREE.PlaneGeometry(1, 1, width, height);
        let positionAttribute = ground.attributes.position;
        let octaves = 5;
        let persistance = 0.5;
        let lacunarity = 1.87;
        let scale = 100;
        const heightmap = new Float32Array(size);
        for (let i = 0; i < this.size; i++) {
            // heightmap[i] = [];
            for (let j = 0; j < this.size; j++) {
                let noiseHeight = 0;
                let amplitude = 1;
                let frequency = 1;
                for (let a = 0; a < octaves; a++) {
                    noiseHeight += noise.simplex2(((i / this.size) * 256 + this.z * 256) / scale * frequency, ((j / this.size) * 256 + this.x * 256) / scale * frequency) * amplitude;
                    amplitude *= persistance;
                    frequency *= lacunarity;
                }
                let largeHeight = noise.simplex2(((i / this.size) * 256 + this.z * 256) / 2500, ((j / this.size) * 256 + this.x * 256) / 2500);
                largeHeight += 0.5 * noise.simplex2(((i / this.size) * 256 + this.z * 256) / 1250, ((j / this.size) * 256 + this.x * 256) / 1250);
                noiseHeight *= 0.15;
                noiseHeight += 4 * largeHeight;
                heightmap[i * this.size + j] = noiseHeight;
            }
        }
        let color = [0, 0, 0];
        let colorSamples = [0, 0, 0];
        for (let i = 0; i < positionAttribute.count; i++) {

            // access single vertex (x,y,z)
            let x = positionAttribute.getX(i);
            let y = positionAttribute.getY(i);
            let z = positionAttribute.getZ(i);
            // modify data (in this case just the z coordinate)
            const yVal = Math.floor((y + 0.5) * (this.size - 1)) * this.size;
            const xVal = Math.floor((x + 0.5) * (this.size - 1));
            let noiseHeight = heightmap[yVal + xVal];
            z += 0.1 * noiseHeight;
            const stride = (yVal * 3 + xVal * 3);
            //data[stride] = 0.1 * normalized * 255;
            //data[stride + 1] = 0.1 * normalized * 255;
            //data[stride + 2] = 0.1 * normalized * 255;
            const daNoise = noise.simplex2(this.x + x, this.z + y);
            let terrainLevelNoise = -noiseHeight + 0.33 * daNoise;
            color[0] = 0;
            color[1] = 0;
            color[2] = 0;
            let rockIntensity = noise.simplex2((this.x + x + 5000) / 2.5, (this.z + y + 5000) / 2.5) ** 2;
            rockIntensity += 0.5 * noise.simplex2((this.x + x - 5000) / 1.25, (this.z + y + -5000) / 1.25) ** 2;
            let sandIntensity = noise.simplex2((this.x + x + 10000) / 3, (this.z + y + 10000) / 3) ** 2.5;
            sandIntensity += 0.5 * noise.simplex2((this.x + x - 10000) / 1.25, (this.z + y - 10000) / 1.25) ** 3;
            if (rockIntensity > 0.5) {
                if (rockIntensity > 0.75) {
                    color[0] = 150;
                    color[1] = 150;
                    color[2] = 150;
                    const scaleRand = 1 + 0.15 * randNoise((this.x + x) * 4 + 5000, (this.z + y) * 4 + 5000);
                    if (x % 0.0625 === 0 && y % 0.0625 === 0 && randNoise((this.x + x) * 16 - 5000 + this.id, (this.z + y) * 16 - 5000 + this.id) > 0.9) {
                        this.entities.push(new Rock({
                            x: this.x + x,
                            z: this.z + y,
                            y: -z,
                            scale: [0.0005 * scaleRand, 0.0005 * scaleRand, 0.0005 * scaleRand],
                            rotation: [0, Math.PI * 2 * randNoise((this.x + x) * 16, (this.z + y) * 16), 0],
                            model: mainScene.models.rock
                        }))
                    }
                } else {
                    color[0] = 150;
                    color[1] = 150;
                    color[2] = 0;
                }
            } else if (sandIntensity > 0.5) {
                if (sandIntensity > 0.75) {
                    color[0] = 35;
                    color[1] = 137;
                    color[2] = 218;
                } else {
                    color[0] = 242;
                    color[1] = 209;
                    color[2] = 107;
                }
            } else {
                if (terrainLevelNoise < 0) {
                    color[0] = 0;
                    color[1] = 200;
                    color[2] = 0;
                } else if (terrainLevelNoise < 0.9) {
                    color[0] = 50;
                    color[1] = 200;
                    color[2] = 50;
                } else {
                    color[0] = 30;
                    color[1] = 175;
                    color[2] = 30;
                }
            }
            if (sandIntensity < 0.1) {
                const scaleRand = 1 + 0.15 * randNoise((this.x + x) * 4 + 5000, (this.z + y) * 4 + 5000);
                if (x % 0.0625 === 0 && y % 0.0625 === 0 && randNoise((this.x + x) * 16 - 5000 + this.id, (this.z + y) * 16 - 5000 + this.id) > 0.99) {
                    this.entities.push(new Bush({
                        x: this.x + x,
                        z: this.z + y,
                        y: -z,
                        scale: [0.0005 * scaleRand, 0.0005 * scaleRand, 0.0005 * scaleRand],
                        rotation: [0, Math.PI * 2 * randNoise((this.x + x) * 16, (this.z + y) * 16), 0],
                        model: mainScene.models.bush
                    }))
                }
            }
            if (rockIntensity < 0.1) {
                const scaleRand = 1 + 0.15 * randNoise((this.x + x) * 4 + 5000, (this.z + y) * 4 + 5000);
                if (x % 0.0625 === 0 && y % 0.0625 === 0 && randNoise((this.x + x) * 16 - 5000 + this.id, (this.z + y) * 16 - 5000 + this.id) > 0.975) {
                    this.entities.push(new Flower({
                        x: this.x + x,
                        z: this.z + y,
                        y: -z,
                        scale: [0.00025 * scaleRand, 0.00025 * scaleRand, 0.00025 * scaleRand],
                        rotation: [0, Math.PI * 2 * randNoise((this.x + x) * 16, (this.z + y) * 16), 0],
                        model: mainScene.models.flower
                    }))
                }
            }
            /*this.entities.push(new Tree({
                x: this.x + Math.random(),
                z: this.z + Math.random(),
                y: 0.25,
                scale: [0.001, 0.001, 0.001],
                model: mainScene.models.tree
            }))*/
            let treeIntensity = noise.simplex2((this.x + x + this.id - 15000) * 10, (this.z + y + this.id - 15000) * 10) ** 2.5;
            const scaleRand = 1 + 0.15 * randNoise((this.x + x) * 4 + 5000, (this.z + y) * 4 + 5000);
            if (treeIntensity > 0.7 && x % 0.25 === 0 && y % 0.25 === 0) {
                this.entities.push(new Tree({
                    x: this.x + x,
                    z: this.z + y,
                    y: -z,
                    scale: [0.001 * scaleRand, 0.001 * scaleRand, 0.001 * scaleRand],
                    rotation: [0, Math.PI * 2 * randNoise((this.x + x) * 4, (this.z + y) * 4), 0],
                    model: randNoise((this.x + x) * 4 + 20000, (this.z + y) * 4 + 20000) < 0 ? mainScene.models.tree : mainScene.models.darktree
                }))
            }
            //console.time();
            const colorSampleR = daNoise * daNoise + 0.5 * daNoise; //noise.simplex2(x * 10 + 20000, y * 10 + 20000);
            const colorSampleG = 2 * daNoise * daNoise + 0.3 * daNoise; //noise.simplex2(x * 10 + 10000, y * 10 + 10000);
            const colorSampleB = 3 * daNoise * daNoise + 0.2 * daNoise; //noise.simplex2(x * 10 - 10000, y * 10 - 10000);
            colorSamples[0] = colorSampleR;
            colorSamples[1] = colorSampleG;
            colorSamples[2] = colorSampleB;
            //color = color.map((x, i) => Math.max(Math.min(x + colorSamples[i] * 20, 255), 0));
            color[0] = Math.max(Math.min(color[0] + colorSamples[0] * 20, 255), 0);
            color[1] = Math.max(Math.min(color[1] + colorSamples[1] * 20, 255), 0);
            color[2] = Math.max(Math.min(color[2] + colorSamples[2] * 20, 255), 0);
            data[stride] = color[0];
            data[stride + 1] = color[1];
            data[stride + 2] = color[2];
            //console.timeEnd();


            // write data back to attribute

            positionAttribute.setXYZ(i, x, y, z);

        }
        const texture = new THREE.DataTexture(data, width, height, THREE.RGBFormat);
        texture.center = new THREE.Vector2(0.5, 0.5);
        texture.magFilter = THREE.LinearFilter;
        const groundMat = new THREE.MeshPhongMaterial({
            color: new THREE.Color(0x999999),
            map: texture,
            side: THREE.DoubleSide
        })
        const groundMesh = new THREE.Mesh(ground, groundMat);
        groundMesh.position.x = this.x;
        groundMesh.position.z = this.z;
        groundMesh.rotation.x = Math.PI / 2;
        groundMesh.castShadow = true;
        groundMesh.receiveShadow = true;
        return groundMesh;
    }
    remove(scene) {
        this.mesh.visible = false;
        this.mesh.geometry.dispose();
        this.mesh.material.map.dispose();
        this.mesh.material.dispose();
        scene.third.scene.children.splice(scene.third.scene.children.indexOf(this.mesh), 1);
        this.entities.forEach(entity => {
            entity.remove(scene);
        })
    }
}