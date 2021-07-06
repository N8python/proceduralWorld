const moveToState = {
    name: "moveTo",
    update(agent) {
        let speedMultiplier = Math.min(Math.max((agent.memory.health + 20) / 100, 0.4), 1);
        let targetAnim = agent.state.memory.speed > 0.00015 ? "run" : "walk";
        if (agent.mesh.animation.current !== targetAnim) {
            agent.mesh.animation.play(targetAnim, 500);
        }
        const target = agent.state.memory.goal;
        let angleToTarget = Math.atan2(target.x - agent.mesh.position.x, target.z - agent.mesh.position.z);
        agent.scene.entities.forEach(entity => {
            const pos = entity.mesh.position;
            let angleToAvoid = Math.atan2(pos.x - agent.mesh.position.x, pos.z - agent.mesh.position.z);
            if (agent.mesh.position.distanceTo(entity.mesh.position) < 0.2) {
                angleToTarget += angleDifference(angleToAvoid, agent.mesh.rotation.y) / 10;
            }
        })
        agent.mesh.rotation.y += (angleToTarget - agent.mesh.rotation.y) / 10;
        if (Math.hypot(target.x - agent.mesh.position.x, target.z - agent.mesh.position.z) > 0.01) {
            //console.log(Math.hypot(target.x - agent.mesh.position.x, target.z - agent.mesh.position.z))
            agent.velocity.x += agent.state.memory.speed * agent.scene.timeScale * speedMultiplier * Math.sin(angleToTarget);
            agent.velocity.z += agent.state.memory.speed * agent.scene.timeScale * speedMultiplier * Math.cos(angleToTarget);
        } else {
            agent.state = { type: "idle", memory: {} };
        }
    }
}