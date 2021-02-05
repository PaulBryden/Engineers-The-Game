import {Entity} from './entity'

class BaseEntity extends Entity
{
    constructor(map: Phaser.Tilemaps.Tilemap, scene: Phaser.Scene, x: number, y: number)
    {
        super(map,"portrait_base","Base",scene,x,y,"home_base");
    }
}

export {BaseEntity};