import 'phaser';
import {UIParentLayout,UIFactory} from './UIParentLayout';
import {Entity} from '../units/Entity';
import {EngineerEntity} from '../units/EngineerEntity';
import {EventEmitterSingleton} from '../logic/EventEmitterSingleton';
import {AudioEffectsSingleton} from '../audio/AudioEffectsSingleton';
import {BuildingEntityID, EntityConstants, EventConstants, GameStatus, TeamNumbers, Zoom} from '../logic/GameConstants';
import { MineEntity } from '../units/MineEntity';
import { UIResources } from './UIResources';
import GameScene from '../scenes/GameScene';
import { MovingEntity } from '../units/MovingEntity';
import { ScaffoldEntity } from '../units/ScaffoldEntity';
import { GliderEntity } from '../units/GliderEntity';
import { UI } from './UIScene';
import { Menu } from '../scenes/MenuScene';
class UIManager extends Phaser.GameObjects.GameObject {
    uiLayout:UIParentLayout;
    resourceLayout: UIResources;
    selectedEntity:Entity;
    uiFactory: UIFactory;
    eventEmitter: EventEmitterSingleton;
    uiScene:UI;
    entityScene:GameScene;
    LeftArrowDown:boolean;
    RightArrowDown:boolean;
    UpArrowDown:boolean;
    BottomArrowDown:boolean;
    MiniMapOverlay:Phaser.GameObjects.Rectangle;
    controls: any;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys
    ZoomIn: boolean
    ZoomOut: boolean
    zoomInDown: boolean
    zoomOutDown: boolean
    GameStatusText: Phaser.GameObjects.Text
    constructor(scene:UI, entityScene:GameScene, initialEntity?: Entity) {
        super(scene, 'UIManager');
        this.uiFactory = new UIFactory();
        this.eventEmitter = EventEmitterSingleton.getInstance();
        this.eventEmitter.on(EventConstants.EntityActions.Selected,this.updateSelected, this );
        this.eventEmitter.on(EventConstants.Input.RequestBuildBase,()=>{
            this.eventEmitter.emit(EventConstants.Input.RequestBuildScaffold,this.selectedEntity,BuildingEntityID.Base,  TeamNumbers.Player);
        });
        this.eventEmitter.on(EventConstants.Input.RequestBuildFactory,()=>{
            this.eventEmitter.emit(EventConstants.Input.RequestBuildScaffold,this.selectedEntity,BuildingEntityID.Factory, TeamNumbers.Player);
        });
        this.eventEmitter.on(EventConstants.Input.RequestBuildTurret,()=>{
            this.eventEmitter.emit(EventConstants.Input.RequestBuildScaffold,this.selectedEntity,BuildingEntityID.Turret,  TeamNumbers.Player);
        });
        this.eventEmitter.on(EventConstants.Input.RequestBuildGlider,()=>{
            this.eventEmitter.emit(EventConstants.Input.BuildGlider, this.selectedEntity,  TeamNumbers.Player);
        });
        this.eventEmitter.on(EventConstants.Input.RequestBuildEngineer,()=>{
            this.eventEmitter.emit(EventConstants.Input.BuildEngineer, this.selectedEntity, TeamNumbers.Player);
        });
        this.eventEmitter.on(EventConstants.Input.RequestCancelGlider,()=>{
            this.eventEmitter.emit(EventConstants.Input.CancelGlider, this.selectedEntity,  TeamNumbers.Player);
        });
        this.eventEmitter.on(EventConstants.Input.RequestCancelEngineer,()=>{
            this.eventEmitter.emit(EventConstants.Input.CancelEngineer, this.selectedEntity, TeamNumbers.Player);
        });
        this.entityScene=entityScene;

        this.MiniMapOverlay = new Phaser.GameObjects.Rectangle(scene, 188, 74, 110/Zoom.ZoomLevel, 76/Zoom.ZoomLevel, 0xffffff, 0x0).setDepth(251).setStrokeStyle(2, 0xffffff);
        scene.add.existing(this.MiniMapOverlay);
        this.LeftArrowDown=false;
        this.RightArrowDown=false;
        this.UpArrowDown=false;
        this.BottomArrowDown=false;
        this.zoomInDown=false;
        this.zoomOutDown=false;
        this.cursors = this.entityScene.input.keyboard.createCursorKeys();
        this.entityScene.input.keyboard.on('keydown-W', function (event) {
            this.UpArrowDown=true; 
        }, this);
        this.entityScene.input.keyboard.on('keydown-A', function (event) {
            this.LeftArrowDown=true; 
        }, this);
        this.entityScene.input.keyboard.on('keydown-S', function (event) {
            this.BottomArrowDown=true; 
        }, this);
        this.entityScene.input.keyboard.on('keydown-D', function (event) {
            this.RightArrowDown=true; 
        }, this);
        this.entityScene.input.keyboard.on('keyup-W', function (event) {
            this.UpArrowDown=false; 
        }, this);
        this.entityScene.input.keyboard.on('keyup-A', function (event) {
            this.LeftArrowDown=false;
        }, this);
        this.entityScene.input.keyboard.on('keyup-S', function (event)  {
            this.BottomArrowDown=false; 
        }, this);
        this.entityScene.input.keyboard.on('keyup-D', function (event) {
            this.RightArrowDown=false; 
        }, this);
        //scene.add.rectangle(1400,15,2100,1800,0xffffff,0x0).setInteractive().setScrollFactor(0).setDepth(1).on('pointerup', (pointer, gameObject)=>{this.handleClick(pointer,gameObject)});
        scene.add.image(800, 450, 'ui_overlay').setScrollFactor(0).setScale(2).setDepth(250);
        //190,252
        scene.add.image(1450,700,'Up_Button').setScrollFactor(0).setScale(2.5).setAlpha(0.35).setDepth(250).setInteractive().on('pointerdown', (pointer, localX, localY, event)=>{
            this.UpArrowDown=true;
        }).on('pointerup', (pointer, localX, localY, event)=>{
            this.UpArrowDown=false;
        }).on('pointerout', function (pointer, event) { 
            this.UpArrowDown=false;
        },this);
        scene.add.image(1450,790,'Down_Button').setScrollFactor(0).setScale(2.5).setAlpha(0.35).setDepth(250).setInteractive().on('pointerdown', (pointer, localX, localY, event)=>{
            this.BottomArrowDown=true;
        }).on('pointerup', (pointer, localX, localY, event)=>{
            this.BottomArrowDown=false;
        }).on('pointerout', function (pointer, event) { 
            this.BottomArrowDown=false;
        },this);
        scene.add.image(1395,745,'Left_Button').setScrollFactor(0).setScale(2.5).setAlpha(0.35).setDepth(250).setInteractive().on('pointerdown', (pointer, localX, localY, event)=>{
            this.LeftArrowDown=true;
        }).on('pointerup', (pointer, localX, localY, event)=>{
            this.LeftArrowDown=false;
        }).on('pointerout', function (pointer, event) { 
            this.LeftArrowDown=false;
        },this);
        scene.add.image(1505,745,'Right_Button').setScrollFactor(0).setScale(2.5).setAlpha(0.35).setDepth(250).setInteractive().on('pointerdown', (pointer, localX, localY, event)=>{
            this.RightArrowDown=true;
        }).on('pointerup', (pointer, localX, localY, event)=>{
            this.RightArrowDown=false;
        }).on('pointerout', function (pointer, event) { 
            this.RightArrowDown=false;
        },this);
        scene.add.image(1450,580,'Plus_Button').setScrollFactor(0).setScale(3).setAlpha(0.45).setDepth(250).setInteractive().on('pointerdown', (pointer, localX, localY, event)=>{
            this.zoomInDown=true;
        }).on('pointerup', (pointer, localX, localY, event)=>{
            this.zoomInDown=false;
        }).on('pointerout', function (pointer, event) { 
            this.zoomInDown=false;
        },this);
        scene.add.image(1450,450,'Minus_Button').setScrollFactor(0).setScale(3).setAlpha(0.45).setDepth(250).setInteractive().on('pointerdown', (pointer, localX, localY, event)=>{
            this.zoomOutDown=true;
        }).on('pointerup', (pointer, localX, localY, event)=>{
            this.zoomOutDown=false;
        }).on('pointerout', function (pointer, event) { 
            this.zoomOutDown=false;
        },this);
        scene.add.image(1520,115,'Close_Button').setScrollFactor(0).setScale(2.5).setAlpha(0.45).setDepth(250).setInteractive().on('pointerdown', (pointer, localX, localY, event)=>{

            this.closeAndReturnToMenu();
 
        });
        this.eventEmitter.on(EventConstants.EntityActions.Move,this.handleMovement,this);

        if(initialEntity!=null) {
            this.selectedEntity = initialEntity;
            this.uiLayout = this.uiFactory.GetUI(this.selectedEntity, scene);

        }
        this.uiScene=scene;
        this.resourceLayout= new UIResources(this.uiScene);
        this.GameStatusText=  new Phaser.GameObjects.Text(scene, 500, 340, '',{ fontFamily: 'monogram', fontSize: '96px', color: '#ffffff' } );
        this.GameStatusText.setDepth(251);
        this.GameStatusText.setScrollFactor(0,0);
        scene.add.existing(this.GameStatusText);
        EventEmitterSingleton.getInstance().on(EventConstants.Game.Winner, ()=>{
            this.scene.tweens.add({
                targets: {},
                NOTHING: { value: 1, duration: 3500 },
                onComplete: () => {
                    this.closeAndReturnToMenu();
                }});
            this.GameStatusText.setText('You have won! Congratulations!');
        
        });
        EventEmitterSingleton.getInstance().on(EventConstants.Game.Loser, ()=>{
            this.scene.tweens.add({
                targets: {},
                NOTHING: { value: 1, duration: 3500 },
                onComplete: () => {
                    this.closeAndReturnToMenu();
                }});
            this.GameStatusText.setText('You have been eliminated...');
        });


    }

