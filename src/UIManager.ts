import 'phaser'
import {UIParentLayout,UIFactory} from './ui_parent_layout'
import {Entity} from './entity'
import {EngineerEntity} from './engineer_entity'
import {EventEmitterSingleton} from './EventEmitterSingleton'
import {AudioEffectsSingleton} from './AudioEffectsSingleton'
import {EventConstants} from './GameConstants'
import { MineEntity } from './mine_entity'
import { UIResources } from './ui_resources'
import GameScene from './gameScene'
class UIManager
{
    uiLayout:UIParentLayout;
    resourceLayout: UIResources;
    selectedEntity:Entity;
    uiFactory: UIFactory;
    eventEmitter: EventEmitterSingleton;
    uiScene:Phaser.Scene;
    entityScene:GameScene;

    controls: any;
    constructor(scene:Phaser.Scene, entityScene:GameScene, initialEntity?: Entity)
    {
        this.uiFactory = new UIFactory();
        this.eventEmitter = EventEmitterSingleton.getInstance();
        this.eventEmitter.on(EventConstants.EntityActions.Selected,this.updateSelected, this );
        this.entityScene=entityScene;
        let cursors:Phaser.Types.Input.Keyboard.CursorKeys = entityScene.input.keyboard.createCursorKeys();
        var controlConfig = {
            camera: entityScene.cameras.main,
            left: cursors.left,
            right: cursors.right,
            up: cursors.up,
            down: cursors.down,
            acceleration: 0.04,
            drag: 0.0005,
            maxSpeed: 0.4
        };

        this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);
        //scene.add.rectangle(1400,15,2100,1800,0xffffff,0x0).setInteractive().setScrollFactor(0).setDepth(1).on('pointerup', (pointer, gameObject)=>{this.handleClick(pointer,gameObject)});
        scene.add.image(800, 450, 'ui_overlay').setScrollFactor(0).setScale(2).setDepth(250);
        this.eventEmitter.on(EventConstants.EntityActions.Move,this.handleMovement,this);

        if(initialEntity!=null)
        {
            this.selectedEntity = initialEntity;
            this.uiLayout = this.uiFactory.GetUI(this.selectedEntity, scene);

        }
        this.uiScene=scene;
        this.resourceLayout= new UIResources(this.uiScene);
    }

    moveSelected(coords:Phaser.Math.Vector2)
    {
        if(this.selectedEntity instanceof EngineerEntity)
        {
            this.selectedEntity.requestMove(coords);
        }
    }

    updateSelected(selectedEntity?: Entity)
    {
        if(selectedEntity!=null)
        {
            if(this.selectedEntity instanceof EngineerEntity && selectedEntity instanceof MineEntity)
            {
                (<EngineerEntity>this.selectedEntity).requestMine(selectedEntity);
            }
            else
            {
                this.selectedEntity!=null?this.selectedEntity.updateSelected(false):{};
                this.selectedEntity = selectedEntity;
                this.selectedEntity.updateSelected(true);
                Math.random()>0.5?AudioEffectsSingleton.getInstance(this.selectedEntity.scene).IdleEngineerSelected1.play():AudioEffectsSingleton.getInstance(this.selectedEntity.scene).IdleEngineerSelected2.play();
            }

            if(this.uiLayout!=null)
            {
                this.uiLayout.destroy();
            }
            this.uiLayout = this.uiFactory.GetUI(this.selectedEntity,this.uiScene);
        }
    }
    handleMovement(coords:Phaser.Math.Vector2) {
           
            this.moveSelected(coords);
      

    };
    update(delta:number)
    {
        this.controls.update(delta);

    }
} 
export {UIManager};