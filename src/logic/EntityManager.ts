import 'phaser';
import { EngineerEntity } from '../units/EngineerEntity';
import { BaseEntity } from '../units/BaseEntity';
import { Entity } from '../units/Entity';
import { MineEntity } from '../units/MineEntity';

import { EventEmitterSingleton } from './EventEmitterSingleton';
import { SoundConstants, EventConstants, CompassDirections, EntityConstants, StartOfGame, EntityID, BuildingEntityID, TeamNumbers, GameStatus } from './GameConstants';
import { TurretEntity } from '../units/TurretEntity';
import { GliderEntity } from '../units/GliderEntity';
import { FactoryEntity } from '../units/FactoryEntity';
import { ScaffoldEntity } from '../units/ScaffoldEntity';
import { BuildUnitsEntity } from '../units/BuildUnitsEntity';
import { EasyStarGroundLevelSingleton } from './EasyStarSingleton';
import { BuildingEntity } from '../units/BuildingEntity';
import { AudioEffectsSingleton } from '../audio/AudioEffectsSingleton';
class EntityManager 
{
    scene: Phaser.Scene;
    entityList: Entity[]
    map: Phaser.Tilemaps.Tilemap
    eventEmitter: EventEmitterSingleton;
    resources: Map<number, number>;
    fogOfWar: Phaser.GameObjects.RenderTexture;
    fogOfWarMasks: Phaser.GameObjects.Container;
    constructor(scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap, fogOfWar: Phaser.GameObjects.RenderTexture) 
    {
        this.scene = scene;
        this.map = map;
        this.entityList = [];
        this.eventEmitter = EventEmitterSingleton.getInstance();
        this.resources = new Map();
        this.eventEmitter.on(EventConstants.EntityBuild.CreateEngineer, (vector, teamNumber) => 
        {
            this.createEngineerEntity(vector.x, vector.y, teamNumber); 
        });
        this.eventEmitter.on(EventConstants.EntityBuild.CreateGlider, (vector, teamNumber) => 
        {
            this.createGliderEntity(vector.x, vector.y, teamNumber); 
        });
        this.eventEmitter.on(EventConstants.Game.DestroyEntity, (entity) => 
        {
            this.deleteEntity(entity); 
        });
        this.resources.set(TeamNumbers.Enemy, StartOfGame.resourceCount);
        this.resources.set(TeamNumbers.Player, StartOfGame.resourceCount);
        EventEmitterSingleton.getInstance().emit(EventConstants.Game.UpdateResourceCount, this.resources.get(TeamNumbers.Player), TeamNumbers.Player);
        EventEmitterSingleton.getInstance().emit(EventConstants.Game.UpdateResourceCount, this.resources.get(TeamNumbers.Enemy), TeamNumbers.Enemy);

        this.fogOfWar = fogOfWar;
        this.fogOfWarMasks = this.scene.make.container({ x: 0, y: 0 }, false);

        this.eventEmitter.on(EventConstants.EntityBuild.DestroyScaffold, (scaffold) => 
        {
            this.deleteEntity(scaffold); 
        });
        this.eventEmitter.on(EventConstants.EntityBuild.CreateBuilding, (x, y, entityName, teamNumber) => 
        {
            this.createEntity(x, y, entityName, teamNumber); 
        });
        this.eventEmitter.on(EventConstants.Input.RequestBuildScaffold, (entity, buildingID, teamNumber) => 
        {
            let continueWithBuild = true;
            const buildLocationsEasyStar: Phaser.Math.Vector2[] = [new Phaser.Math.Vector2(entity.GetTileLocation().x - 1, entity.GetTileLocation().y), new Phaser.Math.Vector2(entity.GetTileLocation().x - 2, entity.GetTileLocation().y), new Phaser.Math.Vector2(entity.GetTileLocation().x - 1, entity.GetTileLocation().y - 1), new Phaser.Math.Vector2(entity.GetTileLocation().x - 2, entity.GetTileLocation().y - 2)];
            this.entityList.forEach(element => 
            {
                if (element instanceof BuildingEntity) 
                {
                    (<BuildingEntity>element).blockedTiles.forEach(tile => 
                    {
                        buildLocationsEasyStar.forEach(buildTile => 
                        {
                            if (tile.equals(buildTile)) 
                            {
                                continueWithBuild = false;
                                if (teamNumber == TeamNumbers.Player) 
                                {
                                    AudioEffectsSingleton.getInstance(this.scene).Blocked.play();
                                }
                                return;
                            }
                        });
                    });
                }
            });
            if (!continueWithBuild) 
            {
                return;
            }
            if (buildingID == BuildingEntityID.Base) 
            {
                if (this.resources.get(teamNumber) >= 500) 
                {
                    this.resources.set(teamNumber, this.resources.get(teamNumber) - 500);
                    this.eventEmitter.emit(EventConstants.Game.UpdateResourceCount, this.resources.get(teamNumber), teamNumber);
                }
                else 
                {
                    return;
                }

            }
            else if (buildingID == BuildingEntityID.Factory) 
            {
                if (this.resources.get(teamNumber) >= 300) 
                {
                    this.resources.set(teamNumber, this.resources.get(teamNumber) - 300);
                    this.eventEmitter.emit(EventConstants.Game.UpdateResourceCount, this.resources.get(teamNumber), teamNumber);
                }
                else 
                {
                    return;
                }

            }
            else if (buildingID == BuildingEntityID.Turret) 
            {
                if (this.resources.get(teamNumber) >= 300) 
                {
                    this.resources.set(teamNumber, this.resources.get(teamNumber) - 300);
                    this.eventEmitter.emit(EventConstants.Game.UpdateResourceCount, this.resources.get(teamNumber), teamNumber);
                }
                else 
                {
                    return;
                }

            }
            const scaffold: ScaffoldEntity = this.createScaffoldEntity(entity.GetTileLocation().x, entity.GetTileLocation().y, buildingID, teamNumber);
            entity.requestBuild(scaffold);
        });

        this.eventEmitter.on(EventConstants.Game.AddResources, (resources, teamNumber) => 
        {
            this.resources.set(teamNumber, this.resources.get(teamNumber) + resources); this.eventEmitter.emit(EventConstants.Game.UpdateResourceCount, (this.resources.get(TeamNumbers.Player)), TeamNumbers.Player); 
        });
        this.eventEmitter.on(EventConstants.Game.RemoveResources, (resources, teamNumber) => 
        {
            this.resources.set(teamNumber, this.resources.get(teamNumber) - resources); this.eventEmitter.emit(EventConstants.Game.UpdateResourceCount, (this.resources.get(TeamNumbers.Player)), TeamNumbers.Player); 
        });
        this.eventEmitter.on(EventConstants.Input.BuildEngineer, (entity: BuildUnitsEntity, teamNumber) => 
        {
            if (this.resources.get(teamNumber) >= 100 && !(entity instanceof ScaffoldEntity)) 
            {
                this.resources.set(teamNumber, this.resources.get(teamNumber) - 100);
                entity.requestBuild();
                this.eventEmitter.emit(EventConstants.Game.UpdateResourceCount, this.resources.get(teamNumber), teamNumber);
            }
        });
        this.eventEmitter.on(EventConstants.Input.CancelEngineer, (entity: BuildUnitsEntity, teamNumber) => 
        {
            this.resources.set(teamNumber, this.resources.get(teamNumber) + 100);
            entity.requestCancel();
            this.eventEmitter.emit(EventConstants.Game.UpdateResourceCount, this.resources.get(teamNumber), teamNumber);
        });
        this.eventEmitter.on(EventConstants.Input.BuildGlider, (entity: BuildUnitsEntity, teamNumber) => 
        {
            if (this.resources.get(teamNumber) >= 300 && !(entity instanceof ScaffoldEntity)) 
            {
                this.resources.set(teamNumber, this.resources.get(teamNumber) - 300);
                entity.requestBuild();
                this.eventEmitter.emit(EventConstants.Game.UpdateResourceCount, this.resources.get(teamNumber), teamNumber);
            }
        });
        this.eventEmitter.on(EventConstants.Input.CancelGlider, (entity: BuildUnitsEntity, teamNumber) => 
        {
            this.resources.set(teamNumber, this.resources.get(teamNumber) + 300);
            entity.requestCancel();
            this.eventEmitter.emit(EventConstants.Game.UpdateResourceCount, this.resources.get(teamNumber), teamNumber);
        });

        if(GameStatus.ActiveGame) 
        {
            this.scene.tweens.add({
                targets: {},
                NOTHING: { value: 1, duration: 1000 },
                onComplete: () => 
                {
                    this.checkForWinnerTween();
                }});
        }
        

    }

