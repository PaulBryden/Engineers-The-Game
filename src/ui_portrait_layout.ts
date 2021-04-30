import 'phaser';
import {Entity} from './entity'
import { IStatePublisher, IStateSubscriber } from './stateful';
class UIPortraitLayout extends Phaser.GameObjects.Container implements IStateSubscriber
{
    EntityStatus: Phaser.GameObjects.Text;
    publisher: IStatePublisher;
    constructor(scene:Phaser.Scene, entity:Entity, x:number, y:number)
    {
        let portrait:Phaser.GameObjects.Image = new Phaser.GameObjects.Image(scene, -6, 0, entity.getIconString());
        let widthHeightRatio:number = portrait.height/portrait.width;
        portrait.displayWidth=150;
        portrait.displayHeight = portrait.displayWidth*widthHeightRatio;
        let EntityName:Phaser.GameObjects.Text = new Phaser.GameObjects.Text(scene, 70, -10, entity.getName(),{ fontFamily: 'monogram', fontSize: '48px', color: '#ffffff' } );
        let EntityStatus = new Phaser.GameObjects.Text(scene, -45, 60, "Status: "+entity.getStatus(),{ fontFamily: 'monogram', fontSize: '48px', color: '#ffffff' } );
        super(scene,x,y,[portrait,EntityName,EntityStatus]);
        this.publisher=entity;
        this.publisher.subscribe(this);
        this.EntityStatus=EntityStatus;
        scene.add.existing(this);
        this.setDepth(251);
        this.setScrollFactor(0);
    }
    notify(state: string): void {
        this.EntityStatus.setText("Status: "+state);
    }
    destroy()
    {
        this.publisher.unsubscribe(this);
        super.destroy();
    }
}

export {UIPortraitLayout}