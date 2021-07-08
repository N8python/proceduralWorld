const deathGoal = {
    name: "death",
    update(agent) {
        if (agent.goal.memory.attackTime === undefined) {
            agent.goal.memory.attackTime = 0;
        }
        if (agent.state.type !== "death") {
            agent.mesh.traverse(child => {
                if ((child.isMesh || child.isSprite) && child.material) {
                    child.material = child.material.clone();
                }
            });
            agent.state = { type: "death", memory: {} };
        }
        agent.goal.memory.attackTime += agent.scene.delta;
        let timeToDespawn = false;
        if (agent.goal.memory.attackTime > 3000) {
            agent.mesh.traverse(child => {
                if ((child.isMesh || child.isSprite) && child.material) {
                    child.material.transparent = true;
                    child.material.opacity -= 0.01;
                    if (child.material.opacity <= -0.1) {
                        timeToDespawn = true;
                    }
                }
            })
        }
        if (timeToDespawn) {
            const agentIndex = agent.scene.entities.indexOf(agent);
            if (agentIndex >= 0) {
                agent.scene.entities.splice(agentIndex, 1);
            }
            agent.remove(agent.scene);
        }
    },
    /*onAnimationEnd(agent, e) {
        if (e.action.getClip().animName === "death" && agent.mesh.visible === true) {
            const agentIndex = agent.scene.entities.indexOf(agent);
            if (agentIndex >= 0) {
                agent.scene.entities.splice(agentIndex, 1);
            }
            agent.remove(agent.scene);
        }
    }*/
}