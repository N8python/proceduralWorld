const wanderGoal = {
    name: "wander",
    update(agent) {
        if (Math.random() < 0.005 && agent.state.type === "idle") {
            agent.state = { type: "moveTo", memory: { speed: 0.0001, goal: { x: agent.mesh.position.x + (0.5 * Math.random() - 0.25), z: agent.mesh.position.z + (0.5 * Math.random() - 0.25) } } };
        }
    }
}