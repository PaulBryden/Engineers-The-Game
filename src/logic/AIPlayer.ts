import { BaseEntity } from "../units/BaseEntity";
import { EngineerEntity } from "../units/EngineerEntity";
import { Entity } from "../units/Entity";
import { EntityManager } from "./EntityManager"
import { EventEmitterSingleton } from "./EventEmitterSingleton";
import { FactoryEntity } from "../units/FactoryEntity";
import { BuildingEntityID, EntityID, EventConstants, TeamNumbers } from "./GameConstants";
import { GliderEntity } from "../units/GliderEntity";

class AIPlayer 
{
    entityManager: EntityManager;
    teamNumber: number;
    engineerCount: number;
    enemyTeam: number;
    running: boolean;

    
    constructor(entityManager: EntityManager, teamNumber: number, enemyTeamNumber) {
        this.entityManager = entityManager;
        this.teamNumber = teamNumber;
        this.enemyTeam = enemyTeamNumber;
        this.engineerCount =  Math.floor(Math.random()*10)+6;
        this.running = true;
        this.MiningFSM();

        this.BuildingFSM();
        
        this.AttackingFSM();

    }

     BuildingFSM()
    {
        if(this.running)
        {
        var Engineers = this.entityManager.getAllEntitiesByTypeAndTeam(EntityID.Engineer, this.teamNumber);
        var Bases = this.entityManager.getAllEntitiesByTypeAndTeam(BuildingEntityID.Base, this.teamNumber);
        var Factories = this.entityManager.getAllEntitiesByTypeAndTeam(BuildingEntityID.Factory, this.teamNumber);
        if(this.entityManager.resources.get(this.teamNumber)>100 && Engineers.length<this.engineerCount)
        {
            if(Bases.length>0)
            {
                Bases.forEach(element => {
                    if(element.getStatus()!=EventConstants.BuildingStates.Building){
                    EventEmitterSingleton.getInstance().emit(EventConstants.Input.BuildEngineer, element, this.teamNumber)}});
            }
        }
        else if(this.entityManager.resources.get(this.teamNumber)>300)
        {
            if(Math.random()>0.9)
            {
                if(Engineers[0]!=undefined && Engineers[0].getStatus()!="Building")
                {
                
                    EventEmitterSingleton.getInstance().emit(EventConstants.Input.RequestBuildScaffold,Engineers[0],BuildingEntityID.Turret,  this.teamNumber);
                
                }
            }
            else
            {
                if(Factories.length>0)
                {
                    if((<FactoryEntity>Factories[0]).getStatus()!=EventConstants.BuildingStates.Building)
                    {
                        EventEmitterSingleton.getInstance().emit(EventConstants.Input.BuildGlider, <FactoryEntity>(Factories[0]), this.teamNumber);
                    }
                }
                else
                {
                    EventEmitterSingleton.getInstance().emit(EventConstants.Input.RequestBuildScaffold,Engineers[0],BuildingEntityID.Factory,  this.teamNumber);
                }
            }
        } 
        var tweens = [];
       
        tweens.push({
            targets:{},
            NOTHING: { value: 0, duration:800 },
            onComplete: () => { 
                this.BuildingFSM() }
        });

        this.entityManager.scene.tweens.timeline({
            tweens: tweens
        });
            
    }
    }

