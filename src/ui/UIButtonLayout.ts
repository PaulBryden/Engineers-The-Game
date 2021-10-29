import 'phaser';
import {ImageButton, AttackButton, GatherButton, BuildButton, CancelButton, BuildEngineerButton, BuildGliderButton, BuildBaseButton, BuildFactoryButton, BuildTurretButton } from './ImageButton'
import {BaseEntity} from '../units/BaseEntity'
import {EngineerEntity} from '../units/EngineerEntity'
import {Entity} from '../units/Entity'
import { MineEntity } from '../units/MineEntity';
import { typestate } from 'typestate';
import { IStatePublisher, IStateSubscriber } from '../logic/IStatePublisher';
import { EventConstants } from '../logic/GameConstants';
import { FactoryEntity } from '../units/FactoryEntity';

class UIButtonLayout extends Phaser.GameObjects.Container implements IStateSubscriber
{
    publisher:IStatePublisher;
    constructor(publisher:IStatePublisher,scene:Phaser.Scene, buttons:ImageButton[], x:number, y:number)
    {
        let i:number = 0;
        for (let button of buttons) 
        {
            i%2!=0?button.x=160:button.x=0;
            button.y=0+(160*Math.floor(i/2));
            i++;
        }
        super(scene,x,y,buttons);
        publisher.subscribe(this);
        this.publisher=publisher;
        this.setScrollFactor(0).setDepth(251);
        scene.add.existing(this);

    }
    notify(state: string): void {
        
    }
    destroy()
    {
        this.publisher.unsubscribe(this);
        super.destroy();
    }
}



class BuildingButtonLayout extends UIButtonLayout
{
    buildingFSM: typestate.FiniteStateMachine<EventConstants.BuildingStates>;
    buildButton: ImageButton;
    cancelButton: ImageButton;
    constructor(initialState:EventConstants.BuildingStates,publisher:IStatePublisher,scene:Phaser.Scene, buildButton:ImageButton, cancelButton:CancelButton, x:number, y:number)
    {
        super(publisher,scene,[buildButton,cancelButton],x,y);
        this.buildingFSM=this.createFSM();
        this.buildButton=buildButton
        this.cancelButton = cancelButton;
        if(initialState!=EventConstants.BuildingStates.Idle)
        {
            this.buildButton.setVisible(false);
            this.cancelButton.setVisible(true);
            this.buildingFSM.go(<EventConstants.BuildingStates>initialState);
        }
        else
        {
            this.buildButton.setVisible(true);
            this.cancelButton.setVisible(false);
        }
    }
    

    createFSM(): typestate.FiniteStateMachine<EventConstants.BuildingStates> {
        let fsm: typestate.FiniteStateMachine<EventConstants.BuildingStates> = new typestate.FiniteStateMachine<EventConstants.BuildingStates>(EventConstants.BuildingStates.Idle);
        fsm.from(EventConstants.BuildingStates.Idle).to(EventConstants.BuildingStates.Building);
        fsm.from(EventConstants.BuildingStates.Building).to(EventConstants.BuildingStates.Idle);
        fsm.on(EventConstants.BuildingStates.Building, async (from: EventConstants.BuildingStates) => {
            this.buildButton.setVisible(false);
            this.cancelButton.setVisible(true);
        });
        fsm.on(EventConstants.BuildingStates.Idle, async (from: EventConstants.BuildingStates) => {
            this.buildButton.setVisible(true);
            this.cancelButton.setVisible(false);
            
        });
        return fsm;
    }
    
    notify(state: string): void {
        this.buildingFSM.go(<EventConstants.BuildingStates>state);
    }


}

class BaseUIButtonLayout extends BuildingButtonLayout
{
    constructor(initialState:EventConstants.BuildingStates,publisher:IStatePublisher,scene:Phaser.Scene, x:number, y:number)
    {
        super(initialState,publisher,scene,new BuildEngineerButton(scene), new CancelButton(scene,EventConstants.Input.RequestCancelEngineer),x,y);
    }
}

class FactoryUIButtonLayout extends BuildingButtonLayout
{
    constructor(initialState:EventConstants.BuildingStates,publisher:IStatePublisher,scene:Phaser.Scene, x:number, y:number)
    {
        super(initialState,publisher,scene,new BuildGliderButton(scene), new CancelButton(scene,EventConstants.Input.RequestCancelGlider),x,y);
    }
}


class EngineerUIButtonLayout extends UIButtonLayout
{
    constructor(publisher:IStatePublisher,scene:Phaser.Scene, x:number, y:number)
    {
        super(publisher,scene,[new BuildBaseButton(scene), new BuildFactoryButton(scene), new BuildTurretButton(scene)],x,y);
    }
}

class UIButtonLayoutFactory
{
    x:number;
    y:number;
    constructor()
    {
        this.x=0;
        this.y=200;
    };
    public CreateUI(entity:Entity,scene:Phaser.Scene): UIButtonLayout
    {
        if(entity instanceof BaseEntity)
        {
            return new BaseUIButtonLayout(<EventConstants.BuildingStates>entity.getStatus(),entity,scene,this.x,this.y);
        }
        if(entity instanceof FactoryEntity)
        {
            return new FactoryUIButtonLayout(<EventConstants.BuildingStates>entity.getStatus(),entity,scene,this.x,this.y);
        }
        else if(entity instanceof EngineerEntity)
        {
            return new EngineerUIButtonLayout(entity,scene,this.x,this.y);
        }
        else if(entity instanceof MineEntity)
        {
            return new UIButtonLayout(entity,scene,[],this.x,this.y);
        }
        else
        {
            return new UIButtonLayout(entity,scene,[],this.x,this.y);
        }
    }

}
export {UIButtonLayout,EngineerUIButtonLayout,UIButtonLayoutFactory};