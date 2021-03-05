

import 'phaser';
import {GameScene} from './gameScene'
import {UI} from './uIScene'
import {Menu} from './menuScene'



const config = {
    type: Phaser.AUTO,
    parent:'game',
    dom: {
        createContainer: true
    },
    backgroundColor: '#125555',
    width: 1600,
    height: 900,
    scene: [Menu,GameScene,UI],
    antialias: true,
    plugins: {

    }
};

const game = new Phaser.Game(config);
