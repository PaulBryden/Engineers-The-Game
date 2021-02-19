import 'phaser'
import  EasyStar from 'easystarjs'

type Path = {x: number, y: number} [];

class EasyStarGroundLevelSingleton extends EasyStar.js {
    private static instance: EasyStarGroundLevelSingleton;
    private constructor()
    {
        super();
    }
    static getInstance(): EasyStarGroundLevelSingleton {
        if (!this.instance) {
            this.instance = new this();
            }
            return this.instance;
    }

}
class EasyStarFlightLevelSingleton extends EasyStar.js {
    private static instance: EasyStarGroundLevelSingleton;
    private constructor()
    {
        super();
    }
    static getInstance(): EasyStarGroundLevelSingleton {
        if (!this.instance) {
            this.instance = new this();
            }
            return this.instance;
    }

}
export {EasyStarGroundLevelSingleton,EasyStarFlightLevelSingleton,Path};