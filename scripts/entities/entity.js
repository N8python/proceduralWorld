class Entity {
    constructor({
        x,
        y,
        z,
        scale = [1, 1, 1],
        rotation = [0, 0, 0],
        model,
        rigged = false
    }) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.scale = scale;
        this.model = rigged ? THREE.SkeletonUtils.clone(model) : model.clone();
        this.mesh = new ExtendedObject3D();
        this.mesh.add(this.model);
        this.mesh.scale.set(...scale);
        this.mesh.position.x = x;
        this.mesh.position.y = y;
        this.mesh.position.z = z;
        this.mesh.rotation.x = rotation[0];
        this.mesh.rotation.y = rotation[1];
        this.mesh.rotation.z = rotation[2];
        this.mesh.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                /*child.geometry = child.geometry.clone();
                child.material = child.material.clone();
                child.updateMorphTargets();
                child.matrix = new THREE.Matrix4();
                child.matrixWorld = new THREE.Matrix4();

                child.matrixAutoUpdate = THREE.Object3D.DefaultMatrixAutoUpdate;
                child.matrixWorldNeedsUpdate = false;
                child.layers = new THREE.Layers();*/
            }
        });
    }
    add(scene) {
        scene.third.add.existing(this.mesh);
    }
    remove(scene) {
        this.mesh.visible = false;
        this.mesh.traverse(child => {
            if (child.isMesh) {
                if (child.geometry) {
                    child.geometry.dispose();
                }
                if (child.material) {
                    child.material.dispose();
                    if (child.material.map) {
                        child.material.map.dispose();
                    }
                }
            }
        })
        scene.third.scene.children.splice(scene.third.scene.children.indexOf(this.mesh), 1);
    }
}