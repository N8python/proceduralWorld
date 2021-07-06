function hash32shift(key) {
    key = ~key + (key << 15); // key = (key << 15) - key - 1;
    key = key ^ (key >>> 12);
    key = key + (key << 2);
    key = key ^ (key >>> 4);
    key = key * 2057; // key = (key + (key << 3)) + (key << 11);
    key = key ^ (key >>> 16);
    return key;
}

function randNoise(x, y, seed = 1) {
    return hash32shift(seed + hash32shift(x + hash32shift(y))) / 2147483647;
}
const easeInOut = x => x < .5 ? 2 * x * x : -1 + (4 - 2 * x) * x;

function angleDifference(angle1, angle2) {
    const diff = ((angle2 - angle1 + Math.PI) % (Math.PI * 2)) - Math.PI;
    return (diff < -Math.PI) ? diff + (Math.PI * 2) : diff;
}

function skeletalClone(source) {

    const sourceLookup = new Map();
    const cloneLookup = new Map();

    const clone = source.clone();

    parallelTraverse(source, clone, function(sourceNode, clonedNode) {

        sourceLookup.set(clonedNode, sourceNode);
        cloneLookup.set(sourceNode, clonedNode);

    });

    clone.traverse(function(node) {

        if (!node.isSkinnedMesh) return;
        const clonedMesh = node.clone();
        const sourceMesh = sourceLookup.get(node);
        const sourceBones = sourceMesh.skeleton.bones;

        clonedMesh.skeleton = sourceMesh.skeleton.clone();
        clonedMesh.bindMatrix.copy(sourceMesh.bindMatrix);

        clonedMesh.skeleton.bones = sourceBones.map(function(bone) {

            return cloneLookup.get(bone);

        });

        clonedMesh.bind(clonedMesh.skeleton, clonedMesh.bindMatrix);

    });

    return clone;

}

function parallelTraverse(a, b, callback) {

    callback(a, b);

    for (let i = 0; i < a.children.length; i++) {

        parallelTraverse(a.children[i], b.children[i], callback);

    }

}

function angleDifference(angle1, angle2) {
    const diff = ((angle2 - angle1 + Math.PI) % (Math.PI * 2)) - Math.PI;
    return (diff < -Math.PI) ? diff + (Math.PI * 2) : diff;
}
/*THREE.Mesh.prototype.clone = function(object) {
    if (object === undefined) object = new THREE.Mesh(this.geometry, this.material);
    //THREE.Object3D.prototype.copy.call(this, object);
    object.copy(this);
    //object.position = this.position.clone();
    //object.scale = this.scale.clone();
    //object.rotation = this.rotation.clone();
    //object.quaternion = this.quaternion.clone();
    //object.needsUpdate = true;
    return object;

};*/
/*THREE.Mesh.prototype.copy = function(source) {

    THREE.Object3D.prototype.copy.call(this, source);

    if (source.morphTargetInfluences !== undefined) {

        this.morphTargetInfluences = source.morphTargetInfluences.slice();

    }

    if (source.morphTargetDictionary !== undefined) {

        this.morphTargetDictionary = Object.assign({}, source.morphTargetDictionary);

    }

    this.material = source.material;
    this.geometry = source.geometry.clone();

    return this;

}*/