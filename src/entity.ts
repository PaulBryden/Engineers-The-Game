class Entity extends Phaser.GameObjects.Sprite
{
    icon:string;
    health:number;
    status:string;
    name:string;
    constructor( icon: string, name:string, scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture, frame?: string | number)
    {
        super(scene,x,y,texture,frame);
        scene.add.existing(this);
        this.icon=icon;
        this.health=100;
        this.status = "Idle";
        this.name = name;
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