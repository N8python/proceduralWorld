const deathState = {
    name: "death",
    update(agent) {
        if (agent.mesh.animation.current !== "death") {
            agent.mesh.animation.play("death", 500, false);
        }
    }
}