    closeAndReturnToMenu() {
        this.entityScene.setup(false);
        this.entityScene.cameras.remove(this.uiScene.minimap);
        this.entityScene.scene.moveUp('Menu');
        (<Menu>this.entityScene.scene.get('Menu')).makeVisible();
        (this.uiScene.scene.stop());
    }
    moveSelected(coords:Phaser.Math.Vector2) {
        if(this.selectedEntity instanceof MovingEntity) {
            this.selectedEntity.requestMove(coords);
        }
    }

    updateSelected(selectedEntity?: Entity) {
        if(selectedEntity!=null) {
            if(this.selectedEntity instanceof EngineerEntity && selectedEntity instanceof MineEntity) {
                (<EngineerEntity>this.selectedEntity).requestMine(selectedEntity);
            }
            else if(this.selectedEntity instanceof EngineerEntity && selectedEntity instanceof ScaffoldEntity) {
                (<EngineerEntity>this.selectedEntity).requestBuild(selectedEntity);
            }
            else if(selectedEntity.team==TeamNumbers.Player) {
                this.selectedEntity!=null?this.selectedEntity.updateSelected(false):{};
                this.selectedEntity = selectedEntity;
                this.selectedEntity.updateSelected(true);
                Math.random()>0.5?AudioEffectsSingleton.getInstance(this.selectedEntity.scene).IdleEngineerSelected1.play():AudioEffectsSingleton.getInstance(this.selectedEntity.scene).IdleEngineerSelected2.play();
            }
            else if(selectedEntity.team==TeamNumbers.Enemy && this.selectedEntity instanceof GliderEntity) {
                Math.random() > 0.5 && GameStatus.ActiveGame ? AudioEffectsSingleton.getInstance(this.selectedEntity.scene).EngineerAttacking.play() : AudioEffectsSingleton.getInstance(this.selectedEntity.scene).EngineerAttacking.play();
                this.selectedEntity.requestAttack(selectedEntity);
            }

            if(this.uiLayout!=null) {
                this.uiLayout.destroy();
            }
            this.uiLayout = this.uiFactory.GetUI(this.selectedEntity,this.uiScene);
        }
        else {
            this.selectedEntity=null;
            this.uiLayout.destroy();
        }
    }
    handleMovement(coords:Phaser.Math.Vector2) {
           
        this.moveSelected(coords);
      

    }

