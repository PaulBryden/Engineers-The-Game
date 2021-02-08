import 'phaser'
import  EasyStar from 'easystarjs'

type Path = {x: number, y: number} [];

class EasyStarSingleton extends EasyStar.js {
    private static instance: EasyStarSingleton;
    private constructor()
    {
        super();
    }
    static getInstance(): EasyStarSingleton {
        if (!this.instance) {
            this.instance = new this();
            }
            return this.instance;
    }

}
export {EasyStarSingleton,Path};