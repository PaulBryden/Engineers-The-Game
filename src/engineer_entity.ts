import {Entity} from './entity'

class EngineerEntity extends Entity
{
    constructor(map: Phaser.Tilemaps.Tilemap, scene: Phaser.Scene, x: number, y: number)
    {
        super(map,"Portrait_Engineer","Engineer",scene,x,y,"player");
    }
}

export {EngineerEntity};