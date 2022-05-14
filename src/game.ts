

import 'phaser';
import {GameScene} from './scenes/GameScene';
import {UI} from './ui/UIScene';
import {Menu} from './scenes/MenuScene';



const config = {
    type: Phaser.AUTO,
    parent:'game',
    dom: {
        createContainer: true
    },
    scale: {
        width: 1600,
        height: 900,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        mode: Phaser.Scale.FIT,
    },
    backgroundColor: '#002244',
    scene: [Menu,GameScene,UI],
    antialias: true,
    batchSize: 512,
    plugins: {

    }
};

const game = new Phaser.Game(config);