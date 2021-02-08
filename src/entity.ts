import {EventEmitterSingleton} from './EventEmitterSingleton'
class Entity extends Phaser.GameObjects.Sprite
{
    icon:string;
    health:number;
    status:string;
    name:string;
    mapReference:Phaser.Tilemaps.Tilemap;
    eventEmitter:EventEmitterSingleton;
    selected:boolean;
    selectedRectangle: Phaser.GameObjects.Rectangle;
    constructor(map: Phaser.Tilemaps.Tilemap, icon: string, name:string, scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture, frame?: string | number)
    {
        let vector:Phaser.Math.Vector2 =Phaser.Tilemaps.Components.IsometricTileToWorldXY(x,y,new Phaser.Math.Vector2(),scene.cameras.main,map.getLayer('Tile Layer 1'));
        super(scene,vector.x,vector.y,texture,frame);
        this.selectedRectangle = new Phaser.GameObjects.Rectangle(scene,this.x,this.y,this.width,this.height,0xffffff,0x0).setStrokeStyle(1,0xffffff);
        scene.add.existing(this.selectedRectangle);
        this.selectedRectangle.setVisible(false);

        this.eventEmitter = EventEmitterSingleton.getInstance();
        this.setInteractive();
        this.on('pointerup',this.emitSelected,this);
        this.setDepth(x+y);
        this.mapReference=map;
        scene.add.existing(this);
        this.icon=icon;
        this.health=100;
        this.status = "Idle";
        this.name = name;
        this.selected=false;
        
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

    updateRenderDepth()
    {        
        var tilePos = this.mapReference.worldToTileXY(this.x,this.y);
        this.selectedRectangle.setX(this.x);
        this.selectedRectangle.setY(this.y);
        this.selectedRectangle.setDepth(tilePos.x+tilePos.y-1);
        this.setDepth(tilePos.x+tilePos.y-2);

    }

    updateSelected(selected:boolean)
    {        
        this.selectedRectangle.setVisible(selected);
        this.selected=selected;
    }
}

export {Entity};