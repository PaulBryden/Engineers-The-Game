import { GameScene } from "./gameScene";

export default class Menu extends Phaser.Scene {
    
    constructor() {
        super('Menu');
    }

    preload() {    
        this.load.html('connectionMenu', 'assets/DOMUI/ConnectionMenu.html');
        this.load.html('hostMenu', 'assets/DOMUI/Host.html');
        this.load.html('joinMenu', 'assets/DOMUI/Join.html');
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
        this.load.image('vision', 'assets/mask.png');  // urls: an array of file url
        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });

    }

    create() {
        this.scene.launch("GameScene");
        (<GameScene>this.scene.get('GameScene')).setup(false);
        var element = this.add.dom(400, 400).createFromCache('connectionMenu');
        element.addListener('click');

        element.on('click',  (event) => {
    
            element.destroy();
            if (event.target.id === 'Host')
            {
                 var element2 = this.add.dom(400, 400).createFromCache('hostMenu');

                var ID = element2.getChildByProperty('id','GameID');
                ID.innerHTML = "012345678";
            }
            else if(event.target.id === 'Connect')
            {
                element = this.add.dom(400, 400).createFromCache('joinMenu');
            }
            else if(event.target.id === 'SinglePlayer')
            {
                this.tweens.add({
                    targets: this,
                    NOTHING: { value: 0, duration: 50 },
                    onComplete: () => { (<GameScene>this.scene.get('GameScene')).setup(true); } });
    
                }

            }
    
        );

    }


    update(time, delta) {

    }






}
export {Menu}