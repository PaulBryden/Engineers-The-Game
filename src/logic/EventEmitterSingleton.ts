import 'phaser';
class EventEmitterSingleton extends Phaser.Events.EventEmitter {
    private static instance: EventEmitterSingleton;
    private constructor() {
        super();
    }
    static getInstance(): EventEmitterSingleton {
        if (!this.instance) {
            this.instance = new this();
        }
        return this.instance;
    }

}
export {EventEmitterSingleton};