import {Entity} from './Entity';
import { typestate } from 'typestate';
import {EventConstants} from '../logic/GameConstants';
import {BuildingEntity} from './BuildingEntity';
import { BuildUnitsEntity } from './BuildUnitsEntity';

class BaseEntity extends BuildUnitsEntity {
    constructor(map: Phaser.Tilemaps.Tilemap, scene: Phaser.Scene, x: number, y: number,team:number) {
        super(map,'home_base'+'-'+team,'Base',scene,x,y,EventConstants.Input.BuildEngineer,EventConstants.EntityBuild.CreateEngineer,'home_base'+'-'+team,team);
    }

}

export {BaseEntity};