import 'phaser'
import {UIParentLayout,UIFactory} from './ui_parent_layout'
import {Entity} from './entity'
import {EventEmitterSingleton} from './EventEmitterSingleton'
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
    updateSelected(selectedEntity?: Entity)
    {
        if(selectedEntity!=null)
        {
            this.selectedEntity!=null?this.selectedEntity.updateSelected(false):{};
            this.selectedEntity = selectedEntity;
            this.selectedEntity.updateSelected(true);
            if(this.uiLayout!=null)
            {
                this.uiLayout.destroy();
            }
            this.uiLayout = this.uiFactory.GetUI(this.selectedEntity);
        }
    }
} 
export {UIManager};