import 'phaser';

class ImageButton extends Phaser.GameObjects.Container
{
    backgroundUnpressed:Phaser.GameObjects.Image;
    backgroundPressed:Phaser.GameObjects.Image;
    icon:Phaser.GameObjects.Image;
    constructor(scene:Phaser.Scene, background_unpressed: string, background_pressed: string, icon: string)
    {
        super(scene,0,0,[scene.add.image(2,2,background_unpressed).setDepth(2003), scene.add.image(0,0,background_pressed).setDepth(2003), scene.add.image(0,0,icon).setDepth(2003)]);
        this.setDepth(2003);
        this.setScrollFactor(0,0,true);
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
    constructor(scene:Phaser.Scene)
    {
        super(scene,"ui_button_not_pressed","ui_button","ui_button_Cancel_No_Background");
    }
}
export { ImageButton, AttackButton, GatherButton, BuildButton, CancelButton };
