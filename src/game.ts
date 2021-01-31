

import  EasyStar from 'easystarjs'
import 'phaser';
export default class Demo extends Phaser.Scene
{
    controls:any;
    finder:any;
    map:any;
    player:Phaser.GameObjects.Sprite;
    layer1:any;
    constructor ()
    {
        super('demo');
    }

    preload ()
    {
    this.load.image('tileset', 'assets/tileset.png');
    this.load.spritesheet('tileset_spritesheet', 'assets/tileset.png', { frameWidth: 64, frameHeight: 64 });
    this.load.image('home_base70001', 'assets/home_base70001.png');
    this.load.tilemapTiledJSON('map', 'assets/tiledmap.json');
    this.load.spritesheet('player', 'assets/spritesheet.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('player-rock', 'assets/spritesheet_rock.png', { frameWidth: 64, frameHeight: 64 });
    this.load.image('ui_overlay', 'assets/ui_overlay.png');
    this.load.audio('background_music', 'assets/background_music.mp3');  // urls: an array of file url

    }

    create ()
    {
    this.input.on('pointerup',this.handleClick,this);

    this.map = this.add.tilemap('map');

    console.log(this.map);
    var music = this.sound.add('background_music', {
        mute: false,
        volume: 1,
        rate: 1,
        detune: 0,
        seek: 0,
        loop: true,
        delay: 0
    });
    music.play();


    var tileset = this.map.addTilesetImage('tileset', 'tileset');
    var tileset2 =this. map.addTilesetImage('home_base70001', 'home_base70001');
    this.layer1 = this.map.createLayer('Tile Layer 1', [ tileset, tileset2 ]);
    var layer2 = this.map.createLayer('Tile Layer 2', [ tileset, tileset2 ]);

    var cursors = this.input.keyboard.createCursorKeys();

    this.cameras.main.setZoom(1.0);

    this.anims.create({
        key: 'player-walk1',
        frames: this.anims.generateFrameNumbers('player', { start: 15, end: 19 }),
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
    this.player = this.add.sprite(  -190, 250, 'player');
     this.player.anims.play('player-walk1', true);

      
      var sprite2 = this.add.sprite(  -185, 200, 'player-rock');
      sprite2.anims.play('player-walk2', true);
      
      var sprite3 = this.add.sprite(  -185, 500, 'player-rock');
      sprite3.anims.play('player-walk3', true);
      this.add.image(800,450, 'ui_overlay').setScrollFactor(0).setScale(2).setDepth(1000);
      
      this.finder = new EasyStar.js(); //new EasyStarWrapper();
      var grid = [];
    for(var y = 0; y < this.map.height; y++){
        var col = [];
        for(var x = 0; x < this.map.width; x++){
            // In each cell we store the ID of the tile, which corresponds
            // to its index in the tileset of the map ("ID" field in Tiled)

            console.log(this.layer1.getTileAt(x,y).index);
            col.push(this.layer1.getTileAt(x,y).index);
        }
        grid.push(col);
    }
    this.finder.setGrid(grid);

var tileset = this.map.tilesets[0];
var properties = tileset.tileProperties;
var acceptableTiles = [];

for(var i = tileset.firstgid-1; i < tileset.total; i++){ // firstgid and total are fields from Tiled that indicate the range of IDs that the tiles can take in that tileset
        if(!properties.hasOwnProperty(i)) {
            // If there is no property indicated at all, it means it's a walkable tile
            acceptableTiles.push(i+1);
            continue;
        }
        if(!properties[i].collide) acceptableTiles.push(i+1);
        if(properties[i].cost) this.finder.setTileCost(i+1, properties[i].cost); // If there is a cost attached to the tile, let's register it
    }
this.finder.setAcceptableTiles(acceptableTiles);
this.finder.enableDiagonals();
this.finder.setIterationsPerCalculation(50);
for(var i=0;i<=16;i++)
{
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
        x: { from: sprite3.x, to: sprite3.x+400 },
        // alpha: { start: 0, to: 1 },
        // alpha: 1,
        // alpha: '+=1',
        ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
        duration: 5000,
        repeat: 0,            // -1: infinity
        yoyo: false
    });
    }
    
     update (time, delta)
    {
        this.controls.update(delta);
        let worldPoint: any = this.input.activePointer.positionToCamera(this.cameras.main);
        var tilePos = this.layer1.worldToTileXY(this.player.x,this.player.y);
        this.player.setDepth(tilePos.x+tilePos.y-2)

 
    }
    
        
    checkCollision(x,y){
        var tile = this.map.getTileAt(x, y);
        return tile.properties.collide == true;
    };
    
SetupLargeTiles(tileID)
{
    var sprites = this.layer1.createFromTiles(tileID,18,{key:"tileset_spritesheet",frame:tileID-1},this,this.cameras.main);
    this.addDepthsToTiles(sprites);
}

handleClick(pointer){
    var x = this.cameras.main.scrollX + pointer.x;
    var y = this.cameras.main.scrollY + pointer.y;

    var toX = Math.floor(x/32);
    var toY = Math.floor(y/32);
    var testCoords;
    console.dir(this.layer1);
    var TargetPos = Phaser.Tilemaps.Components.IsometricWorldToTileXY(x,y,true,testCoords,this.cameras.main,this.layer1.layer);
    console.log(TargetPos);


    var fromX = Math.floor(this.player.x/32);
    var fromY = Math.floor(this.player.y/32);
    var PlayerPos = Phaser.Tilemaps.Components.IsometricWorldToTileXY(this.player.x,this.player.y,true,testCoords,this.cameras.main,this.layer1.layer);

    console.log('going from ('+PlayerPos.x+','+PlayerPos.y+') to ('+TargetPos.x+','+TargetPos.y+')');

    this.finder.findPath(PlayerPos.x-1, PlayerPos.y-1, TargetPos.x-1, TargetPos.y-1, (path) => {
        if (path === null) {
            console.warn("Path was not found.");
        } else {
            console.log(path);
            this.moveCharacter(path);
        }
    });
    this.finder.calculate(); // don't forget, otherwise nothing happens

};

addDepthsToTiles(sprites: Phaser.GameObjects.Sprite[])
{
    for (let entry of sprites) 
    {
        var tilePos = this.layer1.worldToTileXY(entry.x,entry.y);
        entry.setDepth(tilePos.x+tilePos.y);
        entry.setPosition(entry.x+32,entry.y+32);
        
      } 
}

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
};

}

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#125555',
    width: 1600,
    height: 900,
    scene: Demo,
    antialias: true
};

const game = new Phaser.Game(config);
