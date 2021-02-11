import {Entity} from './entity'
import { typestate } from 'typestate';
import {EventConstants} from './GameConstants'

class MineEntity extends Entity
{
    constructor(map: Phaser.Tilemaps.Tilemap, scene: Phaser.Scene, x: number, y: number)
    {
        super(map,"portrait_base","Mine",scene,x,y,"mine");
    }

}

export {MineEntity};