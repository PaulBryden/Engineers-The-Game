import { AttackButton, GatherButton, BuildButton, CancelButton } from './ImageButton';
import { UIButtonLayout, EngineerUIButtonLayout } from './UIButtonLayout';
import { Entity } from '../units/Entity';
import { UIPortraitLayout } from './UIPortraitLayout';
import { UIParentLayout, UIFactory } from './UIParentLayout';
import { EngineerEntity } from '../units/EngineerEntity';
import { BaseEntity } from '../units/BaseEntity';
import { EventEmitterSingleton } from '../logic/EventEmitterSingleton';
import { UIManager } from './UIManager';
import { EasyStarFlightLevelSingleton, EasyStarGroundLevelSingleton } from '../logic/EasyStarSingleton';
import { EntityManager } from '../logic/EntityManager';
import { MineEntity } from '../units/MineEntity';
import  EasyStar from 'easystarjs';
import GameScene from '../scenes/GameScene';

export default class UI extends Phaser.Scene 
{
    uiManager: UIManager;
    gameScene: GameScene;
    minimap: Phaser.Cameras.Scene2D.Camera;
    constructor() 
    {
        super('UI');
    }

    preload() 
    {
       
        this.load.image('ui_overlay', 'assets/ui_overlay_2.png');
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
        this.load.image('Portrait', 'assets/portrait.png');  // urls: an array of file url
        this.load.image('Up_Button', 'assets/UI_Up_Button.png');  // urls: an array of file url
        this.load.image('Down_Button', 'assets/UI_Bottom_Button.png');  // urls: an array of file url
        this.load.image('Left_Button', 'assets/UI_Left_Button.png');  // urls: an array of file url
        this.load.image('Right_Button', 'assets/UI_Right_Button.png');  // urls: an array of file url
        this.load.image('Plus_Button','assets/plus.png');
        this.load.image('Minus_Button','assets/minus.png');
        this.load.image('Close_Button','assets/cross.png');

    }

    create() 
    {


        this.input.setGlobalTopOnly(true);
        this.input.setTopOnly(true);

        this.gameScene = <GameScene>this.scene.get('GameScene');

        this.minimap = this.gameScene.cameras.add(8, 17, 360, 190).setZoom(0.1).setName('mini');
        this.minimap.setScroll(-110,670);
        this.minimap.setBackgroundColor(0x002244);

        this.uiManager = new UIManager(this,this.gameScene,null);
        this.add.existing(this.uiManager);
    }


    update(time, delta) 
    {
        this.uiManager.update(delta);

    }




}
export {UI};