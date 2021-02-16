import {Entity} from './entity'
import { EasyStarSingleton, Path } from './EasyStarSingleton';

class BuildingEntity extends Entity
{
    constructor(map: Phaser.Tilemaps.Tilemap, icon: string, name:string, scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture, frame?: string | number)
    {
        super(map,icon,name,scene,x,y,texture);
        EasyStarSingleton.getInstance().avoidAdditionalPoint(x-1,y);
        EasyStarSingleton.getInstance().avoidAdditionalPoint(x-2,y);
        EasyStarSingleton.getInstance().avoidAdditionalPoint(x-1,y-1);
        EasyStarSingleton.getInstance().avoidAdditionalPoint(x-2,y-1);
    }

}

export {BuildingEntity};