    calculateLimitX( x:number, subtract: boolean) {
        
            
        const camCenterX = this.entityScene.cameras.main.worldView.centerX;
        // The extra x and y, which we need to add to endX and endY, so that the final position is indeed 800 and 600.
        // We take the distance between endX and the center of the camera and multiply it by a transformation constant which depends on the camera

        const extraX = (x-camCenterX)*((1/Zoom.ZoomLevel)-1);
        subtract?x-=extraX:x+=extraX;
        return x;
    }

    calculateLimitY( y:number,subtract:boolean) {
        
            
        const camCenterY = this.entityScene.cameras.main.worldView.centerY;
        // The extra x and y, which we need to add to endX and endY, so that the final position is indeed 800 and 600.
        // We take the distance between endX and the center of the camera and multiply it by a transformation constant which depends on the camera

        const extraY = 200*(1-(1/Zoom.ZoomLevel));
        y+=extraY;
        subtract?y-=extraY:y+=extraY;
        return y;
    }
    update(delta:number) {
        if(this.zoomInDown) {
            if(Zoom.ZoomLevel<1.7) {
                Zoom.ZoomLevel+=(0.3*(delta/1000));
                this.MiniMapOverlay.setDisplaySize(110/Zoom.ZoomLevel,76/Zoom.ZoomLevel);
                this.entityScene.cameras.main.setZoom(Zoom.ZoomLevel);
            }
        }
        else if(this.zoomOutDown) {
            if(Zoom.ZoomLevel>1.0) {
                Zoom.ZoomLevel-=(0.3*(delta/1000));
                this.MiniMapOverlay.setDisplaySize(110/Zoom.ZoomLevel,76/Zoom.ZoomLevel);
                this.entityScene.cameras.main.setZoom(Zoom.ZoomLevel);
            }

        }
        if(this.UpArrowDown) {
            if(this.entityScene.cameras.main.scrollY-(this.entityScene.cameras.main.displayHeight/2)>-480) {
                this.entityScene.cameras.main.setScroll(this.entityScene.cameras.main.scrollX,this.entityScene.cameras.main.scrollY-(500*(delta/1000)));
                this.MiniMapOverlay.setY(this.MiniMapOverlay.y-(55*(delta/1000)));
            }
        }
        if(this.BottomArrowDown) {
            if(this.entityScene.cameras.main.scrollY+(this.entityScene.cameras.main.displayHeight/2)<1200) {
                this.entityScene.cameras.main.setScroll(this.entityScene.cameras.main.scrollX,this.entityScene.cameras.main.scrollY+(500*(delta/1000)));
                this.MiniMapOverlay.setY(this.MiniMapOverlay.y+(55*(delta/1000)));
            }
        }
        if(this.RightArrowDown) {
            if(this.entityScene.cameras.main.scrollX+(this.entityScene.cameras.main.displayWidth/2)<860) {
                this.entityScene.cameras.main.setScroll(this.entityScene.cameras.main.scrollX+(500*(delta/1000)),this.entityScene.cameras.main.scrollY);
                this.MiniMapOverlay.setX(this.MiniMapOverlay.x+(49*(delta/1000)));
            }

        }
        if(this.LeftArrowDown) {
            if(this.entityScene.cameras.main.scrollX-(this.entityScene.cameras.main.displayWidth/2)>-2720) {
                this.entityScene.cameras.main.setScroll(this.entityScene.cameras.main.scrollX-(500*(delta/1000)),this.entityScene.cameras.main.scrollY);
                this.MiniMapOverlay.setX(this.MiniMapOverlay.x-(49*(delta/1000)));
            }
        }

    }
    destroy() {
        this.eventEmitter.removeListener(EventConstants.EntityActions.Move,this.handleMovement,this);
        this.eventEmitter.removeListener(EventConstants.EntityActions.Selected,this.updateSelected, this );
        this.eventEmitter.removeListener(EventConstants.Input.RequestBuildBase,()=>{
            this.eventEmitter.emit(EventConstants.Input.RequestBuildScaffold,this.selectedEntity,BuildingEntityID.Base,  TeamNumbers.Player);
        });
        this.eventEmitter.removeListener(EventConstants.Input.RequestBuildFactory,()=>{
            this.eventEmitter.emit(EventConstants.Input.RequestBuildScaffold,this.selectedEntity,BuildingEntityID.Factory, TeamNumbers.Player);
        });
        this.eventEmitter.removeListener(EventConstants.Input.RequestBuildTurret,()=>{
            this.eventEmitter.emit(EventConstants.Input.RequestBuildScaffold,this.selectedEntity,BuildingEntityID.Turret,  TeamNumbers.Player);
        });
        this.eventEmitter.removeListener(EventConstants.Input.RequestBuildGlider,()=>{
            this.eventEmitter.emit(EventConstants.Input.BuildGlider, this.selectedEntity,  TeamNumbers.Player);
        });
        this.eventEmitter.removeListener(EventConstants.Input.RequestBuildEngineer,()=>{
            this.eventEmitter.emit(EventConstants.Input.BuildEngineer, this.selectedEntity, TeamNumbers.Player);
        });
        this.eventEmitter.removeListener(EventConstants.Input.RequestCancelGlider,()=>{
            this.eventEmitter.emit(EventConstants.Input.CancelGlider, this.selectedEntity,  TeamNumbers.Player);
        });
        this.eventEmitter.removeListener(EventConstants.Input.RequestCancelEngineer,()=>{
            this.eventEmitter.emit(EventConstants.Input.CancelEngineer, this.selectedEntity, TeamNumbers.Player);
        });
        
        EventEmitterSingleton.getInstance().removeListener(EventConstants.Game.Winner, ()=>{
            this.GameStatusText.setText('Winner!');
        });
        EventEmitterSingleton.getInstance().removeListener(EventConstants.Game.Loser, ()=>{
            this.GameStatusText.setText('Loser!');
        });
        this.uiLayout.destroy();
    }
} 
export {UIManager};