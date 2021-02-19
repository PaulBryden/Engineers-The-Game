import {Entity} from './entity'
import { EasyStarGroundLevelSingleton, Path } from './EasyStarSingleton';

class BuildingEntity extends Entity
{
    constructor(map: Phaser.Tilemaps.Tilemap, icon: string, name:string, scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture, frame?: string | number)
    {
        super(map,icon,name,scene,x,y,texture);
        EasyStarGroundLevelSingleton.getInstance().avoidAdditionalPoint(x-1,y);
        EasyStarGroundLevelSingleton.getInstance().avoidAdditionalPoint(x-2,y);
        EasyStarGroundLevelSingleton.getInstance().avoidAdditionalPoint(x-1,y-1);
        EasyStarGroundLevelSingleton.getInstance().avoidAdditionalPoint(x-2,y-1);
    }

}

export {BuildingEntity};