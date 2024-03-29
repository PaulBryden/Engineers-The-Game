import 'phaser';

import { EngineerEntity } from '../units/EngineerEntity';
import { BaseEntity } from '../units/BaseEntity';
import { UIManager } from '../ui/UIManager';
import { EasyStarFlightLevelSingleton, EasyStarGroundLevelSingleton } from '../logic/EasyStarSingleton';
import { EntityManager } from '../logic/EntityManager';
import { MineEntity } from '../units/MineEntity';
import  EasyStar from 'easystarjs';
import { BuildingEntityID, EventConstants, GameStatus, StartOfGame, TeamNumbers, Zoom } from '../logic/GameConstants';
import { EventEmitterSingleton } from '../logic/EventEmitterSingleton';
import { AIPlayer } from '../logic/AIPlayer';
import { TurretEntity } from '../units/TurretEntity';
export default class GameScene extends Phaser.Scene 
{
    finder: EasyStarGroundLevelSingleton;
    map: Phaser.Tilemaps.Tilemap;
    player: EngineerEntity;
    mine: MineEntity;
    base: BaseEntity;
    layer1: Phaser.Tilemaps.TilemapLayer;
    layer2: Phaser.Tilemaps.TilemapLayer;
    entityManager: EntityManager;
    minimap: Phaser.Cameras.Scene2D.Camera;
    eventEmitterSingleton: EventEmitterSingleton;
    fogOfWar: Phaser.GameObjects.RenderTexture;
    AIPlayer: AIPlayer;
    AIPlayer2: AIPlayer;
    ClickableOverlay: Phaser.GameObjects.Rectangle;
    music: Phaser.Sound.BaseSound;
    constructor() 
    {
        super('GameScene');

    }

