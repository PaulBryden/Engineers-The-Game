import 'phaser'
import { Entity } from './entity'
import 'typestate';
import EasyStar from 'easystarjs'
import { typestate } from 'typestate';
import { EasyStarSingleton, Path } from './EasyStarSingleton';
import {AudioEffectsSingleton} from './AudioEffectsSingleton';
enum State {
    Idle = "Idle",
    Moving = "Moving"
}
class EngineerEntity extends Entity {
    engineerFSM: typestate.FiniteStateMachine<State>;
    pathFinder: EasyStarSingleton;
    targetDestination: Phaser.Math.Vector2;
    path: Path;
    constructor(map: Phaser.Tilemaps.Tilemap, scene: Phaser.Scene, x: number, y: number) {
        super(map, "Portrait_Engineer", "Engineer", scene, x, y, "player");
        this.engineerFSM = this.createFSM();
        this.pathFinder = EasyStarSingleton.getInstance();
        this.anims.play('engineer-SW', true);

    }

    createFSM(): typestate.FiniteStateMachine<State> {
        let fsm: typestate.FiniteStateMachine<State> = new typestate.FiniteStateMachine<State>(State.Idle);
        fsm.from(State.Idle).to(State.Moving);
        fsm.from(State.Moving).to(State.Idle);
        fsm.on(State.Moving, async (from: State) => {
            await this.Move();
        });
        return fsm;
    }

    requestMove(coordinates: Phaser.Math.Vector2) {
        this.targetDestination = coordinates;
        var PlayerPos = Phaser.Tilemaps.Components.IsometricWorldToTileXY(this.x, this.y, true, PlayerPos, this.scene.cameras.main, this.mapReference.layer);

        this.pathFinder.findPath(PlayerPos.x - 1, PlayerPos.y - 1, coordinates.x - 1, coordinates.y - 1, (path) => {

            if (path != null && path.length>0) {
                this.path = path;
                this.path.shift(); //first move is current position
                Math.random()>0.5?AudioEffectsSingleton.getInstance(this.scene).EngineerMoving1.play():AudioEffectsSingleton.getInstance(this.scene).EngineerMoving2.play();
                this.engineerFSM.go(State.Moving);
            }
        });
        this.pathFinder.calculate();
    }

    updateAngle(angle:number)
    {
        angle = Phaser.Math.Angle.Normalize(angle);
        angle = Phaser.Math.RadToDeg(angle)+90;
        if(angle>360)
        {
            angle=angle-360;
        }
        if((angle>337.5 && angle<=360)||(angle>0 && angle<=22.5))
        {
            this.anims.play('engineer-N', true);
        }
        else if(angle>22.5 && angle<=67.5)
        {
            this.anims.play('engineer-NE', true);
        }
        else if(angle>67.5 && angle<=112.5)
        {
            this.anims.play('engineer-E', true);
        }
        else if(angle>112.5 && angle<=157.5)
        {
            this.anims.play('engineer-SE', true);
        }
        else if(angle>157.5 && angle<=202.5)
        {
            this.anims.play('engineer-S', true);
        }
        else if(angle>202.5 && angle<=247.5)
        {
            this.anims.play('engineer-SW', true);
        }
        else if(angle>247.5 && angle<=292.5)
        {
            this.anims.play('engineer-W', true);
        }
        else if(angle>292.5 && angle<=337.5)
        {
            this.anims.play('engineer-NW', true);
        }
    }

    async Move() {

        var tweens = [];
        if (this.engineerFSM.is(State.Moving) && this.path != null && this.path.length > 0) {
            var ex = this.path[0].x;
            var ey = this.path[0].y;
            var testCoords;
            var xyPos = Phaser.Tilemaps.Components.IsometricTileToWorldXY(ex + 1, ey + 1, testCoords, this.scene.cameras.main, this.mapReference.layer);
            console.log(xyPos.x);
            tweens.push({
                targets: this,
                x: { value: xyPos.x + 30, duration: 500 },
                y: { value: xyPos.y + 5, duration: 500 }
            });
            
            this.updateAngle(Phaser.Math.Angle.Between(this.x,this.y,xyPos.x+30,xyPos.y+5));
            
            this.scene.tweens.timeline({
                tweens: tweens
            });
            this.path.shift();
        }
        if(this.engineerFSM.is(State.Moving)&& this.path.length > 0)
        {
            await this.delay(500);
            await this.Move();
        }
        else
        {
            this.engineerFSM.go(State.Idle);
        }

    }
    delay(ms: number) {
        return new Promise( resolve => setTimeout(resolve, ms) );
    }

    cancelMove() {
        this.engineerFSM.go(State.Idle);
    }

    getStatus()
    {
        return this.engineerFSM.currentState.toString();
    }

}

export { EngineerEntity };