import 'phaser'
import { Entity } from './entity'
import 'typestate';
import EasyStar from 'easystarjs'
import { typestate } from 'typestate';
import { EasyStarGroundLevelSingleton, Path } from './EasyStarSingleton';
import {AudioEffectsSingleton} from './AudioEffectsSingleton';
import { MineEntity } from './mine_entity';
import { BaseEntity } from './base_entity';
import {EventConstants} from './GameConstants'
import { MovingEntity } from './MovingEntity';
import { ScaffoldEntity } from './scaffold';

enum State {
    Idle = "Idle",
    Moving = "Moving",
    Mining = "Mining",
    Building = "Building"
}

enum MiningState
{
    Initial = "InitialMine",
    GoingToMine = "GoingToMine",
    InMine = "InMine",
    GoingToBase = "GoingToBase",
    InBase = "InBase"
}

enum BuildingState
{
    Initial = "InitialBuilding",
    GoingToBuilding = "GoingToBuilding",
    Building = "Building",
}

enum AnimationState
{
    Default="",
    Mining="Mining",
    Action = "Action"
}

class EngineerEntity extends MovingEntity {
    engineerFSM: typestate.FiniteStateMachine<State>;
    pathFinder: EasyStar.js;
    targetDestination: Phaser.Math.Vector2;
    path: Path;
    targetMine: MineEntity;
    nearestBase: BaseEntity;
    miningFSM: typestate.FiniteStateMachine<MiningState>
    buildingFSM: typestate.FiniteStateMachine<BuildingState>
    currentAnimation: AnimationState
    targetBuilding: ScaffoldEntity;
    constructor(map: Phaser.Tilemaps.Tilemap, scene: Phaser.Scene, x: number, y: number, team:number) {
        super(map, "Portrait_Engineer", "Engineer", scene, x, y, "player"+"-"+team, team);
        this.engineerFSM = this.createFSM();
        this.miningFSM = this.createMiningFSM();
        this.buildingFSM=this.createBuildingFSM();
        this.pathFinder = EasyStarGroundLevelSingleton.getInstance();
        this.anims.play('engineer'+"-"+team+"-SW", true);
        this.currentAnimation=AnimationState.Default;

    }

    createBuildingFSM(): typestate.FiniteStateMachine<BuildingState> {
        let fsm: typestate.FiniteStateMachine<BuildingState> = new typestate.FiniteStateMachine<BuildingState>(BuildingState.Initial);
        fsm.from(BuildingState.Initial).to(BuildingState.GoingToBuilding);
        fsm.from(BuildingState.GoingToBuilding).to(BuildingState.Building);
        fsm.from(BuildingState.Building).to(BuildingState.Initial);
        
        fsm.on(BuildingState.Building, async (from: BuildingState) => {
            this.currentAnimation=AnimationState.Action;
            this.updateAngle(Math.PI/2);
            await this.ProcessBuilding()
        });
        fsm.onExit(BuildingState.Building,  (to: BuildingState) => {
            this.currentAnimation=AnimationState.Default;
            this.updateAngle(Math.PI/2);
            return true;
        });


        fsm.on(BuildingState.GoingToBuilding, async (from: BuildingState) => {
            this.updatePathToBuilding();
        await this.delay(20);
        await this.MoveToBuilding();
        });
        return fsm;
    }

    createFSM(): typestate.FiniteStateMachine<State> {
        let fsm: typestate.FiniteStateMachine<State> = new typestate.FiniteStateMachine<State>(State.Idle);
        fsm.from(State.Idle).to(State.Moving);
        fsm.from(State.Idle).to(State.Mining);
        fsm.from(State.Idle).to(State.Building);
        fsm.from(State.Moving).to(State.Building);
        fsm.from(State.Building).to(State.Moving);
        fsm.from(State.Building).to(State.Idle);
        fsm.from(State.Mining).to(State.Building);

        fsm.from(State.Moving).to(State.Idle);
        fsm.from(State.Mining).to(State.Idle);
        fsm.from(State.Moving).to(State.Mining);
        fsm.from(State.Mining).to(State.Moving);
        fsm.on(State.Building, async (from: State) => {
            for(let sub of this.subscribers)
            {
                sub.notify(State.Building);
            }
        });
        fsm.on(State.Idle, async (from: State) => {
            for(let sub of this.subscribers)
            {
                sub.notify(State.Idle);
            }
        });
        fsm.on(State.Moving, async (from: State) => {
            for(let sub of this.subscribers)
            {
                sub.notify(State.Moving);
            }
            await this.Move();
        });
        fsm.on(State.Mining, async (from: State) => {
            for(let sub of this.subscribers)
            {
                sub.notify(State.Mining);
            }
            await this.Mine();
        });
        fsm.onExit(State.Mining,  (to: State) => {
            this.miningFSM.reset();
            this.currentAnimation=AnimationState.Default;
            this.alpha=1;
            return true;
        });
        fsm.onExit(State.Building,  (to: State) => {
            this.buildingFSM.reset();
            this.currentAnimation=AnimationState.Default;
            return true;
        });
        return fsm;
    }
    

