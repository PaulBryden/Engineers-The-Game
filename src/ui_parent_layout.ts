import 'phaser';
import {UIButtonLayout, UIButtonLayoutFactory } from './ui_button_layout'
import {UIPortraitLayout} from './ui_portrait_layout'
import {Entity} from './entity'
class UIParentLayout extends Phaser.GameObjects.Container
{
    constructor(scene:Phaser.Scene, uiButtonLayout:UIButtonLayout, uiPortraitLayout:UIPortraitLayout, x:number, y:number)
    {
        super(scene,x,y,[uiButtonLayout,uiPortraitLayout]);
        this.setDepth(250);
        scene.add.existing(this);
    }
}

class UIFactory
{
    constructor()
    {

    };

    GetUI(entity:Entity, scene:Phaser.Scene) : UIParentLayout
    {
       let uiButtonLayoutFactory:UIButtonLayoutFactory = new UIButtonLayoutFactory();
       let uiButtonLayout:UIButtonLayout = uiButtonLayoutFactory.CreateUI(entity,scene);
       let uiPortraitLayout:UIPortraitLayout = new UIPortraitLayout(scene,entity,0,0);
       return new UIParentLayout(scene,uiButtonLayout,uiPortraitLayout,110,330);
    }

}
export {UIParentLayout, UIFactory};