import {Entity} from './entity'
import { EasyStarGroundLevelSingleton, Path } from './EasyStarSingleton';

class BuildingEntity extends Entity
{
    blockedTiles:Phaser.Math.Vector2[];
    constructor(map: Phaser.Tilemaps.Tilemap, icon: string, name:string, scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture, team:number, frame?: string | number)
    {
        super(map,icon,name,scene,x,y,texture,team);
        this.fogOfWarMask.scale = 3.0;
        this.blockedTiles=[];
    }

    avoidAdditionalPoints()
    {
        for(let tile of this.blockedTiles)
        {
            EasyStarGroundLevelSingleton.getInstance().avoidAdditionalPoint(tile.x,tile.y);
        }
    }

    stopAvoidingAdditionalPoints()
    {
        for(let tile of this.blockedTiles)
        {
            EasyStarGroundLevelSingleton.getInstance().stopAvoidingAdditionalPoint(tile.x,tile.y);
        }
    }


    destroy()
    {
        this.stopAvoidingAdditionalPoints();
        super.destroy();
    }

}

export {BuildingEntity};