    updateNearestBase(base:BaseEntity)
    {
        this.nearestBase=base;
    }

    updatePathToMine()
    {
        var PlayerPos = Phaser.Tilemaps.Components.IsometricWorldToTileXY(this.x, this.y, true, PlayerPos, this.scene.cameras.main, this.mapReference.layer);
        var minePos = Phaser.Tilemaps.Components.IsometricWorldToTileXY(this.targetMine.x, this.targetMine.y, true, minePos, this.scene.cameras.main, this.mapReference.layer);

    this.pathFinder.findPath(PlayerPos.x - 1, PlayerPos.y, minePos.x - 3, minePos.y, (path) => {

        if (path != null && path.length>0) {
            this.path = path;
            this.path.shift();
        }
    });
    this.pathFinder.calculate();
    }


    updatePathToBuilding()
    {
        this.path=[];
        var PlayerPos = Phaser.Tilemaps.Components.IsometricWorldToTileXY(this.x, this.y, true, PlayerPos, this.scene.cameras.main, this.mapReference.layer);
        var buildingEngineerPos = new Phaser.Math.Vector2(this.targetBuilding.desiredBuildingCoordinates.x-2, this.targetBuilding.desiredBuildingCoordinates.y-2);

    this.pathFinder.findPath(PlayerPos.x - 1, PlayerPos.y, buildingEngineerPos.x - 1, buildingEngineerPos.y, (path) => {

        if (path != null && path.length>0) {
            this.path = path;
            this.path.shift();
        }
    });
    this.pathFinder.calculate();
    }


    createMiningFSM(): typestate.FiniteStateMachine<MiningState> {
        let fsm: typestate.FiniteStateMachine<MiningState> = new typestate.FiniteStateMachine<MiningState>(MiningState.Initial);
        fsm.from(MiningState.Initial).to(MiningState.GoingToMine);
        fsm.from(MiningState.GoingToMine).to(MiningState.InMine);
        fsm.from(MiningState.InMine).to(MiningState.GoingToBase);
        fsm.from(MiningState.GoingToBase).to(MiningState.InBase);
        fsm.from(MiningState.InBase).to(MiningState.GoingToMine);
        
        fsm.on(MiningState.GoingToMine, async (from: MiningState) => {
            var PlayerPos = Phaser.Tilemaps.Components.IsometricWorldToTileXY(this.x, this.y, true, PlayerPos, this.scene.cameras.main, this.mapReference.layer);
            var minePos = Phaser.Tilemaps.Components.IsometricWorldToTileXY(this.targetMine.x, this.targetMine.y, true, minePos, this.scene.cameras.main, this.mapReference.layer);

        this.pathFinder.findPath(PlayerPos.x - 1, PlayerPos.y, minePos.x - 3, minePos.y, (path) => {

            if (path != null && path.length>0) {
                this.path = path;
                this.path.shift();
            }
        });
        this.pathFinder.calculate();
        await this.delay(20);
        await this.MoveToMine();
        });

        fsm.on(MiningState.GoingToBase, async (from: MiningState) => {
            var PlayerPos = Phaser.Tilemaps.Components.IsometricWorldToTileXY(this.x, this.y, true, PlayerPos, this.scene.cameras.main, this.mapReference.layer);
            var basePos = Phaser.Tilemaps.Components.IsometricWorldToTileXY(this.nearestBase.x, this.nearestBase.y, true, basePos, this.scene.cameras.main, this.mapReference.layer);

        this.pathFinder.findPath(PlayerPos.x - 1, PlayerPos.y, basePos.x, basePos.y-1, (path) => {

            if (path != null && path.length>0) {
                this.path = path;
                this.path.shift();
            }
        });
        this.pathFinder.calculate();
        await this.delay(20);
        await this.MoveToBase();
        });
        fsm.on(MiningState.InMine, async (from: MiningState) => {
            await this.MoveInsideMine();
        });
        fsm.on(MiningState.InBase, async (from: MiningState) => {
            await this.MoveInsideBase();
        });
        return fsm;
    }

