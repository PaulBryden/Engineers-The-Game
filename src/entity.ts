import {EventEmitterSingleton} from './EventEmitterSingleton'
class Entity extends Phaser.GameObjects.Sprite
{
    icon:string;
    health:number;
    status:string;
    name:string;
    mapReference:Phaser.Tilemaps.Tilemap;
    eventEmitter:EventEmitterSingleton;
    constructor(map: Phaser.Tilemaps.Tilemap, icon: string, name:string, scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture, frame?: string | number)
    {
        let vector:Phaser.Math.Vector2 =Phaser.Tilemaps.Components.IsometricTileToWorldXY(x,y,new Phaser.Math.Vector2(),scene.cameras.main,map.getLayer('Tile Layer 1'));
        super(scene,vector.x,vector.y,texture,frame);
        this.eventEmitter = EventEmitterSingleton.getInstance();
        this.setInteractive();
        this.on('pointerup',this.emitSelected,this);

        this.setDepth(vector.x+vector.y);
        this.mapReference=map;
        scene.add.existing(this);
        this.icon=icon;
        this.health=100;
        this.status = "Idle";
        this.name = name;

    }

    emitSelected()
    {
        this.eventEmitter.emit("SELECTED",this);
    }

    getIconString()
    {
        return this.icon;
    }

    getHealth()
    {
        return this.health;
    }

    getStatus()
    {
        return this.status;
    }
    
    getName()
    {
        return this.name;
    }
}

export {Entity};