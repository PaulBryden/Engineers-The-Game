import 'phaser'
import {UIParentLayout,UIFactory} from './ui_parent_layout'
import {Entity} from './entity'
import {EngineerEntity} from './engineer_entity'
import {EventEmitterSingleton} from './EventEmitterSingleton'
import {AudioEffectsSingleton} from './AudioEffectsSingleton'
import {BuildingEntityID, EntityConstants, EventConstants, TeamNumbers} from './GameConstants'
import { MineEntity } from './mine_entity'
import { UIResources } from './ui_resources'
import GameScene from './gameScene'
import { MovingEntity } from './MovingEntity'
import { ScaffoldEntity } from './scaffold'
import { GliderEntity } from './glider_entity'
class UIManager
{
    uiLayout:UIParentLayout;
    resourceLayout: UIResources;
    selectedEntity:Entity;
    uiFactory: UIFactory;
    eventEmitter: EventEmitterSingleton;
    uiScene:Phaser.Scene;
    entityScene:GameScene;
    LeftArrowDown:boolean;
    RightArrowDown:boolean;
    UpArrowDown:boolean;
    BottomArrowDown:boolean;

    controls: any;
    constructor(scene:Phaser.Scene, entityScene:GameScene, initialEntity?: Entity)
    {
        this.uiFactory = new UIFactory();
        this.eventEmitter = EventEmitterSingleton.getInstance();
        this.eventEmitter.on(EventConstants.EntityActions.Selected,this.updateSelected, this );
        this.eventEmitter.on(EventConstants.Input.RequestBuildBase,()=>{this.eventEmitter.emit(EventConstants.Input.RequestBuildScaffold,this.selectedEntity,BuildingEntityID.Base)});
        this.eventEmitter.on(EventConstants.Input.RequestBuildFactory,()=>{this.eventEmitter.emit(EventConstants.Input.RequestBuildScaffold,this.selectedEntity,BuildingEntityID.Factory)});
        this.eventEmitter.on(EventConstants.Input.RequestBuildTurret,()=>{this.eventEmitter.emit(EventConstants.Input.RequestBuildScaffold,this.selectedEntity,BuildingEntityID.Turret)});
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
        
        this.LeftArrowDown=false;
        this.RightArrowDown=false;
        this.UpArrowDown=false;
        this.BottomArrowDown=false;

        this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);
        //scene.add.rectangle(1400,15,2100,1800,0xffffff,0x0).setInteractive().setScrollFactor(0).setDepth(1).on('pointerup', (pointer, gameObject)=>{this.handleClick(pointer,gameObject)});
        scene.add.image(800, 450, 'ui_overlay').setScrollFactor(0).setScale(2).setDepth(250);
        scene.add.image(190,252,"Up_Button").setScrollFactor(0).setScale(2.5).setDepth(250).setInteractive().on('pointerdown', (pointer, localX, localY, event)=>{
            this.UpArrowDown=true;
        }).on('pointerup', (pointer, localX, localY, event)=>{
            this.UpArrowDown=false;
        });
        scene.add.image(190,342,"Down_Button").setScrollFactor(0).setScale(2.5).setDepth(250).setInteractive().on('pointerdown', (pointer, localX, localY, event)=>{
            this.BottomArrowDown=true;
        }).on('pointerup', (pointer, localX, localY, event)=>{
            this.BottomArrowDown=false;
        });
        scene.add.image(135,297,"Left_Button").setScrollFactor(0).setScale(2.5).setDepth(250).setInteractive().on('pointerdown', (pointer, localX, localY, event)=>{
            this.LeftArrowDown=true;
        }).on('pointerup', (pointer, localX, localY, event)=>{
            this.LeftArrowDown=false;
        });
        scene.add.image(245,297,"Right_Button").setScrollFactor(0).setScale(2.5).setDepth(250).setInteractive().on('pointerdown', (pointer, localX, localY, event)=>{
            this.RightArrowDown=true;
        }).on('pointerup', (pointer, localX, localY, event)=>{
            this.RightArrowDown=false;
        });
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
        if(this.selectedEntity instanceof MovingEntity)
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
            else if(this.selectedEntity instanceof EngineerEntity && selectedEntity instanceof ScaffoldEntity)
            {
                (<EngineerEntity>this.selectedEntity).requestBuild(selectedEntity);
            }
            else if(selectedEntity.team==TeamNumbers.Player)
            {
                this.selectedEntity!=null?this.selectedEntity.updateSelected(false):{};
                this.selectedEntity = selectedEntity;
                this.selectedEntity.updateSelected(true);
                Math.random()>0.5?AudioEffectsSingleton.getInstance(this.selectedEntity.scene).IdleEngineerSelected1.play():AudioEffectsSingleton.getInstance(this.selectedEntity.scene).IdleEngineerSelected2.play();
            }
            else if(selectedEntity.team==TeamNumbers.Enemy && this.selectedEntity instanceof GliderEntity)
            {
                this.selectedEntity.requestAttack(selectedEntity);
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
        if(this.UpArrowDown)
        {
            this.entityScene.cameras.main.setScroll(this.entityScene.cameras.main.scrollX,this.entityScene.cameras.main.scrollY-(500*(delta/1000)));
        }
        if(this.BottomArrowDown)
        {
            this.entityScene.cameras.main.setScroll(this.entityScene.cameras.main.scrollX,this.entityScene.cameras.main.scrollY+(500*(delta/1000)));

        }
        if(this.RightArrowDown)
        {
            this.entityScene.cameras.main.setScroll(this.entityScene.cameras.main.scrollX+(500*(delta/1000)),this.entityScene.cameras.main.scrollY);

        }
        if(this.LeftArrowDown)
        {
            this.entityScene.cameras.main.setScroll(this.entityScene.cameras.main.scrollX-(500*(delta/1000)),this.entityScene.cameras.main.scrollY);

        }

    }
} 
export {UIManager};