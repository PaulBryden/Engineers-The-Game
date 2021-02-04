import 'phaser';
import {ImageButton, AttackButton, GatherButton, BuildButton, CancelButton } from './image_button'
import {UIButtonLayout } from './ui_button_layout'
import {UIPortraitLayout} from './ui_portrait_layout'
class UIParentLayout extends Phaser.GameObjects.Container
{
    constructor(scene:Phaser.Scene, uiButtonLayout:UIButtonLayout, uiPortraitLayout:UIPortraitLayout, x:number, y:number)
    {
        super(scene,x,y,[uiButtonLayout,uiPortraitLayout]);
        this.setDepth(1003);
        scene.add.existing(this);
    }
}
export {UIParentLayout};