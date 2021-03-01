import {Entity} from './entity'
import { EasyStarGroundLevelSingleton, Path } from './EasyStarSingleton';

class BuildingEntity extends Entity
{
    blockedTiles:Phaser.Math.Vector2[];
    constructor(map: Phaser.Tilemaps.Tilemap, icon: string, name:string, scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture, team:number, frame?: string | number)
    {
        super(map,icon,name,scene,x,y,texture,team);
        this.blockedTiles =[];
        this.blockedTiles.push(new Phaser.Math.Vector2(x-1,y));
        this.blockedTiles.push(new Phaser.Math.Vector2(x-2,y));
        this.blockedTiles.push(new Phaser.Math.Vector2(x-1,y-1));
        this.blockedTiles.push(new Phaser.Math.Vector2(x-2,y-1));
        this.avoidAdditionalPoints();
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