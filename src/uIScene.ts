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
import { EasyStarFlightLevelSingleton, EasyStarGroundLevelSingleton } from './EasyStarSingleton';
import { EntityManager } from './EntityManager'
import { MineEntity } from './mine_entity';
import  EasyStar from 'easystarjs'
import GameScene from './gameScene';

export default class UI extends Phaser.Scene {
    uiManager: UIManager;
    gameScene: GameScene;
    minimap: Phaser.Cameras.Scene2D.Camera;
    constructor() {
        super('UI');
    }

    preload() {
        this.load.image('tileset', 'assets/tileset.png');
        this.load.spritesheet('tileset_spritesheet', 'assets/tileset.png', { frameWidth: 64, frameHeight: 64 });
        this.load.image('portrait_base', 'assets/Portrait_Base.png');
        this.load.image('mine', 'assets/mine.png');
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

    }

    create() {


        this.input.setGlobalTopOnly(true);
        this.input.setTopOnly(true);

        this.gameScene = <GameScene>this.scene.get('GameScene');

        this.minimap = this.gameScene.cameras.add(8, 17, 360, 190).setZoom(0.05).setName('mini');
        this.minimap.setScroll(-100,1400);
        this.minimap.setBackgroundColor(0x002244);
        this.uiManager = new UIManager(this,this.gameScene,null);

    }


    update(time, delta) {
        this.uiManager.update(delta);

    }






}
export {UI}