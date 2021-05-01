import 'phaser';
import {EventEmitterSingleton} from './EventEmitterSingleton'
import {EventConstants, StartOfGame, TeamNumbers} from './GameConstants'
class UIResources extends Phaser.GameObjects.Container
{
    resourceCount:Phaser.GameObjects.Text;
    eventEmitter: EventEmitterSingleton;
    resourceCountString: string;
    constructor(scene:Phaser.Scene)
    {
        super(scene,1360,35,[]);
        this.resourceCountString="";
        this.resourceCount = new Phaser.GameObjects.Text(scene, 50, -19, this.resourceCountString,{ fontFamily: 'monogram', fontSize: '42px', color: '#ffffff' } );
        this.add(this.resourceCount);
        this.add(scene.add.image(0,0,"resource"));
        this.setDepth(251);
        this.setScrollFactor(0,0,true);
        this.eventEmitter = EventEmitterSingleton.getInstance();
        this.eventEmitter.on(EventConstants.Game.UpdateResourceCount,(count:number, teamNumber:number)=>{ teamNumber==TeamNumbers.Player?this.resourceCount.setText(count.toString()):{};});
        scene.add.existing(this);
        
    }
    destroy()
    {
        this.eventEmitter.removeListener(EventConstants.Game.UpdateResourceCount);
        super.destroy();
    }
}
export {UIResources}