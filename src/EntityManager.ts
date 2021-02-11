import 'phaser'
import {EngineerEntity} from './engineer_entity'
import {BaseEntity} from './base_entity'
import {Entity} from './entity'
import {MineEntity} from './mine_entity'

import {EventEmitterSingleton} from './EventEmitterSingleton'
import {SoundConstants, EventConstants, CompassDirections, EntityConstants} from './GameConstants'
class EntityManager
{
    scene:Phaser.Scene;
    entityList:Entity[]
    map:Phaser.Tilemaps.Tilemap
    eventEmitter:EventEmitterSingleton;

    constructor(scene:Phaser.Scene, map:Phaser.Tilemaps.Tilemap)
    {
        this.scene = scene;
        this.map = map;
        this.entityList = new Array();
        this.eventEmitter = EventEmitterSingleton.getInstance();
        this.eventEmitter.on(EventConstants.EntityBuild.CreateEngineer,(vector)=>{this.createEngineerEntity(vector.x,vector.y)});
    }

    createEngineerEntity(x:number,y:number) : EngineerEntity//tile coordinates 
    {
        let engineer:EngineerEntity = new EngineerEntity(this.map,this.scene,x,y);
        this.entityList.push(engineer);
        return engineer;

    }

    createBaseEntity(x:number,y:number) : BaseEntity//tile coordinates 
    {
        let base:BaseEntity = new BaseEntity(this.map,this.scene,x,y);
        this.entityList.push(base);
        return base;

    }
    createMineEntity(x:number,y:number) : MineEntity//tile coordinates 
    {
        let base:MineEntity = new MineEntity(this.map,this.scene,x,y);
        this.entityList.push(base);
        return base;

    }

    deleteEntity(entity:Entity)
    {
        let index = this.entityList.indexOf(entity);
        entity.destroy();
        if(index !== -1) {
            this.entityList.splice(index, 1);
        }
    }

    update()
    {
        this.entityList.forEach(element => element.updateRenderDepth());
    }

}

export {EntityManager}