import {Entity} from './entity'
import { typestate } from 'typestate';
import {EventConstants} from './GameConstants'
import { EasyStarGroundLevelSingleton, Path } from './EasyStarSingleton';
import { BuildingEntity } from './building_entity';

class ScaffoldEntity extends BuildingEntity
{
    constructor(map: Phaser.Tilemaps.Tilemap, scene: Phaser.Scene, x: number, y: number)
    {
        super(map,"scaffold","Scaffold",scene,x,y,"scaffold");
        this.status="...";
    }

}

export {ScaffoldEntity};