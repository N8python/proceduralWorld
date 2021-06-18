/*const generateChunk = () => {
    const width = 256;
    const height = 256;
    const size = width * height;
    const data = new Uint8Array(3 * size);
    const ground = new THREE.PlaneGeometry(1, 1, width, height);
    var positionAttribute = ground.attributes.position;
    let octaves = 5;
    let persistance = 0.5;
    let lacunarity = 1.87;
    let scale = 100;
    const heightmap = [];
    for (let i = 0; i < 256; i++) {
        heightmap[i] = [];
        for (let j = 0; j < 256; j++) {
            let noiseHeight = 0;
            let amplitude = 1;
            let frequency = 1;
            for (let a = 0; a < octaves; a++) {
                noiseHeight += noise.simplex2(i / scale * frequency, j / scale * frequency) * amplitude;
                amplitude *= persistance;
                frequency *= lacunarity;
            }
            heightmap[i][j] = noiseHeight;
        }
    }
    for (var i = 0; i < positionAttribute.count; i++) {

        // access single vertex (x,y,z)

        var x = positionAttribute.getX(i);
        var y = positionAttribute.getY(i);
        var z = positionAttribute.getZ(i);
        // modify data (in this case just the z coordinate)
        let noiseHeight = heightmap[Math.floor((y + 0.5) * 255)][Math.floor((x + 0.5) * 255)];
        z += 0.1 * noiseHeight;
        const stride = (Math.floor((y + 0.5) * 255) * 256 * 3) + (Math.floor((x + 0.5) * 255) * 3);
        //data[stride] = 0.1 * normalized * 255;
        //data[stride + 1] = 0.1 * normalized * 255;
        //data[stride + 2] = 0.1 * normalized * 255;
        let terrainLevelNoise = -noiseHeight + 0.33 * noise.simplex2(x * 10, y * 10);
        let color = [0, 0, 0];
        if (terrainLevelNoise < 0) {
            color[0] = 0;
            color[1] = 200;
            color[2] = 0;
        } else if (terrainLevelNoise < 0.9) {
            color[0] = 200;
            color[1] = 150;
            color[2] = 0;
        } else {
            color[0] = 255;
            color[1] = 255;
            color[2] = 255;
        }
        const colorSampleR = noise.simplex2(x * 10 + 20000, y * 10 + 20000);
        const colorSampleG = noise.simplex2(x * 10 + 10000, y * 10 + 10000);
        const colorSampleB = noise.simplex2(x * 10 - 10000, y * 10 - 10000);
        const colorSamples = [colorSampleR, colorSampleG, colorSampleB]
        color = color.map((x, i) => Math.max(Math.min(x + colorSamples[i] * 20, 255), 0));
        data[stride] = color[0];
        data[stride + 1] = color[1];
        data[stride + 2] = color[2];


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
    groundMesh.rotation.x = Math.PI / 2;
    groundMesh.castShadow = true;
    groundMesh.receiveShadow = true;
    return groundMesh;
}*/
const generateChunk = (s = 256, {
    x,
    z
}) => {
    const width = s;
    const height = s;
    const size = width * height;
    const data = new Uint8Array(3 * size);
    const ground = new THREE.PlaneGeometry(1, 1, width, height);

    let positionAttribute = ground.attributes.position;
    let octaves = 5;
    let persistance = 0.5;
    let lacunarity = 1.87;
    let scale = 100;
    const heightmap = new Float32Array(size);
    for (let i = 0; i < s; i++) {
        // heightmap[i] = [];
        for (let j = 0; j < s; j++) {
            let noiseHeight = 0;
            let amplitude = 1;
            let frequency = 1;
            for (let a = 0; a < octaves; a++) {
                noiseHeight += noise.simplex2(((i / s) * 256 + z * 256) / scale * frequency, ((j / s) * 256 + x * 256) / scale * frequency) * amplitude;
                amplitude *= persistance;
                frequency *= lacunarity;
            }
            heightmap[i * s + j] = noiseHeight;
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
        const yVal = Math.floor((y + 0.5) * (s - 1)) * s;
        const xVal = Math.floor((x + 0.5) * (s - 1));
        let noiseHeight = heightmap[yVal + xVal];
        z += 0.1 * noiseHeight;
        const stride = (yVal * 3 + xVal * 3);
        //data[stride] = 0.1 * normalized * 255;
        //data[stride + 1] = 0.1 * normalized * 255;
        //data[stride + 2] = 0.1 * normalized * 255;
        const daNoise = noise.simplex2(x * 10, y * 10);
        let terrainLevelNoise = -noiseHeight + 0.33 * daNoise;
        color[0] = 0;
        color[1] = 0;
        color[2] = 0;
        if (terrainLevelNoise < 0) {
            color[0] = 0;
            color[1] = 200;
            color[2] = 0;
        } else if (terrainLevelNoise < 0.9) {
            color[0] = 200;
            color[1] = 150;
            color[2] = 0;
        } else {
            color[0] = 255;
            color[1] = 255;
            color[2] = 255;
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
    groundMesh.position.x = x;
    groundMesh.position.z = z;
    groundMesh.rotation.x = Math.PI / 2;
    groundMesh.castShadow = true;
    groundMesh.receiveShadow = true;
    return groundMesh;
}