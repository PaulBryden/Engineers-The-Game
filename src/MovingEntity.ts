import { Entity } from "./entity";

class MovingEntity extends Entity{
    
    constructor(map: Phaser.Tilemaps.Tilemap, icon: string, name: string, scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture, team:number, frame?: string | number)
     {
         super(map,icon,name,scene,x,y,texture,team,frame);
    }
    requestMove(coordinates: Phaser.Math.Vector2) 
    {
    }
}
export {MovingEntity}