    checkForWinnerTween() 
    {
        let localBuildingCount: number;
        let enemyBuildingCount: number;
        localBuildingCount = 0;
        enemyBuildingCount = 0;
        this.entityList.forEach(element => 
        {
            if (element instanceof BuildingEntity && element.team == TeamNumbers.Player) 
            {
                localBuildingCount++; 
            } 
            else if (element instanceof BuildingEntity && element.team == TeamNumbers.Enemy) 
            {
                enemyBuildingCount++; 
            } 
        });
        if (localBuildingCount == 0 && GameStatus.ActiveGame) 
        {
            EventEmitterSingleton.getInstance().emit(EventConstants.Game.Loser);
        }
        else if (enemyBuildingCount == 0 && GameStatus.ActiveGame) 
        {
            EventEmitterSingleton.getInstance().emit(EventConstants.Game.Winner);
        }
        if(enemyBuildingCount!=0 || localBuildingCount!-0) 
        {
            this.scene.tweens.add({
                targets: {},
                NOTHING: { value: 1, duration: 1000 },
                onComplete: () => 
                {
                    this.checkForWinnerTween();
    
                }});
        }
                
    }

    addToFogOfWarMasks(image: Phaser.GameObjects.Image) 
    {
        this.fogOfWarMasks.add(image);
        if(this.fogOfWar.mask) 
        {
            this.fogOfWar.mask.destroy();
            this.fogOfWar.clearMask(true);
        }
        this.fogOfWar.mask = new Phaser.Display.Masks.BitmapMask(this.scene, this.fogOfWarMasks);
        this.fogOfWar.mask.invertAlpha = true;
    }

