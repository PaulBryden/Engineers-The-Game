

import 'phaser';
import {GameScene} from './gameScene'
import {UI} from './uIScene'




const config = {
    type: Phaser.AUTO,
    backgroundColor: '#125555',
    width: 1600,
    height: 900,
    scene: [GameScene,UI],
    antialias: true,
    plugins: {

    }
};

const game = new Phaser.Game(config);
