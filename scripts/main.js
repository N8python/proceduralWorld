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
        this.player.onGround = true;
        this.player.hasBounced = false;
        this.player.velocity = new THREE.Vector3();
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
        const worldVector = new THREE.Vector3();
        this.third.camera.getWorldDirection(worldVector);
        const theta = Math.atan2(worldVector.x, worldVector.z);
        const speed = 0.001;
        if (this.keys.w.isDown) {
            this.player.velocity.x += speed * this.timeScale * Math.sin(theta);
            this.player.velocity.z += speed * this.timeScale * Math.cos(theta);
        }
        if (this.keys.s.isDown) {
            this.player.velocity.x -= speed * this.timeScale * Math.sin(theta);
            this.player.velocity.z -= speed * this.timeScale * Math.cos(theta);
        }
        if (this.keys.a.isDown) {
            this.player.velocity.x += speed * Math.sin(theta + Math.PI / 2);
            this.player.velocity.z += speed * Math.cos(theta + Math.PI / 2);
        }
        if (this.keys.d.isDown) {
            this.player.velocity.x += speed * Math.sin(theta - Math.PI / 2);
            this.player.velocity.z += speed * Math.cos(theta - Math.PI / 2);
        }
        if (this.keys.space.isDown && this.player.onGround) {
            this.player.velocity.y += 0.01;
            this.player.onGround = false;
        }
        //this.player.position.x += this.player.velocity.x;
        //this.player.position.y += this.player.velocity.y;
        //this.player.position.z += this.player.velocity.z;
        this.player.position.add(this.player.velocity);
        this.player.velocity.multiplyScalar(0.95);
        //if (performance.now() < 3000) {
        this.chunkLoader.update();
        //}
        //generateChunk();
        if (this.chunkLoader.hasChunk(Math.round(this.player.position.x), Math.round(this.player.position.z))) {
            try {
                const targetHeight = this.chunkLoader.heightAt(this.player.position.x, this.player.position.z) + 0.1;
                if (Number.isFinite(targetHeight)) {
                    if (this.player.onGround) {
                        if ((targetHeight - this.player.position.y) < 0.1) {
                            this.player.position.y += (targetHeight - this.player.position.y) / 5;
                        } else {
                            this.player.velocity.x *= -0.9;
                            this.player.velocity.z *= -0.9;
                            this.player.position.x += 2 * this.player.velocity.x;
                            this.player.position.z += 2 * this.player.velocity.z;
                        }
                    }
                    if ((this.player.position.y - targetHeight) > 0.1) {
                        this.player.onGround = false;
                    } else {
                        this.player.onGround = true;
                    }
                    if (this.player.onGround) {
                        this.player.hasBounced = false;
                    }
                    if (!this.player.onGround) {
                        this.player.velocity.y -= 0.0015;
                        if (this.chunkLoader.objectAbove(this.player.position.x, this.player.position.y, this.player.position.z, 0.1) && !this.player.hasBounced) {
                            this.player.hasBounced = true;
                            this.player.velocity.y *= -0.1;
                        }
                    }
                }
            } catch (e) {
                console.log(e);
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