    requestMine(mine: MineEntity) {
        
        if(this.targetMine!=mine || !this.engineerFSM.is(State.Mining))
        {
            AudioEffectsSingleton.getInstance(this.scene).EngineerMining.play();
            this.targetMine = mine;
            this.miningFSM.is(MiningState.GoingToMine)?this.updatePathToMine():this.miningFSM.canGo(MiningState.GoingToMine)?this.miningFSM.go(MiningState.GoingToMine):{};
            !this.engineerFSM.is(State.Mining)?this.engineerFSM.go(State.Mining):{};
        }
    }

    requestBuild(building: ScaffoldEntity) {
        
        if(this.targetBuilding!=building || !this.engineerFSM.is(State.Building))
        {
            this.targetBuilding = building;
            this.buildingFSM.is(BuildingState.GoingToBuilding)?this.updatePathToBuilding():this.buildingFSM.canGo(BuildingState.GoingToBuilding)?this.buildingFSM.go(BuildingState.GoingToBuilding):{};
            !this.engineerFSM.is(State.Building)?this.engineerFSM.go(State.Building):{};
        }
    }
    
    async Mine() 
    {
    }
    async MoveInsideMine()
    {
        if(!this.engineerFSM.is(State.Mining))
        {
            return;
        }
        var tweens = [];
        tweens.push({
            targets: this,
            alpha: {value: 0, duration: 500},
            x: { value: (this.x+this.mapReference.layer.tileWidth), duration: 1000 },
            
        });
        this.updateAngle(Phaser.Math.Angle.Between(this.x,this.y,this.x+this.mapReference.layer.tileWidth,this.y));

        
        this.scene.tweens.timeline({
            tweens: tweens
        });
        
        await this.delay(1000);

        if(!this.engineerFSM.is(State.Mining))
        {
            return;
        }
        tweens = [];
        tweens.push({
            targets: this,
            alpha: {value: 1, duration: 500},
            x: { value: (this.x+(this.mapReference.layer.tileWidth*3/2)), duration: 1500 },
            
        });
        this.currentAnimation=AnimationState.Mining;
        this.updateAngle(Phaser.Math.Angle.Between(this.x,this.y,(this.x+(this.mapReference.layer.tileWidth*3/2)),this.y));

        
        this.scene.tweens.timeline({
            tweens: tweens
        });

        await this.delay(1500);

        this.miningFSM.go(MiningState.GoingToBase);

    }

    async MoveInsideBase()
    {
        if(!this.engineerFSM.is(State.Mining))
        {
            return;
        }
        var tweens = [];
        tweens.push({
            targets: this,
            alpha: {value: 0, duration: 500},
            x: { value: (this.x-(this.mapReference.layer.tileWidth/2)), duration: 1000 },
            
        });
        this.updateAngle(Phaser.Math.Angle.Between(this.x,this.y,this.x-this.mapReference.layer.tileWidth,this.y));

        
        this.scene.tweens.timeline({
            tweens: tweens
        });
        
        await this.delay(1000);
        if(!this.engineerFSM.is(State.Mining))
        {
            return;
        }
        tweens = [];
        tweens.push({
            targets: this,
            alpha: {value: 1, duration: 1000},
            x: { value: (this.x-(this.mapReference.layer.tileWidth)), duration: 1000 },
            
        });
        this.currentAnimation=AnimationState.Default;
        this.updateAngle(Phaser.Math.Angle.Between(this.x,this.y,(this.x-(this.mapReference.layer.tileWidth)),this.y));

        
        this.scene.tweens.timeline({
            tweens: tweens
        });
        

        await this.delay(1000);

        this.eventEmitter.emit(EventConstants.Game.AddResources,(25));
        this.miningFSM.go(MiningState.GoingToMine);
    }

