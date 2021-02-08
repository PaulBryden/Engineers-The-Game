import 'phaser';
import {ImageButton, AttackButton, GatherButton, BuildButton, CancelButton, BuildEngineerButton } from './image_button'
import {BaseEntity} from './base_entity'
import {EngineerEntity} from './engineer_entity'
import {Entity} from './entity'

class UIButtonLayout extends Phaser.GameObjects.Container
{
    constructor(scene:Phaser.Scene, buttons:ImageButton[], x:number, y:number)
    {
        let i:number = 0;
        for (let button of buttons) 
        {
            i%2!=0?button.x=100:button.x=0;
            button.y=0+(100*Math.floor(i/2));
            i++;
        }
        super(scene,x,y,buttons);
        this.setScrollFactor(0).setDepth(251).setScale(1.5);
        scene.add.existing(this);

    }
}

class EngineerUIButtonLayout extends UIButtonLayout
{
    constructor(scene:Phaser.Scene, x:number, y:number)
    {
        super(scene,[new AttackButton(scene),new BuildButton(scene), new GatherButton(scene), new CancelButton(scene)],x,y);
    }
}
class BaseUIButtonLayout extends UIButtonLayout
{
    constructor(scene:Phaser.Scene, x:number, y:number)
    {
        super(scene,[new BuildEngineerButton(scene), new CancelButton(scene)],x,y);
    }
}

class UIButtonLayoutFactory
{
    x:number;
    y:number;
    constructor()
    {
        this.x=0;
        this.y=200;
    };
    public CreateUI(entity:Entity): UIButtonLayout
    {
        if(entity instanceof BaseEntity)
        {
            return new BaseUIButtonLayout(entity.scene,this.x,this.y);
        }
        else if(entity instanceof EngineerEntity)
        {
            return new EngineerUIButtonLayout(entity.scene,this.x,this.y);
        }
    }

}
export {UIButtonLayout,EngineerUIButtonLayout,UIButtonLayoutFactory};