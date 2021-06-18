const { enable3d, Scene3D, Canvas, THREE, FirstPersonControls, ExtendedObject3D } = ENABLE3D
let mainScene;
class MainScene extends Scene3D {
    constructor() {
        super({ key: 'MainScene' })
    }

    init() {
        this.accessThirdDimension()
    }

    async create() {
        this.third.warpSpeed("-ground", "-orbitControls");
        mainScene = this;
        this.third.load.preload("tree", "./assets/models/tree.fbx");
        this.third.load.preload("rock", "./assets/models/rock.fbx");
        this.third.load.preload("bush", "./assets/models/bush.fbx");
        this.third.load.preload("flower", "./assets/models/flower.fbx");
        this.models = {
            "tree": await this.third.load.fbx("tree"),
            "rock": await this.third.load.fbx("rock"),
            "bush": await this.third.load.fbx("bush"),
            "flower": await this.third.load.fbx("flower")
        };
        this.third.camera.near = 0.01;
        this.third.camera.updateProjectionMatrix();
        this.player = this.third.add.sphere({ x: 0, z: 0, y: 0.25, radius: 0.0000001 }, { phong: { color: "white" } });
        this.firstPersonControls = new FirstPersonControls(this.third.camera, this.player, {});
        this.chunkLoader = new ChunkLoader({
            scene: this,
            target: this.player
        });
        this.keys = {
            w: this.input.keyboard.addKey("w"),
            s: this.input.keyboard.addKey("s"),
            a: this.input.keyboard.addKey("a"),
            d: this.input.keyboard.addKey("d")
        }
        this.input.on('pointerdown', () => {
            this.input.mouse.requestPointerLock();
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
        this.initiated = true;
    }
    update(time, delta) {
        if (!this.initiated) {
            return;
        }
        stats.begin();
        this.delta = delta;
        this.timeScale = 0.95 * this.timeScale + 0.05 * (delta / (1000 / 60));
        const worldVector = new THREE.Vector3();
        this.third.camera.getWorldDirection(worldVector);
        const theta = Math.atan2(worldVector.x, worldVector.z);
        if (this.keys.w.isDown) {
            this.player.position.x += 0.01 * this.timeScale * Math.sin(theta);
            this.player.position.z += 0.01 * this.timeScale * Math.cos(theta);
        }
        if (this.keys.s.isDown) {
            this.player.position.x -= 0.01 * this.timeScale * Math.sin(theta);
            this.player.position.z -= 0.01 * this.timeScale * Math.cos(theta);
        }
        if (this.keys.a.isDown) {
            this.player.position.x += 0.01 * Math.sin(theta + Math.PI / 2);
            this.player.position.z += 0.01 * Math.cos(theta + Math.PI / 2);
        }
        if (this.keys.d.isDown) {
            this.player.position.x += 0.01 * Math.sin(theta - Math.PI / 2);
            this.player.position.z += 0.01 * Math.cos(theta - Math.PI / 2);
        }
        //if (performance.now() < 3000) {
        this.chunkLoader.update();
        //}
        //generateChunk();
        if (this.chunkLoader.hasChunk(Math.round(this.player.position.x), Math.round(this.player.position.z))) {
            try {
                this.player.position.y = this.chunkLoader.heightAt(this.player.position.x, this.player.position.z) + 0.1;
            } catch (e) {

            }

        }
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