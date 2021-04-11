import 'phaser'
import {SoundConstants} from './GameConstants'
class AudioEffectsSingleton extends Phaser.Events.EventEmitter {
    private static instance: AudioEffectsSingleton;
    public IdleEngineerSelected1:Phaser.Sound.BaseSound;
    public IdleEngineerSelected2:Phaser.Sound.BaseSound;
    public EngineerAttacking:Phaser.Sound.BaseSound;
    public EngineerMoving2:Phaser.Sound.BaseSound;
    public EngineerMoving1:Phaser.Sound.BaseSound;
    public EngineerMining:Phaser.Sound.BaseSound;
    public Laser:Phaser.Sound.BaseSound;
    public Destroyed:Phaser.Sound.BaseSound;
    public Blocked:Phaser.Sound.BaseSound;
    public AddResource:Phaser.Sound.BaseSound;
    private scene:Phaser.Scene;
    private constructor(scene:Phaser.Scene)
    {
        super();
        this.scene=scene;
        this.EngineerMining =  scene.sound.add('Engineer_Mining', SoundConstants.soundEffectConfig);
        this.EngineerMoving1 =  scene.sound.add('Engineer_Moving_1', SoundConstants.soundEffectConfig);
        this.EngineerMoving2 =  scene.sound.add('Engineer_Moving_2', SoundConstants.soundEffectConfig);
        this.EngineerAttacking =  scene.sound.add('Engineer_Attacking', SoundConstants.soundEffectConfig);
        this.IdleEngineerSelected2 =  scene.sound.add('Engineer_Idle_Selected_2', SoundConstants.soundEffectConfig);
        this.IdleEngineerSelected1 =  scene.sound.add('Engineer_Idle_Selected_1', SoundConstants.soundEffectConfig);
        this.Laser =  scene.sound.add('laser', SoundConstants.soundEffectConfig);
        this.Destroyed =  scene.sound.add('explosion', SoundConstants.soundEffectConfig);
        this.Blocked =  scene.sound.add('blocked', SoundConstants.soundEffectConfig);
        this.AddResource =  scene.sound.add('addResource', SoundConstants.soundEffectConfig);

    }
    static getInstance(scene:Phaser.Scene): AudioEffectsSingleton {
        if (!this.instance) {
            this.instance = new this(scene);
            }
            return this.instance;
    }

}
export {AudioEffectsSingleton};