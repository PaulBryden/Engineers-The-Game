import { EntityManager } from "./EntityManager"
import { EventEmitterSingleton } from "./EventEmitterSingleton";

class AIPlayer 
{
    entityManager: EntityManager;
    teamNumber: number;

    
    constructor(entityManager: EntityManager, teamNumber: number) {
        this.entityManager = entityManager;
        this.teamNumber = teamNumber;
    }
}

export {AIPlayer}