import 'phaser';
import {EventEmitterSingleton} from './EventEmitterSingleton'
import {EventConstants} from './GameConstants'
class ImageButton extends Phaser.GameObjects.Container
{
    backgroundUnpressed:Phaser.GameObjects.Image;
    backgroundPressed:Phaser.GameObjects.Image;
    icon:Phaser.GameObjects.Image;
    constructor(scene:Phaser.Scene, background_unpressed: string, background_pressed: string, icon: string, cost?:string)
    {
        let backgroundButton:Phaser.GameObjects.Image = scene.add.image(2,2,background_unpressed);
        let buttonPressed:Phaser.GameObjects.Image = scene.add.image(0,0,background_pressed);
        let iconImage:Phaser.GameObjects.Image = scene.add.image(0,0,icon);
        let scaleRatio:number = backgroundButton.displayWidth/iconImage.displayWidth;
        iconImage.displayWidth=backgroundButton.displayWidth;
        iconImage.displayHeight=iconImage.displayHeight*scaleRatio;
        super(scene,0,0,[backgroundButton, buttonPressed, iconImage]);
        this.setDepth(251);
        this.setScrollFactor(0,0,true);
        if(cost){
            this.add(scene.add.image(0,23,"resource").setScale(0.3));
            this.add(new Phaser.GameObjects.Text(scene, 5, 18, cost,{ fontFamily: 'Courier', fontSize: '14px', color: '#ffffff' } ))};
        scene.add.existing(this);
        this.setSize(72,72);
          this.setInteractive().on('pointerdown', function(pointer, localX, localY, event){
            this.list[1].x+=2;
            this.list[2].x+=2;
            this.list[1].y+=2;
            this.list[2].y+=2;
        });
        this.setInteractive().on('pointerup', function(pointer, localX, localY, event){
            this.list[1].x-=2;
            this.list[2].x-=2;
            this.list[1].y-=2;
            this.list[2].y-=2;
        });
    }
}

class AttackButton extends ImageButton
{
    constructor(scene:Phaser.Scene)
    {
        super(scene,"ui_button_not_pressed","ui_button","ui_button_Attack_No_Background");
    }
}
class GatherButton extends ImageButton
{
    constructor(scene:Phaser.Scene)
    {
        super(scene,"ui_button_not_pressed","ui_button","ui_button_Gather_No_Background");
    }
}
class BuildButton extends ImageButton
{
    constructor(scene:Phaser.Scene)
    {
        super(scene,"ui_button_not_pressed","ui_button","ui_button_Build_No_Background");
       
    }
}
class CancelButton extends ImageButton
{
    constructor(scene:Phaser.Scene, eventString:string)
    {
        super(scene,"ui_button_not_pressed","ui_button","ui_button_Cancel_No_Background");
        this.setInteractive().on('pointerup', function(pointer, localX, localY, event){
            EventEmitterSingleton.getInstance().emit(eventString);
        });
    }
}
class BuildEngineerButton extends ImageButton
{
    constructor(scene:Phaser.Scene)
    {
        super(scene,"ui_button_not_pressed","ui_button","ui_button_Build_Engineer_No_Background","100");
        this.setInteractive().on('pointerup', function(pointer, localX, localY, event){
            EventEmitterSingleton.getInstance().emit(EventConstants.Input.RequestBuildEngineer);
        });
    }
}
class BuildGliderButton extends ImageButton
{
    constructor(scene:Phaser.Scene)
    {
        super(scene,"ui_button_not_pressed","ui_button","glider-1","300");
        this.setInteractive().on('pointerup', function(pointer, localX, localY, event){
            EventEmitterSingleton.getInstance().emit(EventConstants.Input.RequestBuildGlider);
        });
    }
}
class BuildBaseButton extends ImageButton
{
    constructor(scene:Phaser.Scene)
    {
        super(scene,"ui_button_not_pressed","ui_button","home_base-1","500");
        this.setInteractive().on('pointerup', function(pointer, localX, localY, event){
            EventEmitterSingleton.getInstance().emit(EventConstants.Input.RequestBuildBase);
        });
    }
}
class BuildFactoryButton extends ImageButton
{
    constructor(scene:Phaser.Scene)
    {
        super(scene,"ui_button_not_pressed","ui_button","factory-1","300");
        this.setInteractive().on('pointerup', function(pointer, localX, localY, event){
            EventEmitterSingleton.getInstance().emit(EventConstants.Input.RequestBuildFactory);
        });
    }
}
export { ImageButton, AttackButton, GatherButton, BuildButton, CancelButton, BuildEngineerButton, BuildGliderButton, BuildBaseButton, BuildFactoryButton };
