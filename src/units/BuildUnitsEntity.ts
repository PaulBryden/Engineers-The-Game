import { Entity } from './Entity';
import { typestate } from 'typestate';
import { EventConstants } from '../logic/GameConstants';
import { BuildingEntity } from './BuildingEntity';

class BuildUnitsEntity extends BuildingEntity 
{
    buildingFSM: typestate.FiniteStateMachine<EventConstants.BuildingStates>;
    buildCounter: number;
    createEntityEvent: string;
    constructor(map: Phaser.Tilemaps.Tilemap, icon: string, name: string, scene: Phaser.Scene, x: number, y: number, requestBuildEvent: string, createEntityEvent: string, texture: string | Phaser.Textures.Texture,team:number, frame?: string | number) 
    {
        
        super(map, icon, name, scene, x, y, texture, team);
        this.createEntityEvent = createEntityEvent;
        this.buildingFSM = this.createFSM();
        this.buildCounter = 0;
        this.blockedTiles.push(new Phaser.Math.Vector2(x-1,y));
        this.blockedTiles.push(new Phaser.Math.Vector2(x-2,y));
        this.blockedTiles.push(new Phaser.Math.Vector2(x-1,y-1));
        this.blockedTiles.push(new Phaser.Math.Vector2(x-2,y-1));
        this.avoidAdditionalPoints();
    }

    createFSM(): typestate.FiniteStateMachine<EventConstants.BuildingStates> 
    {
        const fsm: typestate.FiniteStateMachine<EventConstants.BuildingStates> = new typestate.FiniteStateMachine<EventConstants.BuildingStates>(EventConstants.BuildingStates.Idle);
        fsm.from(EventConstants.BuildingStates.Idle).to(EventConstants.BuildingStates.Building);
        fsm.from(EventConstants.BuildingStates.Building).to(EventConstants.BuildingStates.Idle);
        fsm.on(EventConstants.BuildingStates.Building,  (from: EventConstants.BuildingStates) => 
        {
            for (const subs of this.subscribers) 
            {
                subs.notify(EventConstants.BuildingStates.Building);
            }
            this.Build();
        });
        fsm.on(EventConstants.BuildingStates.Idle, (from: EventConstants.BuildingStates) => 
        {
            for (const subs of this.subscribers) 
            {
                subs.notify(EventConstants.BuildingStates.Idle);
            }
        });
        return fsm;
    }

    requestBuild() 
    {
        try 
        {
            this.buildingFSM.go(EventConstants.BuildingStates.Building);
        }
        catch 
        {

        }

    }
    requestCancel() 
    {
        this.buildCounter = 0;
        try
        {
            this.buildingFSM.go(EventConstants.BuildingStates.Idle);
        }
        catch 
        {

        }

    }

    getStatus() 
    {
        return this.buildingFSM.currentState.toString();
    }

    Build() 
    {

        this.AddTween({
            targets: {},
            NOTHING: { value: 1, duration: 500 },
            onComplete: () => 
            {
                if (this.buildingFSM.is(EventConstants.BuildingStates.Building) && this.health>0) 
                {
                    this.buildCounter++;
                    if (this.buildCounter != 10) 
                    {
                        this.Build();
                    }
                    else 
                    {
                        this.buildCounter = 0;try 
                        {
                            this.eventEmitter.emit(this.createEntityEvent, Phaser.Tilemaps.Components.IsometricWorldToTileXY(this.x - 32, this.y - 32, true, new Phaser.Math.Vector2(), this.scene.cameras.main, this.mapReference.layer), this.team);
                        
                            this.buildingFSM.go(EventConstants.BuildingStates.Idle);
                        }
                        catch
                        {}
        
                    }
                }
            }

        });

    }
    delay(ms: number) 
    {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    destroy() 
    {
        this.requestCancel();
        this.health=-1;
        
        super.destroy();
    }


}

export { BuildUnitsEntity };