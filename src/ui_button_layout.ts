import 'phaser';
import {ImageButton, AttackButton, GatherButton, BuildButton, CancelButton } from './image_button'
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
        this.setScrollFactor(0).setDepth(1001).setScale(1.5);
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
export {UIButtonLayout,EngineerUIButtonLayout};