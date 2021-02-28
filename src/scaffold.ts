import {Entity} from './entity'
import { typestate } from 'typestate';
import {EventConstants} from './GameConstants'
import { EasyStarGroundLevelSingleton, Path } from './EasyStarSingleton';
import { BuildingEntity } from './building_entity';
import { EngineerEntity } from './engineer_entity';

class ScaffoldEntity extends BuildingEntity
{
    desiredBuilding:string;
    desiredBuildingCoordinates:Phaser.Math.Vector2;
    buildingCompletionProgress:number;
    buildingCompletionTarget:number;
    constructor(map: Phaser.Tilemaps.Tilemap, scene: Phaser.Scene, x: number, y: number, desiredBuilding:string)
    {
        super(map,"scaffold","desiredBuilding",scene,x,y,"scaffold");
        this.desiredBuilding=desiredBuilding;
        this.desiredBuildingCoordinates = new Phaser.Math.Vector2(x,y);
        this.status="...";
        this.buildingCompletionTarget=10;
        this.buildingCompletionProgress=0;
    }

    increaseBuildingCompletionProgress() : boolean
    {
        this.buildingCompletionProgress++;
        if(this.buildingCompletionProgress>=this.buildingCompletionTarget)
        {
            this.eventEmitter.emit(EventConstants.EntityBuild.DestroyScaffold,this);
            this.eventEmitter.emit(EventConstants.EntityBuild.CreateBuilding,this.desiredBuildingCoordinates.x,this.desiredBuildingCoordinates.y,this.desiredBuilding);
            return true;
        }
        return false;
    }

    

}

export {ScaffoldEntity};