    async MoveToMine()
    {
        if(!this.engineerFSM.is(State.Mining))
        {
            return;
        }
        var tweens = [];
        let awaitTime:number = 500;
        if (this.miningFSM.is(MiningState.GoingToMine) && this.path != null && this.path.length > 0) {
            var ex = this.path[0].x;
            var ey = this.path[0].y;
            var testCoords;
            var xyPos = Phaser.Tilemaps.Components.IsometricTileToWorldXY(ex, ey, testCoords, this.scene.cameras.main, this.mapReference.layer);
            if(( this.y-(xyPos.y+this.mapReference.layer.tileWidth/2)>-2)&&( this.y-(xyPos.y+this.mapReference.layer.tileWidth/2)<2)) //Horizontal moves are a greater distance. As such, ensure we treat it that way.
            {
                awaitTime+=awaitTime*0.3
            }            
            tweens.push({
                targets: this,
                x: { value: xyPos.x+this.mapReference.layer.tileWidth/2, duration: awaitTime },
                y: { value: xyPos.y+this.mapReference.layer.tileWidth/2, duration: awaitTime },
                onComplete: ()=>{this.MoveToMine()}
            });
            
            this.updateAngle(Phaser.Math.Angle.Between(this.x,this.y,xyPos.x+this.mapReference.layer.tileWidth/2,xyPos.y+this.mapReference.layer.tileWidth/2));
            
            this.scene.tweens.timeline({
                tweens: tweens
            });
            this.path.shift();
        }
        else if(this.miningFSM.is(MiningState.GoingToMine))
        {
            this.miningFSM.go(MiningState.InMine);

        }
        
    }
    
    async ProcessBuilding()
    { 
        await this.delay(1000);
        if(this.targetBuilding.increaseBuildingCompletionProgress())
        {
            this.buildingFSM.go(BuildingState.Initial);
            this.engineerFSM.go(State.Idle);
        }
        else
        {
            await this.ProcessBuilding();
        }
        

    }
    async MoveToBuilding()
    { 
        var tweens = [];
        let awaitTime:number = 500;
        if (this.buildingFSM.is(BuildingState.GoingToBuilding) && this.path != null && this.path.length > 0) {
            var ex = this.path[0].x;
            var ey = this.path[0].y;
            var testCoords;
            var xyPos = Phaser.Tilemaps.Components.IsometricTileToWorldXY(ex, ey, testCoords, this.scene.cameras.main, this.mapReference.layer);
            if(( this.y-(xyPos.y+this.mapReference.layer.tileWidth/2)>-2)&&( this.y-(xyPos.y+this.mapReference.layer.tileWidth/2)<2)) //Horizontal moves are a greater distance. As such, ensure we treat it that way.
            {
                awaitTime+=awaitTime*0.3
            }            
            tweens.push({
                targets: this,
                x: { value: xyPos.x+this.mapReference.layer.tileWidth/2, duration: awaitTime },
                y: { value: xyPos.y+this.mapReference.layer.tileWidth/2, duration: awaitTime },
                onComplete: ()=>{this.MoveToBuilding()}
            });
            this.updateAngle(Phaser.Math.Angle.Between(this.x,this.y,xyPos.x+this.mapReference.layer.tileWidth/2,xyPos.y+this.mapReference.layer.tileWidth/2));
            
            this.scene.tweens.timeline({
                tweens: tweens
            });
            this.path.shift();
        }
        else if(this.buildingFSM.is(BuildingState.GoingToBuilding))
        {
            await this.delay(awaitTime);
            this.buildingFSM.go(BuildingState.Building);

        }
    }
    async MoveToBase()
    { 
        var tweens = [];
        let awaitTime:number = 500;
        if (this.miningFSM.is(MiningState.GoingToBase) && this.path != null && this.path.length > 0) {
            var ex = this.path[0].x;
            var ey = this.path[0].y;
            var testCoords;
            var xyPos = Phaser.Tilemaps.Components.IsometricTileToWorldXY(ex, ey, testCoords, this.scene.cameras.main, this.mapReference.layer);
            if(( this.y-(xyPos.y+this.mapReference.layer.tileWidth/2)>-2)&&( this.y-(xyPos.y+this.mapReference.layer.tileWidth/2)<2)) //Horizontal moves are a greater distance. As such, ensure we treat it that way.
            {
                awaitTime+=awaitTime*0.3
            }            
            tweens.push({
                targets: this,
                x: { value: xyPos.x+this.mapReference.layer.tileWidth/2, duration: awaitTime },
                y: { value: xyPos.y+this.mapReference.layer.tileWidth/2, duration: awaitTime },
                onComplete: ()=>{this.MoveToBase()}
            });
            
            this.updateAngle(Phaser.Math.Angle.Between(this.x,this.y,xyPos.x+this.mapReference.layer.tileWidth/2,xyPos.y+this.mapReference.layer.tileWidth/2));
            
            this.scene.tweens.timeline({
                tweens: tweens
            });
            this.path.shift();
        }
        else if(this.miningFSM.is(MiningState.GoingToBase))
        {
            this.miningFSM.go(MiningState.InBase);

        }
        
    }


