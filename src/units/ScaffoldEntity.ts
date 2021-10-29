import {Entity} from './Entity';
import { typestate } from 'typestate';
import {BuildingEntityID, EventConstants} from '../logic/GameConstants';
import { EasyStarGroundLevelSingleton, Path } from '../logic/EasyStarSingleton';
import { BuildingEntity } from './BuildingEntity';
import { EngineerEntity } from './EngineerEntity';

class ScaffoldEntity extends BuildingEntity {
    desiredBuilding:string;
    desiredBuildingCoordinates:Phaser.Math.Vector2;
    buildingCompletionProgress:number;
    buildingCompletionTarget:number;
    constructor(map: Phaser.Tilemaps.Tilemap, scene: Phaser.Scene, x: number, y: number, desiredBuilding:string, team:number) {
        super(map,'scaffold',desiredBuilding,scene,x,y,'scaffold', team);
        this.desiredBuilding=desiredBuilding;
        this.desiredBuildingCoordinates = new Phaser.Math.Vector2(x,y);
        this.status='...';
        this.buildingCompletionTarget=10;
        this.buildingCompletionProgress=0;
        if(desiredBuilding==BuildingEntityID.Turret) {
            this.blockedTiles.push(new Phaser.Math.Vector2(x-1,y));
            this.setScale(0.5);
            this.y+=this.mapReference.layer.tileWidth/2;

        }
        else {
            this.blockedTiles.push(new Phaser.Math.Vector2(x-1,y));
            this.blockedTiles.push(new Phaser.Math.Vector2(x-2,y));
            this.blockedTiles.push(new Phaser.Math.Vector2(x-1,y-1));
            this.blockedTiles.push(new Phaser.Math.Vector2(x-2,y-1));
        }
        this.avoidAdditionalPoints();
    }

    increaseBuildingCompletionProgress() : boolean {
        this.buildingCompletionProgress++;
        if(this.buildingCompletionProgress>=this.buildingCompletionTarget) {
            this.eventEmitter.emit(EventConstants.EntityBuild.DestroyScaffold,this);
            this.eventEmitter.emit(EventConstants.EntityBuild.CreateBuilding,this.desiredBuildingCoordinates.x,this.desiredBuildingCoordinates.y,this.desiredBuilding, this.team);
            return true;
        }
        return false;
    }

    

}

export {ScaffoldEntity};