    getNearestBaseToEntity(entity: Entity): BaseEntity 
    {
        let nearestBase: BaseEntity;
        for (const item of this.entityList) 
        {
            if (item instanceof BaseEntity) 
            {
                if (nearestBase == null) 
                {
                    nearestBase = item;
                }
                else 
                {
                    if ((new Phaser.Math.Vector2(nearestBase.x, nearestBase.y)).distance(new Phaser.Math.Vector2(entity.x, entity.y)) > (new Phaser.Math.Vector2(item.x, item.y)).distance(new Phaser.Math.Vector2(entity.x, entity.y))) 
                    {
                        nearestBase = item;
                    }
                }
            }
        }
        return nearestBase;
    }

    createEntity(x: number, y: number, type: string, team: number) 
    {
        switch (type) 
        {
        case BuildingEntityID.Base:
            this.createBaseEntity(x, y, team);
            break;
        case BuildingEntityID.Factory:
            this.createFactoryEntity(x, y, team);
            break;
        case BuildingEntityID.Turret:
            this.createTurretEntity(x, y, team);
            break;
        }
    }

    createEngineerEntity(x: number, y: number, team: number): EngineerEntity 
    { //tile coordinates
        const engineer: EngineerEntity = new EngineerEntity(this.map, this.scene, x, y, team);
        this.entityList.push(engineer);
        engineer.updateNearestBase(this.getNearestBaseToEntity(engineer));
        team == TeamNumbers.Player ? this.addToFogOfWarMasks(engineer.GetFogOfWarMask()) : () => 
        { };
        return engineer;

    }

