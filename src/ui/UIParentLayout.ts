import 'phaser';
import {UIButtonLayout, UIButtonLayoutFactory } from './UIButtonLayout';
import {UIPortraitLayout} from './UIPortraitLayout';
import {Entity} from '../units/Entity';
class UIParentLayout extends Phaser.GameObjects.Container {
    constructor(scene:Phaser.Scene, uiButtonLayout:UIButtonLayout, uiPortraitLayout:UIPortraitLayout, x:number, y:number) {
        super(scene,x,y,[uiButtonLayout,uiPortraitLayout]);
        this.setDepth(250);
        scene.add.existing(this);
    }
}

class UIFactory {
    constructor() {

    }

    GetUI(entity:Entity, scene:Phaser.Scene) : UIParentLayout {
        const uiButtonLayoutFactory:UIButtonLayoutFactory = new UIButtonLayoutFactory();
        const uiButtonLayout:UIButtonLayout = uiButtonLayoutFactory.CreateUI(entity,scene);
        const uiPortraitLayout:UIPortraitLayout = new UIPortraitLayout(scene,entity,0,0);
        return new UIParentLayout(scene,uiButtonLayout,uiPortraitLayout,110,330);
    }

}
export {UIParentLayout, UIFactory};