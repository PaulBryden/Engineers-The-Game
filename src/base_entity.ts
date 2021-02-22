import {Entity} from './entity'
import { typestate } from 'typestate';
import {EventConstants} from './GameConstants'
import {BuildingEntity} from './building_entity'
import { BuildUnitsEntity } from './build_units_entity';

class BaseEntity extends BuildUnitsEntity
{
    constructor(map: Phaser.Tilemaps.Tilemap, scene: Phaser.Scene, x: number, y: number)
    {
        super(map,"home_base","Base",scene,x,y,EventConstants.Input.BuildEngineer,EventConstants.EntityBuild.CreateEngineer,"home_base");
    }

}

export {BaseEntity};