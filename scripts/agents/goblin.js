class Goblin extends Entity {
    constructor(obj) {
        obj.rigged = true;
        super(obj)
        this.initiated = false;
        this.velocity = new THREE.Vector3();
        this.memory = {
            health: 100
        };
        this.goal = { type: "wander", memory: {} };
        this.state = { type: "idle", memory: {} };
    }
    async add(scene) {
        this.scene = scene;
        this.added = true;
        super.add(scene);
        /*scene.third.load.fbx(`./assets/models/enemies/goblin/Standing React Death Backward.fbx`).then(object => {
            console.log(JSON.stringify(object.animations[0]));
        });*/
        let objAdded = false;
        const weapon = this.scene.models.club.clone();
        weapon.scale.set(250, 250, 250);
        weapon.position.y = 125;
        this.mesh.traverse(child => {
            if (child.name === "mixamorigRightHand" && !objAdded) {
                child.add(weapon);
                objAdded = true;
            }
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        })
        scene.third.animationMixers.add(this.mesh.animation.mixer);
        const animsToLoad = ["idle", "big-hit", "light-hit-left", "light-hit-right", "med-hit-left", "med-hit-right", "walk", "run", "slash", "death"];
        for (const anim of animsToLoad) {
            const animText = await fetch(`./assets/models/enemies/goblin/animations/${anim}.json`);
            const animJson = await animText.json();
            const clip = THREE.AnimationClip.parse(animJson);
            clip.animName = anim;
            this.mesh.animation.add(anim, clip);
        }
        // this.mesh.animation.play("idle");
        this.mesh.animationMixer.addEventListener("loop", (e) => {
            if (this.goalManager.onAnimationEnd) {
                this.goalManager.onAnimationEnd(this, e);
                this.updateStateManager();
                this.updateGoalManager();
            }
            if (e.action.getClip().animName.includes("hit")) {
                //this.mesh.animation.play("idle", 100);
            }
        });
        this.onGround = true;
        this.initiated = true;
    }
    updateStateManager() {
        this.stateManager = states.find(state => state.name === this.state.type);
    }
    updateGoalManager() {
        this.goalManager = goals.find(goal => goal.name === this.goal.type);
    }
    update() {
        this.updateStateManager();
        this.updateGoalManager();
        this.stateManager.update(this);
        this.goalManager.update(this);
        this.mesh.position.add(this.velocity);
        this.velocity.multiplyScalar(0.95);
        this.memory.health = Math.min(Math.max(this.memory.health, 0), 100);
        if (this.memory.health <= 0 && this.goal.type !== "death") {
            this.goal = { type: "death", memory: {} };
        }
        if (this.scene.chunkLoader.hasChunk(Math.round(this.mesh.position.x), Math.round(this.mesh.position.z))) {
            try {
                const theGeometry = this.scene.chunkLoader.chunkAt(Math.round(this.mesh.position.x), Math.round(this.mesh.position.z)).mesh.geometry;
                const segments = theGeometry.parameters.widthSegments;
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
                offsetX = Math.ceil(offsetX * segments);
                offsetY = Math.ceil(offsetY * segments);
                const idx = offsetY * (segments + 1) + offsetX;
                const targetHeight = -theGeometry.attributes.position.getZ(idx);
                if (Number.isFinite(this.mesh.position.y)) {
                    if (this.onGround) {
                        this.mesh.position.y += (targetHeight - this.mesh.position.y) / 3;
                    }
                    if ((this.mesh.position.y - targetHeight) > 0) {
                        this.onGround = false;
                    } else {
                        if (this.onGround === false) {
                            this.velocity.y *= 0.2;
                        }
                        this.onGround = true;
                    }
                    if (!this.onGround) {
                        this.velocity.y -= 0.0015;
                    }
                    /*if (this.onGround) {
                        if ((targetHeight - this.player.position.y) < 0.2) {
                            this.player.position.y += (targetHeight - this.player.position.y) / 10;
                        } else {
                            this.velocity.x *= -0.9;
                            this.velocity.z *= -0.9;
                            this.player.position.x += 2 * this.velocity.x;
                            this.player.position.z += 2 * this.velocity.z;
                        }
                    }
                    if ((this.player.position.y - targetHeight) > 0.2) {
                        this.onGround = false;
                    } else {
                        this.onGround = true;
                    }
                    if (this.onGround) {
                        this.hasBounced = false;
                    }
                    if (!this.onGround) {
                        this.velocity.y -= 0.0015;
                        if (this.scene.chunkLoader.objectAbove(this.player.position.x, this.player.position.y, this.player.position.z, 0.2) && !this.hasBounced) {
                            this.hasBounced = true;
                            this.velocity.y *= -0.1;
                        }
                    }*/
                }
            } catch (e) {}
        }
    }
    hit(power, theta, source) {
        theta += (0.05 * Math.random() - 0.025);
        power *= 0.8 + 0.4 * Math.random();
        let dir = Math.random() < 0.5 ? "right" : "left";
        let transition = 100 + 300 * Math.random();
        if (this.mesh.animation.current !== "death") {
            if (power > 1.5) {
                if (this.mesh.animation.current === "big-hit") {
                    this.mesh.animation.play("med-hit-" + dir, transition);
                } else {
                    this.mesh.animation.play("big-hit", transition);
                }
            } else if (power > 1) {
                if (this.mesh.animation.current.startsWith("med-hit-")) {
                    this.mesh.animation.play("light-hit-" + dir, transition);
                } else {
                    this.mesh.animation.play("med-hit-" + dir, transition);
                }
            } else if (power > 0.5) {
                if (this.mesh.animation.current.startsWith("light-hit-")) {
                    this.mesh.animation.play("med-hit-" + dir, transition);
                } else {
                    this.mesh.animation.play("light-hit-" + dir, transition);
                }
                //this.mesh.animation.play("light-hit-right", 100);
            }
        }
        this.velocity.x += 0.015 * power * Math.sin(theta);
        this.velocity.z += 0.015 * power * Math.cos(theta);
        this.velocity.y += 0.01 * power;
        if (source === this.scene.player && this.mesh.animation.current !== "death") {
            this.goal = { type: "attack", memory: { target: this.scene.player } }
            this.scene.playerController.cameraShakeTick = 7;
        }
        this.memory.health -= (Math.random() * 5 * power) + 10;
    }
}