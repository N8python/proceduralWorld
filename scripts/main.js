let mainScene;
class MainScene extends Scene3D {
    constructor() {
        super({ key: 'MainScene' })
    }

    init() {
        this.accessThirdDimension()
    }

    async create() {
        this.third.warpSpeed("-ground", "-orbitControls", "-light");
        mainScene = this;
        this.third.load.preload("tree", "./assets/models/tree.fbx");
        this.third.load.preload("darktree", "./assets/models/darktree3.glb");
        this.third.load.preload("rock", "./assets/models/rock.fbx");
        this.third.load.preload("bush", "./assets/models/bush.fbx");
        this.third.load.preload("flower", "./assets/models/flower.fbx");
        this.third.load.preload("axe", "./assets/models/axe.glb");
        this.third.load.preload("goblin", "./assets/models/enemies/goblin/model3.fbx");
        this.models = {
            "tree": await this.third.load.fbx("tree"),
            "darktree": (await this.third.load.gltf("darktree")).scene,
            "rock": await this.third.load.fbx("rock"),
            "bush": await this.third.load.fbx("bush"),
            "flower": await this.third.load.fbx("flower"),
            "axe": (await this.third.load.gltf("axe")).scene,
            "goblin": await this.third.load.fbx("goblin")
        };
        this.models.darktree.scale.set(33, 33, 33);
        this.third.camera.near = 0.01;
        this.third.camera.updateProjectionMatrix();
        this.player = this.third.add.sphere({ x: 0, z: 0, y: 0.25, radius: 0.0000001 }, { phong: { color: "white" } });
        /*this.player.onGround = true;
        this.player.hasBounced = false;
        this.player.velocity = new THREE.Vector3();*/
        this.firstPersonControls = new FirstPersonControls(this.third.camera, this.player, {});
        this.chunkLoader = new ChunkLoader({
            scene: this,
            target: this.player
        });
        this.keys = {
            w: this.input.keyboard.addKey("w"),
            s: this.input.keyboard.addKey("s"),
            a: this.input.keyboard.addKey("a"),
            d: this.input.keyboard.addKey("d"),
            space: this.input.keyboard.addKey("Space"),
            shift: this.input.keyboard.addKey("Shift"),
            tab: this.input.keyboard.addKey("Tab"),
        }
        this.playerController = new PlayerController({
            player: this.player,
            keys: this.keys,
            scene: this
        })
        this.input.on('pointerdown', () => {
            this.input.mouse.requestPointerLock();
            if (this.input.mouse.locked) {
                this.playerController.registerClick(this.input);
            }
        });
        this.input.on('pointermove', pointer => {
            if (this.input.mouse.locked) {
                this.firstPersonControls.update(pointer.movementX, pointer.movementY);
            }
        });
        this.events.on('update', () => {
            this.firstPersonControls.update(0, 0);
        });
        this.timeScale = 0;
        const t = .4,
            n = this.third.lights.hemisphereLight({ skyColor: 16777215, groundColor: 0, intensity: t }),
            i = this.third.lights.ambientLight({ color: 16777215, intensity: t }),
            r = this.third.lights.directionalLight({ color: 16777215, intensity: t });
        r.position.set(50, 50, 25);
        const o = 10;
        r.shadow.camera.top = o, r.shadow.camera.bottom = -o, r.shadow.camera.left = -o, r.shadow.camera.right = o, r.shadow.mapSize.set(4096, 4096);
        this.directionalLight = r;
        /*var shadowHelper = new THREE.CameraHelper(this.directionalLight.shadow.camera);
        this.third.scene.add(shadowHelper);*/
        /*const axeMesh = new ExtendedObject3D();
        axeMesh.add(this.models.axe.clone());
        axeMesh.scale.set(0.0025, 0.0025, 0.0025);
        axeMesh.position.z = -0.015;
        axeMesh.position.x = 0.01;
        axeMesh.position.y = -0.005;
        axeMesh.rotateY(-Math.PI / 2);
        axeMesh.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        })
        this.third.camera.add(axeMesh);
        this.weapon = axeMesh;
        this.third.scene.add(this.third.camera);*/
        /*this.testGoblin = new Goblin({
                x: 0,
                y: 0.1,
                z: 0,
                scale: [0.1, 0.1, 0.1],
                rotation: [0, 0, 0]
            })*/
        //this.testGoblin.add(this)
        //this.models.goblin = this.models.goblin.clone();
        //this.models.goblin.scale.set(0.0005, 0.0005, 0.0005);
        //this.models.goblin.position.x = 0.5;
        this.entities = [];
        this.testGoblin = new Goblin({
            x: 0,
            y: 0,
            z: 0,
            scale: [0.00025, 0.00025, 0.00025],
            rotation: [0, 0, 0],
            model: this.models.goblin
        })
        this.entities.push(this.testGoblin);
        //this.testSphere = this.third.add.sphere({ radius: 0.05, y: 0.5 }, { phong: { color: 'red' } });
        //this.third.add.sphere({ radius: 0.25 }, { phong: { color: "red" } })
        for (let i = -5; i < 5; i++) {
            for (let j = -5; j < 5; j++) {
                this.entities.push(new Goblin({
                    x: 0.25 * i,
                    y: 0.26,
                    z: 0.25 * j,
                    scale: [0.00025, 0.00025, 0.00025],
                    rotation: [0, 0, 0],
                    model: this.models.goblin
                }))
            }
        }
        //this.third.add.existing(this.models.goblin);
        this.initiated = true;
    }
    update(time, delta) {
        if (!this.initiated) {
            return;
        }
        stats.begin();
        this.delta = delta;
        this.timeScale = 0.95 * this.timeScale + 0.05 * (delta / (1000 / 60));
        //this.sunAngle += 0.001 * this.timeScale;
        //this.directionalLight.position.set(this.player.position.x + 25, this.player.position.y + 50, this.player.position.z + 25);
        /* this.directionalLight.shadow.camera.top = (this.player.position.x + 0.5);
         this.directionalLight.shadow.camera.bottom = (this.player.position.x - 0.5);
         this.directionalLight.shadow.camera.left = (this.player.position.z - 0.5);
         this.directionalLight.shadow.camera.right = (this.player.position.z + 0.5);*/
        this.directionalLight.shadow.camera.updateProjectionMatrix();
        this.directionalLight.updateMatrix();
        this.directionalLight.shadow.mapSize.set(2048, 2048);
        this.playerController.update();
        this.chunkLoader.update();
        this.entities.forEach(entity => {
            if (!entity.added) {
                entity.add(this);
                return;
            } else if (entity.initiated) {
                entity.update();
            }
            //entity.mesh.position.z -= 0.01;
            //entity.mesh.position.x -= 0.01;
        });
        //this.testGoblin.mesh.position.z += 0.01;
        //this.testGoblin.mesh.position.x -= 0.01;
        stats.end();
    }
}


const config = {
    type: Phaser.WEBGL,
    transparent: true,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth * Math.max(1, window.devicePixelRatio / 2),
        height: window.innerHeight * Math.max(1, window.devicePixelRatio / 2)
    },
    scene: [MainScene],
    ...Canvas()
}

window.addEventListener('load', () => {
    enable3d(() => new Phaser.Game(config)).withPhysics('./lib')
});
var stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);