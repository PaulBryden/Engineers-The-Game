import {Entity} from './entity'
import { typestate } from 'typestate';
import {EventConstants} from './GameConstants'
import { EasyStarGroundLevelSingleton, Path } from './EasyStarSingleton';
import { BuildingEntity } from './building_entity';

class MineEntity extends BuildingEntity
{
    constructor(map: Phaser.Tilemaps.Tilemap, scene: Phaser.Scene, x: number, y: number)
    {
        super(map,"mine","Mine",scene,x,y,"mine",0);
        this.status="Operating";
        
        this.healthForegroundRectangle.setVisible(false);
        this.healthBackgroundRectangle.setVisible(false);
        this.blockedTiles.push(new Phaser.Math.Vector2(x-1,y));
        this.blockedTiles.push(new Phaser.Math.Vector2(x-2,y));
        this.blockedTiles.push(new Phaser.Math.Vector2(x-1,y-1));
        this.blockedTiles.push(new Phaser.Math.Vector2(x-2,y-1));
        this.avoidAdditionalPoints();
        this.blockedTiles.push(new Phaser.Math.Vector2(x-3,y));
    }

}

export {MineEntity};