import 'phaser';

import { EngineerEntity } from './engineer_entity'
import { BaseEntity } from './base_entity'
import { UIManager } from './UIManager';
import { EasyStarFlightLevelSingleton, EasyStarGroundLevelSingleton } from './EasyStarSingleton';
import { EntityManager } from './EntityManager'
import { MineEntity } from './mine_entity';
import  EasyStar from 'easystarjs'
import { EventConstants } from './GameConstants';
import { EventEmitterSingleton } from './EventEmitterSingleton';
export default class GameScene extends Phaser.Scene {
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

    constructor() {
        super('GameScene');

    }

    preload() {
        this.load.image('tileset', 'assets/tileset.png');
        this.load.spritesheet('tileset_spritesheet', 'assets/tileset.png', { frameWidth: 64, frameHeight: 64 });
        this.load.image('home_base', 'assets/home_base.png');
        this.load.image('portrait_base', 'assets/Portrait_Base.png');
        this.load.image('mine', 'assets/mine.png');
        this.load.tilemapTiledJSON('map', 'assets/tiledmap2.json');
        this.load.spritesheet('player', 'assets/spritesheet.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('player-rock', 'assets/spritesheet_rock.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('turret', 'assets/turret_spritesheet.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('glider', 'assets/glider_spritesheet.png', { frameWidth: 64, frameHeight: 96 });
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
        this.load.image('Portrait', 'assets/portrait.png');  // urls: an array of file url
        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });
    }

