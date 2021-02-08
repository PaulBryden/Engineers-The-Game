import 'phaser';
import {ImageButton, AttackButton, GatherButton, BuildButton, CancelButton } from './image_button'
import {UIButtonLayout, UIButtonLayoutFactory } from './ui_button_layout'
import {UIPortraitLayout} from './ui_portrait_layout'
import {Entity} from './entity'
import {BaseEntity} from './base_entity'
import {EngineerEntity} from './engineer_entity'
import {EventEmitterSingleton} from './EventEmitterSingleton'
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

    GetUI(entity:Entity) : UIParentLayout
    {
       let uiButtonLayoutFactory:UIButtonLayoutFactory = new UIButtonLayoutFactory();
       let uiButtonLayout:UIButtonLayout = uiButtonLayoutFactory.CreateUI(entity);
       let uiPortraitLayout:UIPortraitLayout = new UIPortraitLayout(entity.scene,entity,0,0);
       return new UIParentLayout(entity.scene,uiButtonLayout,uiPortraitLayout,110,400);
    }

}
export {UIParentLayout, UIFactory};