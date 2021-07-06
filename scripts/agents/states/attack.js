const attackState = {
    name: "attack",
    update(agent) {
        if (agent.mesh.animation.current !== "slash") {
            agent.mesh.animation.play("slash");
        }
    }
}