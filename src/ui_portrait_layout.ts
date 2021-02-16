import 'phaser';
import {UIButtonLayout } from './ui_button_layout'
import {BaseEntity} from './base_entity'
import {EngineerEntity} from './engineer_entity'
import {Entity} from './entity'
class UIPortraitLayout extends Phaser.GameObjects.Container
{
    constructor(scene:Phaser.Scene, entity:Entity, x:number, y:number)
    {
        let portrait:Phaser.GameObjects.Image = new Phaser.GameObjects.Image(scene, 0, 0, entity.getIconString());
        let widthHeightRatio:number = portrait.height/portrait.width;
        portrait.displayWidth=80;
        portrait.displayHeight = portrait.displayWidth*widthHeightRatio;
        let EntityName:Phaser.GameObjects.Text = new Phaser.GameObjects.Text(scene, 45, 0, entity.getName(),{ fontFamily: 'Courier', fontSize: '18px', color: '#ffffff' } );
        let EntityStatus:Phaser.GameObjects.Text = new Phaser.GameObjects.Text(scene, -30, 40, "Status: "+entity.getStatus(),{ fontFamily: 'Courier', fontSize: '18px', color: '#ffffff' } );
        let EntityHealth:Phaser.GameObjects.Text = new Phaser.GameObjects.Text(scene, -30, 60, "Health: "+entity.getHealth(),{ fontFamily: 'Courier', fontSize: '18px', color: '#ffffff' } );
        super(scene,x,y,[portrait,EntityName,EntityStatus,EntityHealth]);
        scene.add.existing(this);
        this.setScale(1.5);
        this.setDepth(251);
        this.setScrollFactor(0);
    }
}

export {UIPortraitLayout}