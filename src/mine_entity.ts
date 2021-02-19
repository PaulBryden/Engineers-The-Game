import {Entity} from './entity'
import { typestate } from 'typestate';
import {EventConstants} from './GameConstants'
import { EasyStarGroundLevelSingleton, Path } from './EasyStarSingleton';
import { BuildingEntity } from './building_entity';

class MineEntity extends BuildingEntity
{
    constructor(map: Phaser.Tilemaps.Tilemap, scene: Phaser.Scene, x: number, y: number)
    {
        super(map,"mine","Mine",scene,x,y,"mine");
        this.status="Operating";
    }

}

export {MineEntity};