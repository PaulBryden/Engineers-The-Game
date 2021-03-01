import 'phaser'
import { EngineerEntity } from './engineer_entity'
import { BaseEntity } from './base_entity'
import { Entity } from './entity'
import { MineEntity } from './mine_entity'

import { EventEmitterSingleton } from './EventEmitterSingleton'
import { SoundConstants, EventConstants, CompassDirections, EntityConstants, StartOfGame, EntityID, BuildingEntityID } from './GameConstants'
import { TurretEntity } from './turret_entity'
import { GliderEntity } from './glider_entity'
import { FactoryEntity } from './factory_entity'
import { ScaffoldEntity } from './scaffold'
class EntityManager {
    scene: Phaser.Scene;
    entityList: Entity[]
    map: Phaser.Tilemaps.Tilemap
    eventEmitter: EventEmitterSingleton;
    resources: number;

    constructor(scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap) {
        this.scene = scene;
        this.map = map;
        this.entityList = new Array();
        this.eventEmitter = EventEmitterSingleton.getInstance();
        this.eventEmitter.on(EventConstants.EntityBuild.CreateEngineer, (vector) => { this.createEngineerEntity(vector.x, vector.y,1) });
        this.eventEmitter.on(EventConstants.EntityBuild.CreateGlider, (vector) => { this.createGliderEntity(vector.x, vector.y,1) });

        this.resources = StartOfGame.resourceCount;

        this.eventEmitter.emit(EventConstants.EntityBuild.DestroyScaffold);
        this.eventEmitter.emit(EventConstants.EntityBuild.CreateBuilding);
        this.eventEmitter.on(EventConstants.EntityBuild.DestroyScaffold, (scaffold) => { this.deleteEntity(scaffold); });
        this.eventEmitter.on(EventConstants.EntityBuild.CreateBuilding, (x, y, entityName) => { this.createEntity(x, y, entityName,1) });
        this.eventEmitter.on(EventConstants.Input.RequestBuildScaffold, (entity, buildingID) => { 
            if(buildingID==BuildingEntityID.Base)
            {
                if (this.resources >= 500) {
                    this.resources -= 500;
                    this.eventEmitter.emit(EventConstants.Game.UpdateResourceCount, (this.resources));
                }
                else
                {
                    return;
                }

            }
            else if(buildingID==BuildingEntityID.Factory)
            {
                if (this.resources >= 300) 
                {
                    this.resources -= 300;
                    this.eventEmitter.emit(EventConstants.Game.UpdateResourceCount, (this.resources));
                }
                else
                {
                    return;
                }
                
            }
            let scaffold:ScaffoldEntity = this.createScaffoldEntity(entity.GetTileLocation().x, entity.GetTileLocation().y, buildingID,1);
            entity.requestBuild(scaffold);
        });

        this.eventEmitter.on(EventConstants.Game.AddResources, (resources) => { this.resources += resources; this.eventEmitter.emit(EventConstants.Game.UpdateResourceCount, (this.resources)); });
        this.eventEmitter.on(EventConstants.Game.RemoveResources, (resources) => { this.resources -= resources; this.eventEmitter.emit(EventConstants.Game.UpdateResourceCount, (this.resources)); });
        this.eventEmitter.on(EventConstants.Input.RequestBuildEngineer, () => {
            if (this.resources >= 100) {
                this.resources -= 100;
                this.eventEmitter.emit(EventConstants.Game.UpdateResourceCount, (this.resources));
                this.eventEmitter.emit(EventConstants.Input.BuildEngineer, {});
            }
        });
        this.eventEmitter.on(EventConstants.Input.RequestCancelEngineer, () => {
            this.resources += 100;
            this.eventEmitter.emit(EventConstants.Input.Cancel, {});
            this.eventEmitter.emit(EventConstants.Game.UpdateResourceCount, (this.resources));
        });
        this.eventEmitter.on(EventConstants.Input.RequestBuildGlider, () => {
            if (this.resources >= 300) {
                this.resources -= 300;
                this.eventEmitter.emit(EventConstants.Game.UpdateResourceCount, (this.resources));
                this.eventEmitter.emit(EventConstants.Input.BuildGlider, {});
            }
        });
        this.eventEmitter.on(EventConstants.Input.RequestCancelGlider, () => {
            this.resources += 300;
            this.eventEmitter.emit(EventConstants.Input.Cancel, {});
            this.eventEmitter.emit(EventConstants.Game.UpdateResourceCount, (this.resources));
        });

    }

    getNearestBaseToEntity(entity: Entity): BaseEntity {
        let nearestBase: BaseEntity;
        for (let item of this.entityList) {
            if (item instanceof BaseEntity) {
                if (nearestBase == null) {
                    nearestBase = item;
                } else {
                    if ((new Phaser.Math.Vector2(nearestBase.x, nearestBase.y)).distance(new Phaser.Math.Vector2(entity.x, entity.y)) > (new Phaser.Math.Vector2(item.x, item.y)).distance(new Phaser.Math.Vector2(entity.x, entity.y))) {
                        nearestBase = item;
                    }
                }
            }
        }
        return nearestBase;
    }

    createEntity(x: number, y: number, type: string, team:number) {
        switch (type) {
            case BuildingEntityID.Base:
                this.createBaseEntity(x, y, team);
                break;
            case BuildingEntityID.Factory:
                this.createFactoryEntity(x, y, team);
                break;
        }
    }

    createEngineerEntity(x: number, y: number, team:number): EngineerEntity//tile coordinates 
    {
        let engineer: EngineerEntity = new EngineerEntity(this.map, this.scene, x, y, team);
        this.entityList.push(engineer);
        engineer.updateNearestBase(this.getNearestBaseToEntity(engineer));
        return engineer;

    }

    createBaseEntity(x: number, y: number, team:number): BaseEntity//tile coordinates 
    {
        let base: BaseEntity = new BaseEntity(this.map, this.scene, x, y, team);
        this.entityList.push(base);
        return base;

    }
    createMineEntity(x: number, y: number): MineEntity//tile coordinates 
    {
        let base: MineEntity = new MineEntity(this.map, this.scene, x, y);
        this.entityList.push(base);
        return base;

    }
    createTurretEntity(x: number, y: number, team:number): TurretEntity//tile coordinates 
    {
        let base: TurretEntity = new TurretEntity(this.map, this.scene, x, y, team);
        this.entityList.push(base);
        return base;

    }
    createScaffoldEntity(x: number, y: number, targetBuilding: string, team:number): ScaffoldEntity//tile coordinates 
    {
        let base: ScaffoldEntity = new ScaffoldEntity(this.map, this.scene, x, y, targetBuilding, team);
        this.entityList.push(base);
        return base;

    }
    createGliderEntity(x: number, y: number, team:number): TurretEntity//tile coordinates 
    {
        let base: GliderEntity = new GliderEntity(this.map, this.scene, x, y, team);
        this.entityList.push(base);
        return base;

    }
    createFactoryEntity(x: number, y: number, team:number): FactoryEntity//tile coordinates 
    {
        let base: FactoryEntity = new FactoryEntity(this.map, this.scene, x, y, team);
        this.entityList.push(base);
        return base;

    }

    deleteEntity(entity: Entity) {
        let index = this.entityList.indexOf(entity);
        entity.destroy();
        if (index !== -1) {
            this.entityList.splice(index, 1);
        }
    }

    update() {
        this.entityList.forEach(element => element.updateRenderDepth());
    }

}

export { EntityManager }