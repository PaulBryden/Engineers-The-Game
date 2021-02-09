

import 'phaser';
import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import { GridTable } from 'phaser3-rex-plugins/templates/ui/ui-components.js';
import { AttackButton, GatherButton, BuildButton, CancelButton } from './image_button';
import { UIButtonLayout, EngineerUIButtonLayout } from './ui_button_layout';
import { Entity } from './entity'
import { UIPortraitLayout } from './ui_portrait_layout';
import { UIParentLayout, UIFactory } from './ui_parent_layout';
import { EngineerEntity } from './engineer_entity'
import { BaseEntity } from './base_entity'
import { EventEmitterSingleton } from './EventEmitterSingleton'
import { UIManager } from './UIManager';
import { EasyStarSingleton } from './EasyStarSingleton';
import { EntityManager } from './EntityManager'
export default class Demo extends Phaser.Scene {
    controls: any;
    finder: EasyStarSingleton;
    map: Phaser.Tilemaps.Tilemap;
    player: EngineerEntity;
    base: BaseEntity;
    layer1: Phaser.Tilemaps.TilemapLayer;
    uiManager: UIManager;
    entityManager: EntityManager;

    constructor() {
        super('demo');
    }

    preload() {
        this.load.image('tileset', 'assets/tileset.png');
        this.load.spritesheet('tileset_spritesheet', 'assets/tileset.png', { frameWidth: 64, frameHeight: 64 });
        this.load.image('home_base', 'assets/home_base.png');
        this.load.image('portrait_base', 'assets/Portrait_Base.png');
        this.load.tilemapTiledJSON('map', 'assets/tiledmap.json');
        this.load.spritesheet('player', 'assets/spritesheet.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('player-rock', 'assets/spritesheet_rock.png', { frameWidth: 64, frameHeight: 64 });
        this.load.image('ui_overlay', 'assets/ui_overlay.png');
        this.load.image('ui_button', 'assets/ui_button.png');
        this.load.image('ui_button_Attack', 'assets/ui_button_Attack.png');
        this.load.image('ui_button_Build', 'assets/ui_button_Build.png');
        this.load.image('ui_button_Cancel', 'assets/ui_button_Cancel.png');
        this.load.image('ui_button_Gather', 'assets/ui_button_Gather.png');
        this.load.image('Portrait_Engineer', 'assets/Portrait_Engineer.png');
        this.load.image('ui_button_not_pressed', 'assets/ui_button_not_pressed.png');
        this.load.image('ui_button_Attack_No_Background', 'assets/ui_button_Attack_No_Background.png');
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
        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });
    }

    create() {


        this.input.setGlobalTopOnly(true);
        this.input.setTopOnly(true);
        this.map = this.add.tilemap('map');

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
        this.add.rectangle(1400,15,2100,1800,0xffffff,0x0).setInteractive().setScrollFactor(0).setDepth(1).on('pointerup', (pointer, gameObject)=>{this.handleClick(pointer,gameObject)});
        this.layer1.setDepth(0);
        //this.layer1.setInteractive().input.hitArea.setTo(-64*this.layer1.width*0.5,0,64*2*this.layer1.height,64*2*this.layer1.width);
        //this.layer1.on('pointerup', (pointer, gameObject)=>{this.handleClick(pointer,gameObject)});
        var cursors = this.input.keyboard.createCursorKeys();

        this.cameras.main.setZoom(1.0);
        //N,NE,E,SE,S,SW,W,NW,N
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
        this.uiManager = new UIManager(this.base);
        this.entityManager = new EntityManager(this, this.map);

        this.player = this.entityManager.createEngineerEntity(3, 4);
        this.base = new BaseEntity(this.map, this, 5, 5);
        //let uiPortraitParentLayout:UIParentLayout = new UIParentLayout(this,portraitLayout,uiLayout,110,400)


        var sprite2 = this.add.sprite(-185, 200, 'player-rock');
        sprite2.anims.play('player-walk2', true);

        var sprite3 = this.add.sprite(-185, 500, 'player-rock');
        this.add.image(800, 450, 'ui_overlay').setScrollFactor(0).setScale(2).setDepth(250);



        var scrollMode = 0; // 0:vertical, 1:horizontal

        this.finder = EasyStarSingleton.getInstance(); //new EasyStarWrapper();
        var grid = [];
        for (var y = 0; y < this.map.height; y++) {
            var col = [];
            for (var x = 0; x < this.map.width; x++) {
                // In each cell we store the ID of the tile, which corresponds
                // to its index in the tileset of the map ("ID" field in Tiled)

                console.log(this.layer1.getTileAt(x, y).index);
                col.push(this.layer1.getTileAt(x, y).index);
            }
            grid.push(col);
        }
        this.finder.setGrid(grid);

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
        this.finder.setAcceptableTiles(acceptableTiles);
        this.finder.enableDiagonals();
        this.finder.setIterationsPerCalculation(50);
        for (var i = 0; i <= 16; i++) {
            this.SetupLargeTiles(i);
        }

        //this.addDepthsToTiles(sprites);

        var controlConfig = {
            camera: this.cameras.main,
            left: cursors.left,
            right: cursors.right,
            up: cursors.up,
            down: cursors.down,
            acceleration: 0.04,
            drag: 0.0005,
            maxSpeed: 0.4
        };

        this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);
        var tween = this.tweens.add({
            targets: sprite3,
            x: { from: sprite3.x, to: sprite3.x + 400 },
            // alpha: { start: 0, to: 1 },
            // alpha: 1,
            // alpha: '+=1',
            ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
            duration: 5000,
            repeat: 0,            // -1: infinity
            yoyo: false
        });
    }

    update(time, delta) {
        this.controls.update(delta);
        let worldPoint: any = this.input.activePointer.positionToCamera(this.cameras.main);
        this.entityManager.update();

    }


    checkCollision(x, y) {
        var tile = this.map.getTileAt(x, y);
        return tile.properties.collide == true;
    };

    SetupLargeTiles(tileID) {
        var sprites = this.layer1.createFromTiles(tileID, 18, { key: "tileset_spritesheet", frame: tileID - 1 }, this, this.cameras.main);
        this.addDepthsToTiles(sprites);
    }



    handleClick(pointer, gameobject) {
            var x = this.cameras.main.scrollX + pointer.x;
            var y = this.cameras.main.scrollY + pointer.y;

            var testCoords;
            var TargetPos = Phaser.Tilemaps.Components.IsometricWorldToTileXY(x, y, true, testCoords, this.cameras.main, this.layer1.layer);
            this.uiManager.moveSelected(TargetPos);
        
        /*
            this.finder.findPath(PlayerPos.x-1, PlayerPos.y-1, TargetPos.x-1, TargetPos.y-1, (path) => {
                if (path === null) {
                    console.warn("Path was not found.");
                } else {
                    console.log(path);
                    this.moveCharacter(path);
                }
            });
            this.finder.calculate(); // don't forget, otherwise nothing happens*/

    };

    addDepthsToTiles(sprites: Phaser.GameObjects.Sprite[]) {
        for (let entry of sprites) {
            var tilePos = this.layer1.worldToTileXY(entry.x, entry.y);
            entry.setDepth(tilePos.x + tilePos.y);
            entry.setPosition(entry.x + 32, entry.y + 32);

        }
    }
    /*
    moveCharacter(path){
        // Sets up a list of tweens, one for each tile to walk, that will be chained by the timeline
        var tweens = [];
        for(var i = 0; i < path.length-1; i++){
            var ex = path[i+1].x;
            var ey = path[i+1].y;
            var testCoords;
            var xyPos = Phaser.Tilemaps.Components.IsometricTileToWorldXY(ex+1,ey+1,testCoords,this.cameras.main,this.layer1.layer);
            console.log(xyPos.x);
            tweens.push({
                targets: this.player,
                x: {value: xyPos.x+30,  duration: 500},
                y: {value: xyPos.y+5, duration: 500}
            });
        }
    
        this.tweens.timeline({
            tweens: tweens
        });
    };*/

}

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#125555',
    width: 1600,
    height: 900,
    scene: Demo,
    antialias: true,
    plugins: {
        scene: [{
            key: 'rexUI',
            plugin: UIPlugin,
            mapping: 'rexUI'
        }
        ]
    }
};

const game = new Phaser.Game(config);
