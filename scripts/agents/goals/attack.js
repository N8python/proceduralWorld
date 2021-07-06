const attackGoal = {
    name: "attack",
    update(agent) {
        if (agent.goal.memory.attackTime === undefined) {
            agent.goal.memory.attackTime = 0;
            agent.goal.memory.hasAttacked = false;
        }
        const target = agent.goal.memory.target.mesh.position;
        if (Math.hypot(target.x - agent.mesh.position.x, target.z - agent.mesh.position.z) > 0.3) {
            agent.goal.memory.attackTime = 0;
            agent.goal.memory.hasAttacked = false;
            agent.state = { type: "moveTo", memory: { speed: 0.0005, goal: { x: target.x, z: target.z } } };
        } else {
            agent.goal.memory.attackTime += agent.scene.delta;
            if (agent.goal.memory.attackTime >= 500 && !agent.goal.memory.hasAttacked) {
                if (Math.hypot(target.x - agent.mesh.position.x, target.z - agent.mesh.position.z) <= 0.3 && Math.abs(target.y - agent.mesh.position.y) < 0.4) {
                    agent.goal.memory.target.hit(1.5, agent.mesh.rotation.y, agent);
                }
                agent.goal.memory.hasAttacked = true;
            }
            const angleToTarget = Math.atan2(target.x - agent.mesh.position.x, target.z - agent.mesh.position.z);
            agent.mesh.rotation.y += (angleToTarget - agent.mesh.rotation.y) / 10;
            agent.state = { type: "attack", memory: { goal: { x: target.x, z: target.z } } };
        }
    },
    onAnimationEnd(agent, e) {
        if (e.action.getClip().animName === "slash") {
            agent.goal.memory.attackTime = 0;
            agent.goal.memory.hasAttacked = false;
        }
    }
}