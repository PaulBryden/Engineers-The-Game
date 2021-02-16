import 'phaser'
import {UIParentLayout,UIFactory} from './ui_parent_layout'
import {Entity} from './entity'
import {EngineerEntity} from './engineer_entity'
import {EventEmitterSingleton} from './EventEmitterSingleton'
import {AudioEffectsSingleton} from './AudioEffectsSingleton'
import {EventConstants} from './GameConstants'
import { MineEntity } from './mine_entity'
import { UIResources } from './ui_resources'
class UIManager
{
    uiLayout:UIParentLayout;
    resourceLayout: UIResources;
    selectedEntity:Entity;
    uiFactory: UIFactory;
    eventEmitter: EventEmitterSingleton;
    scene:Phaser.Scene;
    constructor(scene:Phaser.Scene,initialEntity?: Entity)
    {
        this.uiFactory = new UIFactory();
        
        this.eventEmitter = EventEmitterSingleton.getInstance();
        this.eventEmitter.on(EventConstants.EntityActions.Selected,this.updateSelected, this );
        if(initialEntity!=null)
        {
            this.selectedEntity = initialEntity;
            this.uiLayout = this.uiFactory.GetUI(this.selectedEntity);

        }
        this.scene=scene;
        this.resourceLayout= new UIResources(this.scene);
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
            if(this.selectedEntity instanceof EngineerEntity && selectedEntity instanceof MineEntity)
            {
                (<EngineerEntity>this.selectedEntity).requestMine(selectedEntity);
            }
            else
            {
                this.selectedEntity!=null?this.selectedEntity.updateSelected(false):{};
                this.selectedEntity = selectedEntity;
                this.selectedEntity.updateSelected(true);
                Math.random()>0.5?AudioEffectsSingleton.getInstance(this.selectedEntity.scene).IdleEngineerSelected1.play():AudioEffectsSingleton.getInstance(this.selectedEntity.scene).IdleEngineerSelected2.play();
            }

            if(this.uiLayout!=null)
            {
                this.uiLayout.destroy();
            }
            this.uiLayout = this.uiFactory.GetUI(this.selectedEntity);
        }
    }
} 
export {UIManager};