    createBaseEntity(x: number, y: number, team: number): BaseEntity 
    {
        const base: BaseEntity = new BaseEntity(this.map, this.scene, x, y, team);
        this.entityList.push(base);
        team == TeamNumbers.Player ? this.addToFogOfWarMasks(base.GetFogOfWarMask()) : () => 
        { };
        return base;

    }
    createMineEntity(x: number, y: number): MineEntity 
    {
        const base: MineEntity = new MineEntity(this.map, this.scene, x, y);
        this.entityList.push(base);
        return base;

    }
    createTurretEntity(x: number, y: number, team: number): TurretEntity 
    {
        const base: TurretEntity = new TurretEntity(this.map, this.scene, x, y, team);
        this.entityList.push(base);
        team == TeamNumbers.Player ? this.addToFogOfWarMasks(base.GetFogOfWarMask()) : () => 
        { };
        return base;

    }
    createScaffoldEntity(x: number, y: number, targetBuilding: string, team: number): ScaffoldEntity 
    {
        const base: ScaffoldEntity = new ScaffoldEntity(this.map, this.scene, x, y, targetBuilding, team);
        this.entityList.push(base);
        team == TeamNumbers.Player ? this.addToFogOfWarMasks(base.GetFogOfWarMask()) : () => 
        { };
        return base;

    }
    createGliderEntity(x: number, y: number, team: number): GliderEntity
    {
        const base: GliderEntity = new GliderEntity(this.map, this.scene, x, y, team);
        this.entityList.push(base);
        team == TeamNumbers.Player ? this.addToFogOfWarMasks(base.GetFogOfWarMask()) : () => 
        { };
        return base;

    }
    createFactoryEntity(x: number, y: number, team: number): FactoryEntity
    {
        const base: FactoryEntity = new FactoryEntity(this.map, this.scene, x, y, team);
        this.entityList.push(base);
        team == TeamNumbers.Player ? this.addToFogOfWarMasks(base.GetFogOfWarMask()) : () => 
        { };
        return base;

    }

    deleteEntity(entity: Entity) 
    {
        const index = this.entityList.indexOf(entity);
        if (entity.selected) 
        {
            entity.selected = false;
            entity.health = 0;
            this.eventEmitter.emit(EventConstants.EntityActions.Selected, undefined);
        }
        this.fogOfWarMasks.remove(entity.GetFogOfWarMask());
        entity.destroy();
        if (index !== -1) 
        {
            this.entityList.splice(index, 1);
        }
    }

    getAllEntitiesByTypeAndTeam(name: string, team: number) 
    {
        const listOfEntities: Entity[] = [];
        this.entityList.forEach(element => 
        {
            if (element.name == name && element.team == team) 
            {
                listOfEntities.push(element); 
            } 
        });
        return listOfEntities;
    }

    deleteAllEntities() 
    {
        this.entityList.forEach(element => 
        { 
            this.fogOfWarMasks.remove(element.GetFogOfWarMask());
            element.destroy(); 
        });
        this.entityList = [];

    }

    update(delta) 
    {
        this.entityList.forEach(element => element.update(delta));
        this.entityList.forEach(element => 
        {
            if (element instanceof TurretEntity) 
            {
                if (element.targetEntity != undefined && new Phaser.Math.Vector2(element.targetEntity.x, element.targetEntity.y).distance(new Phaser.Math.Vector2(element.x, element.y)) < 200) 
                {
                    return;
                }
                else 
                {
                    element.targetEntity = undefined;
                }
                this.entityList.forEach(target => 
                {
                    this.entityList.forEach(target => 
                    {
                        if (target.team != element.team && target.team != TeamNumbers.Neutral) 
                        {
                            const distanceBetween: number = new Phaser.Math.Vector2(target.x, target.y).distance(new Phaser.Math.Vector2(element.x, element.y));
                            if ((distanceBetween < 200)) 
                            {
                                element.targetEntity = target;
                                return;
                            }
                        }
                    }
                    );
                }
                );
            }
        });
    }
}


export { EntityManager };