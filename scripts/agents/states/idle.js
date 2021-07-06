const idleState = {
    name: "idle",
    update(agent) {
        if (agent.mesh.animation.current !== "idle") {
            agent.mesh.animation.play("idle");
        }
    }
};