    requestMove(coordinates: Phaser.Math.Vector2) {
        console.log("X:"+coordinates.x+" , Y:"+coordinates.y);
        this.targetDestination = coordinates;
        var PlayerPos = Phaser.Tilemaps.Components.IsometricWorldToTileXY(this.x, this.y, true, PlayerPos, this.scene.cameras.main, this.mapReference.layer);
        this.pathFinder.findPath(PlayerPos.x - 1, PlayerPos.y, coordinates.x - 1, coordinates.y, (path) => {

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
            this.anims.play(this.currentAnimation+'engineer'+"-"+this.team+"-N", true);
        }
        else if(angle>22.5 && angle<=67.5)
        {
            this.anims.play(this.currentAnimation+'engineer'+"-"+this.team+"-NE", true);
        }
        else if(angle>67.5 && angle<=112.5)
        {
            this.anims.play(this.currentAnimation+'engineer'+"-"+this.team+"-E", true);
        }
        else if(angle>112.5 && angle<=157.5)
        {
            this.anims.play(this.currentAnimation+'engineer'+"-"+this.team+"-SE", true);
        }
        else if(angle>157.5 && angle<=202.5)
        {
            this.anims.play(this.currentAnimation+'engineer'+"-"+this.team+"-S", true);
        }
        else if(angle>202.5 && angle<=247.5)
        {
            this.anims.play(this.currentAnimation+'engineer'+"-"+this.team+"-SW", true);
        }
        else if(angle>247.5 && angle<=292.5)
        {
            this.anims.play(this.currentAnimation+'engineer'+"-"+this.team+"-W", true);
        }
        else if(angle>292.5 && angle<=337.5)
        {
            this.anims.play(this.currentAnimation+'engineer'+"-"+this.team+"-NW", true);
        }
    }

    async Move() {

        var tweens = [];
        let awaitTime:number = 500;
        if (this.engineerFSM.is(State.Moving) && this.path != null && this.path.length > 0) {
            var ex = this.path[0].x;
            var ey = this.path[0].y;
            var testCoords;
            var xyPos = Phaser.Tilemaps.Components.IsometricTileToWorldXY(ex, ey, testCoords, this.scene.cameras.main, this.mapReference.layer);
            if(( this.y-(xyPos.y+this.mapReference.layer.tileWidth/2)>-2)&&( this.y-(xyPos.y+this.mapReference.layer.tileWidth/2)<2)) //Horizontal moves are a greater distance. As such, ensure we treat it that way.
            {
                awaitTime+=awaitTime*0.3
            }            
            tweens.push({
                targets: this,
                x: { value: xyPos.x+this.mapReference.layer.tileWidth/2, duration: awaitTime },
                y: { value: xyPos.y+this.mapReference.layer.tileWidth/2, duration: awaitTime },
                onComplete: ()=>{this.Move()}
            });
            
            this.updateAngle(Phaser.Math.Angle.Between(this.x,this.y,xyPos.x+this.mapReference.layer.tileWidth/2,xyPos.y+this.mapReference.layer.tileWidth/2));
            
            this.scene.tweens.timeline({
                tweens: tweens
            });
            this.path.shift();
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