    create() {
        this.eventEmitterSingleton = EventEmitterSingleton.getInstance();

        this.input.setGlobalTopOnly(false);
        this.input.setTopOnly(false);
        this.map = this.add.tilemap('map');
        this.scene.launch("UI");
        console.log(this.map);
        var music = this.sound.add('background_music', {
            mute: false,
            volume: 0.5,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: true,
            delay: 0
        });
        music.play();


        var tileset = this.map.addTilesetImage('tileset', 'tileset');
        this.layer1 = this.map.createLayer('Tile Layer 1', [tileset]);
        this.layer2 = this.map.createLayer('Tile Layer 2', [tileset]);
        this.cameras.main.setZoom(1.0);
        this.add.rectangle(1400,15,2100,1800,0xffffff,0x0).setInteractive().setScrollFactor(0).setDepth(1).on('pointerup', (pointer, gameObject)=>{ var x = this.cameras.main.scrollX + pointer.x;
            var y = this.cameras.main.scrollY + pointer.y;
            this.eventEmitterSingleton.emit(EventConstants.EntityActions.Move,new Phaser.Math.Vector2(this.getTileLocation(x,y)));

            });
       /* this.layer1.setInteractive().on('pointerup', (pointer, gameObject)=>{ var x = this.cameras.main.scrollX + pointer.x;
            var y = this.cameras.main.scrollY + pointer.y;
            this.eventEmitterSingleton.emit(EventConstants.EntityActions.Move,new Phaser.Math.Vector2(this.getTileLocation(x,y)));

            });*/
        this.anims.create({
            key: 'glider-test',
            frames: this.anims.generateFrameNumbers('glider', { start: 0, end: 7 }),
            frameRate: 15,
            repeat: -1,
            yoyo: true
        });
        //N,NE,E,SE,S,SW,W,NW,N
        this.anims.create({
            key: 'glider-N',
            frames: this.anims.generateFrameNumbers('glider', { start: 0, end: 7  }),
            frameRate: 15,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'glider-NW',
            frames: this.anims.generateFrameNumbers('glider', { start: 8, end: 15 }),
            frameRate: 15,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'glider-W',
            frames: this.anims.generateFrameNumbers('glider', { start: 16, end: 23 }),
            frameRate: 15,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'glider-SW',
            frames: this.anims.generateFrameNumbers('glider', { start: 24, end: 31 }),
            frameRate: 15,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'glider-S',
            frames: this.anims.generateFrameNumbers('glider', { start: 32, end: 39 }),
            frameRate: 15,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'glider-SE',
            frames: this.anims.generateFrameNumbers('glider', { start: 40, end: 47 }),
            frameRate: 15,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'glider-E',
            frames: this.anims.generateFrameNumbers('glider', { start: 48, end: 55 }),
            frameRate: 15,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'glider-NE',
            frames: this.anims.generateFrameNumbers('glider', { start: 56, end: 63 }),
            frameRate: 15,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'engineer-N',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 4 }),
            frameRate: 15,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'engineer-NW',
            frames: this.anims.generateFrameNumbers('player', { start: 5, end: 9 }),
            frameRate: 15,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'engineer-W',
            frames: this.anims.generateFrameNumbers('player', { start: 10, end: 14 }),
            frameRate: 15,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'engineer-SW',
            frames: this.anims.generateFrameNumbers('player', { start: 15, end: 19 }),
            frameRate: 15,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'engineer-S',
            frames: this.anims.generateFrameNumbers('player', { start: 20, end: 24 }),
            frameRate: 15,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'engineer-SE',
            frames: this.anims.generateFrameNumbers('player', { start: 25, end: 29 }),
            frameRate: 15,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'engineer-E',
            frames: this.anims.generateFrameNumbers('player', { start: 30, end: 34 }),
            frameRate: 15,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'engineer-NE',
            frames: this.anims.generateFrameNumbers('player', { start: 35, end: 39 }),
            frameRate: 15,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'Miningengineer-N',
            frames: this.anims.generateFrameNumbers('player-rock', { start: 0, end: 4 }),
            frameRate: 15,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'Miningengineer-NW',
            frames: this.anims.generateFrameNumbers('player-rock', { start: 5, end: 9 }),
            frameRate: 15,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'Miningengineer-W',
            frames: this.anims.generateFrameNumbers('player-rock', { start: 10, end: 14 }),
            frameRate: 15,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'Miningengineer-SW',
            frames: this.anims.generateFrameNumbers('player-rock', { start: 15, end: 19 }),
            frameRate: 15,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'Miningengineer-S',
            frames: this.anims.generateFrameNumbers('player-rock', { start: 20, end: 24 }),
            frameRate: 15,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'Miningengineer-SE',
            frames: this.anims.generateFrameNumbers('player-rock', { start: 25, end: 29 }),
            frameRate: 15,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'Miningengineer-E',
            frames: this.anims.generateFrameNumbers('player-rock', { start: 30, end: 34 }),
            frameRate: 15,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'Miningengineer-NE',
            frames: this.anims.generateFrameNumbers('player-rock', { start: 35, end: 39 }),
            frameRate: 15,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'player-walk2',
            frames: this.anims.generateFrameNumbers('player-rock', { start: 15, end: 19 }),
            frameRate: 15,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'player-walk3',
            frames: this.anims.generateFrameNumbers('player-rock', { start: 30, end: 34 }),
            frameRate: 15,
            repeat: -1,
            yoyo: true
        });
        this.entityManager = new EntityManager(this, this.map);

        this.mine = this.entityManager.createMineEntity(6, 6);
        this.base = this.entityManager.createBaseEntity(14, 5);
        this.base = this.entityManager.createBaseEntity(16, 16);
        this.mine = this.entityManager.createMineEntity(6, 14);
        var turret = this.entityManager.createTurretEntity(9, 9);
        var turret = this.entityManager.createGliderEntity(15, 7);
        this.player = this.entityManager.createEngineerEntity(3, 4);
        //let uiPortraitParentLayout:UIParentLayout = new UIParentLayout(this,portraitLayout,uiLayout,110,400)

        this.finder = EasyStarGroundLevelSingleton.getInstance(); //new EasyStarWrapper();
        this.setupPathFinder(this.finder,this.layer1);
        this.setupPathFinder(EasyStarFlightLevelSingleton.getInstance(),this.layer2);
        for (var i = 0; i <= 16; i++) {
            this.SetupLargeTiles(i);
        }

        //this.addDepthsToTiles(sprites);


    }

    setupPathFinder(pathFinder:EasyStar.js,layer:Phaser.Tilemaps.TilemapLayer )
    {
        var grid = [];
        for (var y = 0; y < this.map.height; y++) {
            var col = [];
            for (var x = 0; x < this.map.width; x++) {
                // In each cell we store the ID of the tile, which corresponds
                // to its index in the tileset of the map ("ID" field in Tiled)

                col.push(layer.getTileAt(x, y).index);
            }
            grid.push(col);
        }
        pathFinder.setGrid(grid);

        var tileset = this.map.tilesets[0];
        var properties = tileset.tileProperties;
        var acceptableTiles = [];

        for (var i = tileset.firstgid - 1; i < tileset.total; i++) { // firstgid and total are fields from Tiled that indicate the range of IDs that the tiles can take in that tileset
            if (!properties.hasOwnProperty(i)) {
                // If there is no property indicated at all, it means it's a walkable tile
                acceptableTiles.push(i + 1);
                continue;
            }
            if (!properties[i].collide) acceptableTiles.push(i + 1);
            if (properties[i].cost) this.finder.setTileCost(i + 1, properties[i].cost); // If there is a cost attached to the tile, let's register it
        }
        pathFinder.setAcceptableTiles(acceptableTiles);
        pathFinder.enableDiagonals();
        pathFinder.setIterationsPerCalculation(1000);
    }

    update(time, delta) {
        this.entityManager.update();

    }

    SetupLargeTiles(tileID) {
        var sprites = this.layer1.createFromTiles(tileID, 18, { key: "tileset_spritesheet", frame: tileID - 1 }, this, this.cameras.main);
        this.addDepthsToTiles(sprites);
    }




    addDepthsToTiles(sprites: Phaser.GameObjects.Sprite[]) {
        for (let entry of sprites) {
            var tilePos = this.layer1.worldToTileXY(entry.x, entry.y);
            entry.setDepth(tilePos.x + tilePos.y);
            entry.setPosition(entry.x + 32, entry.y + 32);

        }
    }

    getTileLocation(x:number,y:number) : Phaser.Math.Vector2
    {
        return Phaser.Tilemaps.Components.IsometricWorldToTileXY(x, y-16, true, new Phaser.Math.Vector2, this.cameras.main, this.map.getLayer(0));

    }

}
export {GameScene}
