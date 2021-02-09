import 'phaser'
import {UIParentLayout,UIFactory} from './ui_parent_layout'
import {Entity} from './entity'
import {EngineerEntity} from './engineer_entity'
import {EventEmitterSingleton} from './EventEmitterSingleton'
import {AudioEffectsSingleton} from './AudioEffectsSingleton'
class UIManager
{
    uiLayout:UIParentLayout;
    selectedEntity:Entity;
    uiFactory: UIFactory;
    eventEmitter: EventEmitterSingleton;
    constructor(initialEntity?: Entity)
    {
        this.uiFactory = new UIFactory();
        
        this.eventEmitter = EventEmitterSingleton.getInstance();
        this.eventEmitter.on("SELECTED",this.updateSelected, this );
        if(initialEntity!=null)
        {
            this.selectedEntity = initialEntity;
            this.uiLayout = this.uiFactory.GetUI(this.selectedEntity);

        }
    }

    moveSelected(coords:Phaser.Math.Vector2)
    {
        if(this.selectedEntity instanceof EngineerEntity)
        {
            this.selectedEntity.requestMove(coords);
        }
    }

    updateSelected(selectedEntity?: Entity)
    {
        if(selectedEntity!=null)
        {
            this.selectedEntity!=null?this.selectedEntity.updateSelected(false):{};
            this.selectedEntity = selectedEntity;
            this.selectedEntity.updateSelected(true);
            Math.random()>0.5?AudioEffectsSingleton.getInstance(this.selectedEntity.scene).IdleEngineerSelected1.play():AudioEffectsSingleton.getInstance(this.selectedEntity.scene).IdleEngineerSelected2.play();

            if(this.uiLayout!=null)
            {
                this.uiLayout.destroy();
            }
            this.uiLayout = this.uiFactory.GetUI(this.selectedEntity);
        }
    }
} 
export {UIManager};