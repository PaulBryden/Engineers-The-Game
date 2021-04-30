import 'phaser';

import { EngineerEntity } from './engineer_entity'
import { BaseEntity } from './base_entity'
import { UIManager } from './UIManager';
import { EasyStarFlightLevelSingleton, EasyStarGroundLevelSingleton } from './EasyStarSingleton';
import { EntityManager } from './EntityManager'
import { MineEntity } from './mine_entity';
import  EasyStar from 'easystarjs'
import { BuildingEntityID, EventConstants, StartOfGame, TeamNumbers } from './GameConstants';
import { EventEmitterSingleton } from './EventEmitterSingleton';
import { AIPlayer } from './AIPlayer';
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
    fogOfWar: Phaser.GameObjects.RenderTexture;
    AIPlayer: AIPlayer;
    AIPlayer2: AIPlayer;
    constructor() {
        super('GameScene');

    }

    preload() {

    }

    resetGame()
    {
        if(this.entityManager)
        {
            this.entityManager.deleteAllEntities();
            this.entityManager.resources.set(TeamNumbers.Enemy, StartOfGame.resourceCount);
            this.entityManager.resources.set(TeamNumbers.Player, StartOfGame.resourceCount);
            EventEmitterSingleton.getInstance().emit(EventConstants.Game.UpdateResourceCount, this.entityManager.resources.get(TeamNumbers.Player), TeamNumbers.Player);
            EventEmitterSingleton.getInstance().emit(EventConstants.Game.UpdateResourceCount, this.entityManager.resources.get(TeamNumbers.Enemy), TeamNumbers.Enemy);
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
        isGame? this.scene.launch("UI"):()=>{};
        this.resetGame();
        if(!this.eventEmitterSingleton)
        {
            this.eventEmitterSingleton = EventEmitterSingleton.getInstance();
        }
         if(!this.map)
         {
        this.map = this.add.tilemap('map');
        var tileset = this.map.addTilesetImage('tileset', 'tileset');
        this.layer1 = this.map.createLayer('Tile Layer 1', [tileset]);
        this.layer2 = this.map.createLayer('Tile Layer 2', [tileset]);
         }
         
        if(!this.fogOfWar)
        {
            this.fogOfWar = this.make.renderTexture({
                width:3300,
                height: 1900,
                x:-1600,
                y:-200
            }, true)
        
            // fill it with black
            this.fogOfWar.fill(0x424242, 1)
            this.fogOfWar.setDepth(101);
            // draw the floorLayer into it
            this.fogOfWar.draw(this.layer2,1600,200)
            this.fogOfWar.draw(this.layer1,1600,200)
    
            // set a dark blue tint
            this.fogOfWar.setTint(0x0a2948);
        }
        if(!this.entityManager)
        {
            this.entityManager = new EntityManager(this, this.map, this.fogOfWar);
        }

        this.cameras.main.setZoom(1.0);
        this.cameras.main.setScroll(-800,0);
        this.add.rectangle(1400,15,2100,1800,0xffffff,0x0).setInteractive().setScrollFactor(0).setDepth(1).on('pointerup', (pointer, gameObject)=>{ var x = this.cameras.main.scrollX + pointer.x;
            var y = this.cameras.main.scrollY + pointer.y;
            this.eventEmitterSingleton.emit(EventConstants.EntityActions.Move,new Phaser.Math.Vector2(this.getTileLocation(x,y)));
            });
            

            this.mine = this.entityManager.createMineEntity(6, 6);
            this.mine = this.entityManager.createMineEntity(44, 44);
            this.base = this.entityManager.createBaseEntity(14, 5,1);
            this.base = this.entityManager.createBaseEntity(45, 36,2);
            this.player = this.entityManager.createEngineerEntity(3, 4,1);
            var entity = this.entityManager.createTurretEntity(2, 2,1);
            this.player = this.entityManager.createEngineerEntity(38,38,2);
            var entity = this.entityManager.createTurretEntity(40, 40,2);
            //let uiPortraitParentLayout:UIParentLayout = new UIParentLayout(this,portraitLayout,uiLayout,110,400)
    
            if(!this.finder)
            {
              this.finder = EasyStarGroundLevelSingleton.getInstance(); //new EasyStarWrapper();
            
            this.setupPathFinder(this.finder,this.layer1);
            this.setupPathFinder(EasyStarFlightLevelSingleton.getInstance(),this.layer2);
            for (var i = 0; i <= 16; i++) {
              this.SetupLargeTiles(i);
          }
            }

    
            //this.addDepthsToTiles(sprites);
    
            this.AIPlayer = new AIPlayer(this.entityManager,TeamNumbers.Enemy, TeamNumbers.Player);
            !isGame?this.AIPlayer2 = new AIPlayer(this.entityManager,TeamNumbers.Player, TeamNumbers.Enemy):()=>{}
    }

    create() {
      
        this.input.setGlobalTopOnly(true);
        this.input.setTopOnly(true);
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
    }

    update(time, delta) {
        this.entityManager.update(delta);
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
