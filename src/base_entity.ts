import {Entity} from './entity'
import { typestate } from 'typestate';
enum State {
    Idle = "Idle",
    Building = "Building"
}
class BaseEntity extends Entity
{
    engineerFSM: typestate.FiniteStateMachine<State>;
    buildCounter:number;
    constructor(map: Phaser.Tilemaps.Tilemap, scene: Phaser.Scene, x: number, y: number)
    {
        super(map,"portrait_base","Base",scene,x,y,"home_base");
        this.eventEmitter.on("Buildbutton",()=>{this.requestBuild()});
        this.engineerFSM=this.createFSM();
        this.buildCounter=0;
    }

    createFSM(): typestate.FiniteStateMachine<State> {
        let fsm: typestate.FiniteStateMachine<State> = new typestate.FiniteStateMachine<State>(State.Idle);
        fsm.from(State.Idle).to(State.Building);
        fsm.from(State.Building).to(State.Idle);
        fsm.on(State.Building, async (from: State) => {
            await this.Build();
        });
        return fsm;
    }

    requestBuild()
    {
        this.engineerFSM.go(State.Building);

    }
    
    getStatus()
    {
        return this.engineerFSM.currentState.toString();
    }

    async Build() {

        var tweens = [];
        if (this.engineerFSM.is(State.Building)) {
            this.buildCounter++;
        }
        await this.delay(500);
        if(this.buildCounter!=10)
        {
            await this.Build();
        }
        else
        {
            this.buildCounter=0;
            this.eventEmitter.emit("BUILD",Phaser.Tilemaps.Components.IsometricWorldToTileXY(this.x-32, this.y-32, true, new Phaser.Math.Vector2(), this.scene.cameras.main, this.mapReference.layer));
            this.engineerFSM.go(State.Idle);

        }

    }
    delay(ms: number) {
        return new Promise( resolve => setTimeout(resolve, ms) );
    }
}

export {BaseEntity};