    AttackingFSM()
    {

        if(this.running)
        {

        var Gliders = this.entityManager.getAllEntitiesByTypeAndTeam(EntityID.Glider, this.teamNumber);
        var enemyTurrets = this.entityManager.getAllEntitiesByTypeAndTeam(BuildingEntityID.Turret, this.enemyTeam);
        var enemyGliders = this.entityManager.getAllEntitiesByTypeAndTeam(EntityID.Glider, this.enemyTeam);
        var enemyBases = this.entityManager.getAllEntitiesByTypeAndTeam(BuildingEntityID.Base, this.enemyTeam);
        var enemyEngineers = this.entityManager.getAllEntitiesByTypeAndTeam(EntityID.Engineer, this.enemyTeam);
        var enemyFactories= this.entityManager.getAllEntitiesByTypeAndTeam(BuildingEntityID.Factory, this.enemyTeam);
        if(this.entityManager.resources.get(this.teamNumber)>0)
        {
            if(Gliders.length>=2)
            {
                Gliders.forEach( glider => { if(glider.getStatus()!="Attacking"){ 
                    if(enemyTurrets.length>=1)
                    {
                        (<GliderEntity>glider).requestAttack(this.getNearestToEntity(glider,enemyTurrets));
                    }
                    else if(enemyGliders.length>=1)
                    {
                        (<GliderEntity>glider).requestAttack(enemyGliders[0]);

                    }else if(enemyEngineers.length>=1)
                    {
                        (<GliderEntity>glider).requestAttack(enemyEngineers[0]);

                    }else if(enemyBases.length>=1)
                    {
                        (<GliderEntity>glider).requestAttack(enemyBases[0]);

                    }else if(enemyFactories.length>=1)
                    {
                        (<GliderEntity>glider).requestAttack(enemyFactories[0]);

                    }
                   
                return}});
            }
            else
            {
                Gliders.forEach(glider => { if(glider.getStatus()=="Attacking"){ 
                    if(enemyTurrets.length>=1)
                    {
                        (<GliderEntity>glider).requestAttack(this.getNearestToEntity(glider,enemyTurrets));
                    }
                    else if(enemyGliders.length>=1)
                    {
                        (<GliderEntity>glider).requestAttack(enemyGliders[0]);

                    }else if(enemyEngineers.length>=1)
                    {
                        (<GliderEntity>glider).requestAttack(enemyEngineers[0]);

                    }else if(enemyBases.length>=1)
                    {
                        (<GliderEntity>glider).requestAttack(enemyBases[0]);

                    }else if(enemyFactories.length>=1)
                    {
                        (<GliderEntity>glider).requestAttack(enemyFactories[0]);

                    }
                   
                return}});
            }
        }
        //...        
        var tweens = [];
       
        tweens.push({
            targets:{},
            NOTHING: { value: 0, duration:800 },
            onComplete: () => { 
                this.AttackingFSM() }
        });

        this.entityManager.scene.tweens.timeline({
            tweens: tweens
        });
        }
    }

    MiningFSM()
    {
        if(this.running)
        {
        var Engineers = this.entityManager.getAllEntitiesByTypeAndTeam(EntityID.Engineer, this.teamNumber);
        var Mines = this.entityManager.getAllEntitiesByTypeAndTeam(BuildingEntityID.Mine, TeamNumbers.Neutral);
        Engineers.forEach(element => {
            if(element.getStatus()=="Idle")
            {
                var nearestMine;
                Mines.forEach(mine=> {
                    if(nearestMine==undefined)
                    {
                        nearestMine=mine;
                    }
                    else if(new Phaser.Math.Vector2(mine.x,mine.y).distance(new Phaser.Math.Vector2(element.x,element.y))<new Phaser.Math.Vector2(nearestMine.x,nearestMine.y).distance(new Phaser.Math.Vector2(element.x,element.y)))
                    {
                        nearestMine=mine;
                    }
                });
                (<EngineerEntity>element).requestMine(nearestMine);
            }
        });
        var tweens = [];
       
        tweens.push({
            targets:{},
            NOTHING: { value: 0, duration:800 },
            onComplete: () => { 
                this.MiningFSM(); }
        });

        this.entityManager.scene.tweens.timeline({
            tweens: tweens
        });
            
    }
    }

    getNearestToEntity(entity1: Entity, entityList: Entity[])
    {
        if(entityList.length>0)
        {
            let nearestEntity: Entity = entityList[0];
            entityList.forEach(nearEntity=> {
                if(nearestEntity==undefined)
                {
                    nearestEntity=nearEntity;
                }
                else if(new Phaser.Math.Vector2(nearEntity.x,nearEntity.y).distance(new Phaser.Math.Vector2(entity1.x,entity1.y))<new Phaser.Math.Vector2(nearestEntity.x,nearestEntity.y).distance(new Phaser.Math.Vector2(entity1.x,entity1.y)))
                {
                    nearestEntity=nearEntity;
                }
            });
            return nearestEntity;
        }

    }
    
    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


}

export {AIPlayer}