    preload() 
    {
        this.load.image('tileset', 'assets/tileset.png');
        this.load.spritesheet('tileset_spritesheet', 'assets/tileset.png', { frameWidth: 64, frameHeight: 64 });
        this.load.image('home_base-1', 'assets/home_base.png');
        this.load.image('portrait_base', 'assets/Portrait_Base.png');
        this.load.image('factory-1', 'assets/Factory.png');
        this.load.image('scaffold', 'assets/scaffold.png');
        this.load.image('mine', 'assets/mine.png');
        this.load.tilemapTiledJSON('map', 'assets/tiledmap3.json');
        this.load.spritesheet('player-1', 'assets/spritesheet.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('player-rock-1', 'assets/spritesheet_rock.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('player-action-1', 'assets/spritesheet_build.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('turret-1', 'assets/turret-test-spritesheet-cropped.png', { frameWidth: 64, frameHeight: 32 });
        this.load.spritesheet('turret-2', 'assets/turret-test-spritesheet-2-cropped.png', { frameWidth: 64, frameHeight: 32 });
        this.load.spritesheet('glider-1', 'assets/glider_spritesheet.png', { frameWidth: 64, frameHeight: 96 });
        this.load.spritesheet('gliderPortrait-1', 'assets/glider_portrait.png', { frameWidth: 64, frameHeight: 96 });
        this.load.image('home_base-2', 'assets/home_base-2.png');
        this.load.image('factory-2', 'assets/Factory-2.png');
        this.load.spritesheet('player-2', 'assets/spritesheet-2.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('player-rock-2', 'assets/spritesheet_rock-2.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('player-action-2', 'assets/spritesheet_build-2.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('turret-2', 'assets/turret_spritesheet-2.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('glider-2', 'assets/glider_spritesheet-2.png', { frameWidth: 64, frameHeight: 96 });
        this.load.image('ui_button', 'assets/ui_button.png');
        this.load.image('ui_button_Attack', 'assets/ui_button_Attack.png');
        this.load.image('ui_button_Build', 'assets/ui_button_Build.png');
        this.load.image('ui_button_Cancel', 'assets/ui_button_Cancel.png');
        this.load.image('ui_button_Gather', 'assets/ui_button_Gather.png');
        this.load.image('Portrait_Engineer', 'assets/engineer_portrait.png');
        this.load.image('ui_button_not_pressed', 'assets/ui_button_not_pressed.png');
        this.load.image('ui_button_Attack_No_Background', 'assets/ui_button_Attack_No_Background.png');
        this.load.image('resource', 'assets/resource.png');
        this.load.image('ui_button_Build_No_Background', 'assets/ui_button_Build_No_Background.png');
        this.load.image('ui_button_Gather_No_Background', 'assets/ui_button_Gather_No_Background.png');
        this.load.image('ui_button_Cancel_No_Background', 'assets/ui_button_Cancel_No_Background.png');
        this.load.image('ui_button_Build_Engineer_No_Background', 'assets/ui_button_Engineer_Build_No_Background.png');
        this.load.audio('background_music', 'assets/background_music.mp3');  // urls: an array of file url
        this.load.audio('Engineer_Attacking', 'assets/Engineer_Attacking.mp3');  // urls: an array of file url
        this.load.audio('Engineer_Idle_Selected_1', 'assets/Engineer_Idle_Selected_1.mp3');  // urls: an array of file url
        this.load.audio('Engineer_Idle_Selected_2', 'assets/Engineer_Idle_Selected_2.mp3');  // urls: an array of file url
        this.load.audio('Engineer_Mining', 'assets/Engineer_Mining.mp3');  // urls: an array of file url
        this.load.audio('Engineer_Moving_1', 'assets/Engineer_Moving_1.mp3');  // urls: an array of file url
        this.load.audio('Engineer_Moving_2', 'assets/Engineer_Moving_2.mp3');  // urls: an array of file url
        this.load.audio('laser', 'assets/laser.mp3');  // urls: an array of file url
        this.load.audio('explosion', 'assets/destroyed.mp3');  // urls: an array of file url
        this.load.audio('blocked', 'assets/blocked.mp3');  // urls: an array of file url
        this.load.audio('addResource', 'assets/resource_add.mp3');  // urls: an array of file url
        this.load.image('Portrait', 'assets/portrait.png');  // urls: an array of file url
        this.load.image('vision', 'assets/mask.png');  // urls: an array of file url this.load.image('tileset', 'assets/tileset.png');
        this.load.spritesheet('tileset_spritesheet', 'assets/tileset.png', { frameWidth: 64, frameHeight: 64 });
        this.load.image('portrait_base', 'assets/Portrait_Base.png');
        this.load.image('mine', 'assets/mine.png');
        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });
    }

    resetGame() 
    {
        EventEmitterSingleton.getInstance().removeAllListeners(); //Cleanup Event Listeners
        this.tweens.getAllTweens().forEach(element => 
        {
            element.stop();
        }); //Cleanup Tweens
        this.children.getAll().forEach(element=>
        {
            if(element instanceof Phaser.GameObjects.PointLight)
            {
                element.destroy();
            }
        }); //Cleanup bullets
        
        this.music.stop();
        this.music.play();
        if(this.entityManager) 
        {
            this.entityManager.deleteAllEntities();
            delete this.entityManager;
        }
        
        
        if(this.AIPlayer) 
        {
            this.AIPlayer.running=false;
            this.AIPlayer=null;
        }
        if(this.AIPlayer2) 
        {
            this.AIPlayer2.running=false;
            this.AIPlayer2=null;
        }
       
    }

    setup(isGame: boolean) 
    { 
        this.resetGame();
        Zoom.ZoomLevel=1.2;        
        if(!this.eventEmitterSingleton) 
        {
            this.eventEmitterSingleton = EventEmitterSingleton.getInstance();
        }
        
        if(!this.map) 
        {
            this.map = this.add.tilemap('map');
            const tileset = this.map.addTilesetImage('tileset', 'tileset');
            this.layer1 = this.map.createLayer('Tile Layer 1', [tileset]);
            this.layer2 = this.map.createLayer('Tile Layer 2', [tileset]);

        }
        
        if(!this.fogOfWar) 
        {
            this.fogOfWar = this.make.renderTexture({
                width:3900,
                height: 1900,
                x:-1950,
                y:-200
            }, true);
        
            // fill it with black
            this.fogOfWar.fill(0x424242, 1);
            this.fogOfWar.setDepth(101);
            // draw the floorLayer into it
            this.fogOfWar.draw(this.layer2,1950,200);
            this.fogOfWar.draw(this.layer1,1950,200);
    
            // set a dark blue tint
            this.fogOfWar.setTint(0x0a2948);
        
        }

        GameStatus.ActiveGame=isGame;
        if(!this.entityManager) 
        {
            this.entityManager = new EntityManager(this, this.map, this.fogOfWar);
        }

        this.cameras.main.setZoom(Zoom.ZoomLevel);
        this.cameras.main.setScroll(-900,-40);
        this.cameras.main.setBackgroundColor(0x002244);

            

        this.mine = this.entityManager.createMineEntity(6, 6);
        this.mine = this.entityManager.createMineEntity(44, 44);
        this.base = this.entityManager.createBaseEntity(14, 5,1);
        this.base = this.entityManager.createBaseEntity(45, 36,2);
        this.player = this.entityManager.createEngineerEntity(3, 4,1);
        this.entityManager.createTurretEntity(2, 2,1);
        this.player = this.entityManager.createEngineerEntity(38,38,2);
        this.entityManager.createTurretEntity(40, 40,2);
        //let uiPortraitParentLayout:UIParentLayout = new UIParentLayout(this,portraitLayout,uiLayout,110,400)
  
        if(!this.finder) 
        {
            this.finder = EasyStarGroundLevelSingleton.getInstance(); //new EasyStarWrapper();
              
            this.setupPathFinder(this.finder,this.layer1);
            this.setupPathFinder(EasyStarFlightLevelSingleton.getInstance(),this.layer2);
            for (let i = 0; i <= 16; i++) 
            {
                this.SetupLargeTiles(i);
            }

        }

    
        //this.addDepthsToTiles(sprites);
        this.AIPlayer = new AIPlayer(this.entityManager,TeamNumbers.Enemy, TeamNumbers.Player);
        !isGame?this.AIPlayer2 = new AIPlayer(this.entityManager,TeamNumbers.Player, TeamNumbers.Enemy):()=>
        {};

        if(this.ClickableOverlay!=null) 
        {
            this.ClickableOverlay.removeInteractive();
            this.ClickableOverlay.destroy();
        }
        this.ClickableOverlay=this.add.rectangle(1400,15,2100,1800,0xffffff,0x0).setInteractive().setScrollFactor(0).setDepth(1).on('pointerup', (pointer, gameObject)=>
        { 
                    
            try
            {
                let x = this.cameras.main.scrollX + pointer.x;
                let y = this.cameras.main.scrollY + pointer.y;
                const camCenterX = this.cameras.main.worldView.centerX;
                const camCenterY = this.cameras.main.worldView.centerY;
                // The extra x and y, which we need to add to endX and endY, so that the final position is indeed 800 and 600.
                // We take the distance between endX and the center of the camera and multiply it by a transformation constant which depends on the camera
        
                const extraX = (x - camCenterX) *((1/Zoom.ZoomLevel)-1); // another way of writing this is (1-zoom)/zoom
                const extraY = (y-camCenterY)*((1/Zoom.ZoomLevel)-1);
                x+=extraX;
                y+=extraY;
                this.eventEmitterSingleton.emit(EventConstants.EntityActions.Move,new Phaser.Math.Vector2(this.getTileLocation(x,y)));
            }
            finally
            {}
        });
                    
        isGame? this.scene.launch('UI'):()=>
        {};
        isGame?this.scene.moveUp('UI'):{};
        isGame?(this.scene.get('UI')).events.on('create', ()=>
        {
            this.tweens.add({
                targets: this,
                NOTHING: { value: 0, duration: 10 },
                onComplete: () => 
                {
                    EventEmitterSingleton.getInstance().emit(EventConstants.Game.UpdateResourceCount, this.entityManager.resources.get(TeamNumbers.Player), TeamNumbers.Player);
                    EventEmitterSingleton.getInstance().emit(EventConstants.Game.UpdateResourceCount, this.entityManager.resources.get(TeamNumbers.Enemy), TeamNumbers.Enemy);
                }
            } );
        }):{};
    }

    create() 
    {
      
        this.input.setGlobalTopOnly(true);
        this.input.setTopOnly(true);
        this.music = this.sound.add('background_music', {
            mute: false,
            volume: 0.5,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: true,
            delay: 0
        });

        //N,NE,E,SE,S,SW,W,NW,N
        this.anims.create({
            key: 'turret-1',
            frames: this.anims.generateFrameNumbers('turret-1', { start: 0, end: 4  }),
            frameRate: 15,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'turret-2',
            frames: this.anims.generateFrameNumbers('turret-2', { start: 0, end: 4  }),
            frameRate: 15,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'glider-1-N',
            frames: this.anims.generateFrameNumbers('glider-1', { start: 0, end: 7  }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'glider-1-NW',
            frames: this.anims.generateFrameNumbers('glider-1', { start: 8, end: 15 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'glider-1-W',
            frames: this.anims.generateFrameNumbers('glider-1', { start: 16, end: 23 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'glider-1-SW',
            frames: this.anims.generateFrameNumbers('glider-1', { start: 24, end: 31 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'glider-1-S',
            frames: this.anims.generateFrameNumbers('glider-1', { start: 32, end: 39 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'glider-1-SE',
            frames: this.anims.generateFrameNumbers('glider-1', { start: 40, end: 47 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'glider-1-E',
            frames: this.anims.generateFrameNumbers('glider-1', { start: 48, end: 55 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'glider-1-NE',
            frames: this.anims.generateFrameNumbers('glider-1', { start: 56, end: 63 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'engineer-1-N',
            frames: this.anims.generateFrameNumbers('player-1', { start: 0, end: 4 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'engineer-1-NW',
            frames: this.anims.generateFrameNumbers('player-1', { start: 5, end: 9 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'engineer-1-W',
            frames: this.anims.generateFrameNumbers('player-1', { start: 10, end: 14 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'engineer-1-SW',
            frames: this.anims.generateFrameNumbers('player-1', { start: 15, end: 19 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'engineer-1-S',
            frames: this.anims.generateFrameNumbers('player-1', { start: 20, end: 24 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'engineer-1-SE',
            frames: this.anims.generateFrameNumbers('player-1', { start: 25, end: 29 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'engineer-1-E',
            frames: this.anims.generateFrameNumbers('player-1', { start: 30, end: 34 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'engineer-1-NE',
            frames: this.anims.generateFrameNumbers('player-1', { start: 35, end: 39 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'Miningengineer-1-N',
            frames: this.anims.generateFrameNumbers('player-rock-1', { start: 0, end: 4 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'Miningengineer-1-NW',
            frames: this.anims.generateFrameNumbers('player-rock-1', { start: 5, end: 9 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'Miningengineer-1-W',
            frames: this.anims.generateFrameNumbers('player-rock-1', { start: 10, end: 14 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'Miningengineer-1-SW',
            frames: this.anims.generateFrameNumbers('player-rock-1', { start: 15, end: 19 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'Miningengineer-1-S',
            frames: this.anims.generateFrameNumbers('player-rock-1', { start: 20, end: 24 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'Miningengineer-1-SE',
            frames: this.anims.generateFrameNumbers('player-rock-1', { start: 25, end: 29 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'Miningengineer-1-E',
            frames: this.anims.generateFrameNumbers('player-rock-1', { start: 30, end: 34 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'Miningengineer-1-NE',
            frames: this.anims.generateFrameNumbers('player-rock-1', { start: 35, end: 39 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'Actionengineer-1-N',
            frames: this.anims.generateFrameNumbers('player-action-1', { start: 0, end: 4 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'Actionengineer-1-NW',
            frames: this.anims.generateFrameNumbers('player-action-1', { start: 5, end: 9 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'Actionengineer-1-W',
            frames: this.anims.generateFrameNumbers('player-action-1', { start: 10, end: 14 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'Actionengineer-1-SW',
            frames: this.anims.generateFrameNumbers('player-action-1', { start: 15, end: 19 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'Actionengineer-1-S',
            frames: this.anims.generateFrameNumbers('player-action-1', { start: 20, end: 24 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'Actionengineer-1-SE',
            frames: this.anims.generateFrameNumbers('player-action-1', { start: 25, end: 29 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'Actionengineer-1-E',
            frames: this.anims.generateFrameNumbers('player-action-1', { start: 30, end: 34 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'Actionengineer-1-NE',
            frames: this.anims.generateFrameNumbers('player-action-1', { start: 35, end: 39 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        //N,NE,E,SE,S,SW,W,NW,N
        this.anims.create({
            key: 'glider-2-N',
            frames: this.anims.generateFrameNumbers('glider-2', { start: 0, end: 7  }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'glider-2-NW',
            frames: this.anims.generateFrameNumbers('glider-2', { start: 8, end: 15 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'glider-2-W',
            frames: this.anims.generateFrameNumbers('glider-2', { start: 16, end: 23 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'glider-2-SW',
            frames: this.anims.generateFrameNumbers('glider-2', { start: 24, end: 31 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'glider-2-S',
            frames: this.anims.generateFrameNumbers('glider-2', { start: 32, end: 39 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'glider-2-SE',
            frames: this.anims.generateFrameNumbers('glider-2', { start: 40, end: 47 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'glider-2-E',
            frames: this.anims.generateFrameNumbers('glider-2', { start: 48, end: 55 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'glider-2-NE',
            frames: this.anims.generateFrameNumbers('glider-2', { start: 56, end: 63 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'engineer-2-N',
            frames: this.anims.generateFrameNumbers('player-2', { start: 0, end: 4 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'engineer-2-NW',
            frames: this.anims.generateFrameNumbers('player-2', { start: 5, end: 9 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'engineer-2-W',
            frames: this.anims.generateFrameNumbers('player-2', { start: 10, end: 14 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'engineer-2-SW',
            frames: this.anims.generateFrameNumbers('player-2', { start: 15, end: 19 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'engineer-2-S',
            frames: this.anims.generateFrameNumbers('player-2', { start: 20, end: 24 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'engineer-2-SE',
            frames: this.anims.generateFrameNumbers('player-2', { start: 25, end: 29 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'engineer-2-E',
            frames: this.anims.generateFrameNumbers('player-2', { start: 30, end: 34 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'engineer-2-NE',
            frames: this.anims.generateFrameNumbers('player-2', { start: 35, end: 39 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'Miningengineer-2-N',
            frames: this.anims.generateFrameNumbers('player-rock-2', { start: 0, end: 4 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'Miningengineer-2-NW',
            frames: this.anims.generateFrameNumbers('player-rock-2', { start: 5, end: 9 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'Miningengineer-2-W',
            frames: this.anims.generateFrameNumbers('player-rock-2', { start: 10, end: 14 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'Miningengineer-2-SW',
            frames: this.anims.generateFrameNumbers('player-rock-2', { start: 15, end: 19 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'Miningengineer-2-S',
            frames: this.anims.generateFrameNumbers('player-rock-2', { start: 20, end: 24 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'Miningengineer-2-SE',
            frames: this.anims.generateFrameNumbers('player-rock-2', { start: 25, end: 29 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'Miningengineer-2-E',
            frames: this.anims.generateFrameNumbers('player-rock-2', { start: 30, end: 34 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'Miningengineer-2-NE',
            frames: this.anims.generateFrameNumbers('player-rock-2', { start: 35, end: 39 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'Actionengineer-2-N',
            frames: this.anims.generateFrameNumbers('player-action-2', { start: 0, end: 4 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'Actionengineer-2-NW',
            frames: this.anims.generateFrameNumbers('player-action-2', { start: 5, end: 9 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'Actionengineer-2-W',
            frames: this.anims.generateFrameNumbers('player-action-2', { start: 10, end: 14 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'Actionengineer-2-SW',
            frames: this.anims.generateFrameNumbers('player-action-2', { start: 15, end: 19 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'Actionengineer-2-S',
            frames: this.anims.generateFrameNumbers('player-action-2', { start: 20, end: 24 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'Actionengineer-2-SE',
            frames: this.anims.generateFrameNumbers('player-action-2', { start: 25, end: 29 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'Actionengineer-2-E',
            frames: this.anims.generateFrameNumbers('player-action-2', { start: 30, end: 34 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'Actionengineer-2-NE',
            frames: this.anims.generateFrameNumbers('player-action-2', { start: 35, end: 39 }),
            frameRate: 20,
            repeat: -1,
            yoyo: true
        });
     

    }

    setupPathFinder(pathFinder:EasyStar.js,layer:Phaser.Tilemaps.TilemapLayer ) 
    {
        const grid = [];
        for (let y = 0; y < this.map.height; y++) 
        {
            const col = [];
            for (let x = 0; x < this.map.width; x++) 
            {
                // In each cell we store the ID of the tile, which corresponds
                // to its index in the tileset of the map ("ID" field in Tiled)

                col.push(layer.getTileAt(x, y).index);
            }
            grid.push(col);
        }
        pathFinder.setGrid(grid);

        const tileset = this.map.tilesets[0];
        const properties = tileset.tileProperties;
        const acceptableTiles = [];

        for (let i = tileset.firstgid - 1; i < tileset.total; i++) 
        { // firstgid and total are fields from Tiled that indicate the range of IDs that the tiles can take in that tileset
            if (!properties.hasOwnProperty(i)) 
            {
                // If there is no property indicated at all, it means it's a walkable tile
                acceptableTiles.push(i + 1);
                continue;
            }
            if (!properties[i].collide) acceptableTiles.push(i + 1);
            if (properties[i].cost) this.finder.setTileCost(i + 1, properties[i].cost); // If there is a cost attached to the tile, let's register it
        }
        pathFinder.setAcceptableTiles(acceptableTiles);
        pathFinder.enableDiagonals();
    }

    update(time, delta) 
    {
        this.entityManager.update(delta);
    }

    SetupLargeTiles(tileID) 
    {
        const sprites = this.layer1.createFromTiles(tileID, 18, { key: 'tileset_spritesheet', frame: tileID - 1 }, this, this.cameras.main);
        this.addDepthsToTiles(sprites);
    }

    addDepthsToTiles(sprites: Phaser.GameObjects.Sprite[]) 
    {
        for (const entry of sprites) 
        {
            const tilePos = this.layer1.worldToTileXY(entry.x, entry.y);
            entry.setDepth(tilePos.x + tilePos.y);
            entry.setPosition(entry.x + 32, entry.y + 32);

        }
    }

    getTileLocation(x:number,y:number) : Phaser.Math.Vector2 
    {
        return Phaser.Tilemaps.Components.IsometricWorldToTileXY(x, y-16, true, new Phaser.Math.Vector2, this.cameras.main, this.map.getLayer(0));

    }

}
export {GameScene};