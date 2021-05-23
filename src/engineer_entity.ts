import 'phaser'
import { Entity } from './entity'
import 'typestate';
import EasyStar from 'easystarjs'
import { typestate } from 'typestate';
import { EasyStarGroundLevelSingleton, Path } from './EasyStarSingleton';
import { AudioEffectsSingleton } from './AudioEffectsSingleton';
import { MineEntity } from './mine_entity';
import { BaseEntity } from './base_entity';
import { EventConstants, GameStatus, TeamNumbers } from './GameConstants'
import { MovingEntity } from './MovingEntity';
import { ScaffoldEntity } from './scaffold';

enum State {
    Idle = "Idle",
    Moving = "Moving",
    Mining = "Mining",
    Building = "Building"
}

enum MiningState {
    Initial = "InitialMine",
    GoingToMine = "GoingToMine",
    InMine = "InMine",
    GoingToBase = "GoingToBase",
    InBase = "InBase"
}

enum BuildingState {
    Initial = "InitialBuilding",
    GoingToBuilding = "GoingToBuilding",
    Building = "Building",
}

enum AnimationState {
    Default = "",
    Mining = "Mining",
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
    constructor(map: Phaser.Tilemaps.Tilemap, scene: Phaser.Scene, x: number, y: number, team: number) {
        super(map, "Portrait_Engineer", "Engineer", scene, x, y, "player" + "-" + team, team);
        this.removeInteractive();
        this.clickableArea= new Phaser.Geom.Circle(this.width / 2, this.height / 2, this.width / 2.3);
        this.setInteractive(this.clickableArea, this.handler);
        this.engineerFSM = this.createFSM();
        this.miningFSM = this.createMiningFSM();
        this.buildingFSM = this.createBuildingFSM();
        this.pathFinder = EasyStarGroundLevelSingleton.getInstance();
        this.anims.play('engineer' + "-" + team + "-SW", true);
        this.currentAnimation = AnimationState.Default;
        this.speed = 80;
    }

    createBuildingFSM(): typestate.FiniteStateMachine<BuildingState> {
        let fsm: typestate.FiniteStateMachine<BuildingState> = new typestate.FiniteStateMachine<BuildingState>(BuildingState.Initial);
        fsm.from(BuildingState.Initial).to(BuildingState.GoingToBuilding);
        fsm.from(BuildingState.GoingToBuilding).to(BuildingState.Building);
        fsm.from(BuildingState.Building).to(BuildingState.Initial);

        fsm.on(BuildingState.Building, (from: BuildingState) => {
            this.currentAnimation = AnimationState.Action;
            this.updateAngle(-Math.PI / 2);
            this.ProcessBuilding()
        });
        fsm.onExit(BuildingState.Building, (to: BuildingState) => {
            this.currentAnimation = AnimationState.Default;
            this.updateAngle(Math.PI / 2);
            return true;
        });


        fsm.on(BuildingState.GoingToBuilding, (from: BuildingState) => {
            this.updatePathToBuilding();
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
        fsm.on(State.Building, (from: State) => {
            for (let sub of this.subscribers) {
                sub.notify(State.Building);
            }
        });
        fsm.on(State.Idle, (from: State) => {
            for (let sub of this.subscribers) {
                sub.notify(State.Idle);
            }
        });
        fsm.on(State.Moving, (from: State) => {
            for (let sub of this.subscribers) {
                sub.notify(State.Moving);
            }
            this.Move();
        });
        fsm.on(State.Mining, (from: State) => {
            for (let sub of this.subscribers) {
                sub.notify(State.Mining);
            }
            this.Mine();
        });
        fsm.onExit(State.Mining, (to: State) => {
            this.miningFSM.reset();
            this.currentAnimation = AnimationState.Default;
            this.alpha = 1;
            return true;
        });
        fsm.onExit(State.Building, (to: State) => {
            this.buildingFSM.reset();
            this.currentAnimation = AnimationState.Default;
            return true;
        });
        return fsm;
    }


    updateNearestBase(base: BaseEntity) {
        this.nearestBase = base;
    }

    updatePathToMine() {
        var PlayerPos = Phaser.Tilemaps.Components.IsometricWorldToTileXY(this.x, this.y, true, PlayerPos, this.scene.cameras.main, this.mapReference.layer);
        var minePos = Phaser.Tilemaps.Components.IsometricWorldToTileXY(this.targetMine.x, this.targetMine.y, true, minePos, this.scene.cameras.main, this.mapReference.layer);

        this.pathFinder.findPath(PlayerPos.x - 1, PlayerPos.y, minePos.x - 3, minePos.y, (path) => {

            if (path != null && path.length > 0) {
                this.path = path;
                this.path.shift();
            }
            else {
                try{
                this.engineerFSM.go(State.Idle);
                }catch{}
            }
        });
        try {

            this.team == TeamNumbers.Player ? AudioEffectsSingleton.getInstance(this.scene).Blocked.play() : {};
            this.pathFinder.calculate();
        }
        catch { }
    }


    updatePathToBuilding() {
        this.path = [];
        var PlayerPos = this.GetTileLocation();
        var buildingEngineerPos = new Phaser.Math.Vector2(this.targetBuilding.desiredBuildingCoordinates.x + 1, this.targetBuilding.desiredBuildingCoordinates.y + 1);

        this.pathFinder.findPath(PlayerPos.x - 1, PlayerPos.y, buildingEngineerPos.x - 1, buildingEngineerPos.y, (path) => {

            if (path != null && path.length > 0) {
                this.path = path;
                this.path.shift();
                this.MoveToBuilding();
                this.team == TeamNumbers.Player ? AudioEffectsSingleton.getInstance(this.scene).Blocked.play() : {};
            }
            else {
                try{
                this.engineerFSM.go(State.Idle);
                }catch{}
            }
        });
        try {
            this.pathFinder.calculate();
        }
        catch { }
    }


    createMiningFSM(): typestate.FiniteStateMachine<MiningState> {
        let fsm: typestate.FiniteStateMachine<MiningState> = new typestate.FiniteStateMachine<MiningState>(MiningState.Initial);
        fsm.from(MiningState.Initial).to(MiningState.GoingToMine);
        fsm.from(MiningState.GoingToMine).to(MiningState.InMine);
        fsm.from(MiningState.InMine).to(MiningState.GoingToBase);
        fsm.from(MiningState.GoingToBase).to(MiningState.InBase);
        fsm.from(MiningState.InBase).to(MiningState.GoingToMine);

        fsm.on(MiningState.GoingToMine, (from: MiningState) => {
            try {
                var PlayerPos = Phaser.Tilemaps.Components.IsometricWorldToTileXY(this.x, this.y, true, PlayerPos, this.scene.cameras.main, this.mapReference.layer);
                var minePos = Phaser.Tilemaps.Components.IsometricWorldToTileXY(this.targetMine.x, this.targetMine.y, true, minePos, this.scene.cameras.main, this.mapReference.layer);

                this.pathFinder.findPath(PlayerPos.x - 1, PlayerPos.y, minePos.x - 3, minePos.y, (path) => {

                    if (path != null && path.length > 0) {
                        this.path = path;
                        this.path.shift();
                        this.MoveToMine();
                    }
                    else {
                        try {
                            this.engineerFSM.go(State.Idle);
                        } catch { }
                    }
                });
                this.pathFinder.calculate();
            } catch {
                try {
                    this.engineerFSM.go(State.Idle);
                } catch { }
            }
        });

        fsm.on(MiningState.GoingToBase, (from: MiningState) => {
            try {
                var PlayerPos = Phaser.Tilemaps.Components.IsometricWorldToTileXY(this.x, this.y, true, PlayerPos, this.scene.cameras.main, this.mapReference.layer);
                if (this.scene.children.exists(this.nearestBase)) {
                    var basePos = this.nearestBase.GetTileLocation();

                    this.pathFinder.findPath(PlayerPos.x - 1, PlayerPos.y, basePos.x, basePos.y - 1, (path) => {

                        if (path != null && path.length > 0) {
                            this.path = path;
                            this.path.shift();
                            this.MoveToBase();
                        }
                        else {
                            try {
                                this.engineerFSM.go(State.Idle);
                            }
                            catch { }
                        }
                    });
                    this.pathFinder.calculate();
                }else
                {
                    try {
                        this.miningFSM.reset();
                        this.engineerFSM.go(State.Idle);
                    }
                    catch { }
                }
            } catch { }
        });
        fsm.on(MiningState.InMine, (from: MiningState) => {
            this.MoveInsideMine();
        });
        fsm.on(MiningState.InBase, (from: MiningState) => {
            this.MoveInsideBase();
        });
        return fsm;
    }

    requestMine(mine: MineEntity) {

        if (this.targetMine != mine || !this.engineerFSM.is(State.Mining)) {
            this.team == TeamNumbers.Player && GameStatus.ActiveGame ? AudioEffectsSingleton.getInstance(this.scene).EngineerMining.play() : {};
            this.targetMine = mine;
            try{
                
            this.miningFSM.is(MiningState.GoingToMine) ? this.updatePathToMine() : this.miningFSM.canGo(MiningState.GoingToMine) ? this.miningFSM.go(MiningState.GoingToMine) : {};
        }catch{}
            try {
                !this.engineerFSM.is(State.Mining) ? this.engineerFSM.go(State.Mining) : {};
            } catch { }
        }
    }

    requestBuild(building: ScaffoldEntity) {

        if (this.targetBuilding != building || !this.engineerFSM.is(State.Building)) {
            this.targetBuilding = building;
            try{
            this.buildingFSM.is(BuildingState.GoingToBuilding) ? this.updatePathToBuilding() : this.buildingFSM.canGo(BuildingState.GoingToBuilding) ? this.buildingFSM.go(BuildingState.GoingToBuilding) : {};
            !this.engineerFSM.is(State.Building) ? this.engineerFSM.go(State.Building) : {};
            }catch{console.log("Requested Build, but engineer is already building... An Error has Occured.")}
        }
    }

    Mine() {
    }
    MoveInsideMineExit() {
        if (this.health > 0 && (this.miningFSM.is(MiningState.InMine))) {
            this.AddTween({
                targets: this,
                alpha: { value: 1, duration: 500 },
                x: { value: (this.x + (this.mapReference.layer.tileWidth * 3 / 2)), duration: 1500 },
                onComplete: () => { if (this.miningFSM.is(MiningState.InMine)) { this.miningFSM.go(MiningState.GoingToBase); } }

            });
            this.currentAnimation = AnimationState.Mining;
            this.updateAngle(Phaser.Math.Angle.Between(this.x, this.y, (this.x + (this.mapReference.layer.tileWidth * 3 / 2)), this.y));
        }

    }
    MoveInsideMine() {
        this.AddTween({
            targets: this,
            alpha: { value: 0, duration: 500 },
            x: { value: (this.x + this.mapReference.layer.tileWidth), duration: 1000 },
            onComplete: () => { this.MoveInsideMineExit(); }

        });
        this.updateAngle(Phaser.Math.Angle.Between(this.x, this.y, this.x + this.mapReference.layer.tileWidth, this.y));

    }

    MoveInsideBaseExit() {
        if (this.health > 0 && (this.miningFSM.is(MiningState.InBase))) {
            this.AddTween({
                targets: this,
                alpha: { value: 1, duration: 1000 },
                x: { value: (this.x - (this.mapReference.layer.tileWidth)), duration: 1000 },
                onComplete: () => {
                    this.eventEmitter.emit(EventConstants.Game.AddResources, (25), this.team);
                    this.team == TeamNumbers.Player ? AudioEffectsSingleton.getInstance(this.scene).AddResource.play() : {};
                    if (this.miningFSM.is(MiningState.InBase)) { this.miningFSM.go(MiningState.GoingToMine); }
                }

            });
            this.currentAnimation = AnimationState.Default;
            this.updateAngle(Phaser.Math.Angle.Between(this.x, this.y, (this.x - (this.mapReference.layer.tileWidth)), this.y));
        }

    }
    MoveInsideBase() {
        if (this.scene.children.exists(this.nearestBase)) {

        this.AddTween({
            targets: this,
            alpha: { value: 0, duration: 500 },
            x: { value: (this.x - (this.mapReference.layer.tileWidth / 2)), duration: 1000 },
            onComplete: () => { this.MoveInsideBaseExit() }

        });
        this.updateAngle(Phaser.Math.Angle.Between(this.x, this.y, this.x - this.mapReference.layer.tileWidth, this.y));
    }
    else
    {
        try
        {
            this.miningFSM.reset();
            this.engineerFSM.go(State.Idle);
        }catch{}
    
    }
}

    MoveToMine() {
        let awaitTime: number = 500;
        if (this.miningFSM.is(MiningState.GoingToMine) && this.path != null && this.path.length > 0) {
            this.movingEventEmitter.once(EventConstants.EntityMovingUpdates.FinishedMoving, () => {
                if (this.miningFSM.is(MiningState.GoingToMine)) {
                    try{
                    this.miningFSM.go(MiningState.InMine);
                    }catch{}
                }
            });
        }

    }

    ProcessBuilding() {
        if (this.buildingFSM.is(BuildingState.Building) && this.scene.children.exists(this.targetBuilding)) {
            this.AddTween({
                targets: this,
                NOTHING: { value: 0, duration: 1000 },
                onComplete: () => {
                    if (this.targetBuilding.getHealth() <= 0 || this.targetBuilding.increaseBuildingCompletionProgress()) {
                        try {
                            this.buildingFSM.go(BuildingState.Initial);
                            this.engineerFSM.go(State.Idle);
                        } catch { }
                    }
                    else {
                        this.ProcessBuilding();
                    }
                }
            });
        }
    }
    MoveToBuilding() {
        let awaitTime: number = 500;
        if (this.buildingFSM.is(BuildingState.GoingToBuilding) && this.path != null && this.path.length > 0) {

            this.movingEventEmitter.once(EventConstants.EntityMovingUpdates.FinishedMoving, () => {
                if (this.buildingFSM.is(BuildingState.GoingToBuilding)) {
                    try {
                        this.buildingFSM.go(BuildingState.Building);
                    } catch {

                    }
                }
            });
        }
    }
    MoveToBase() {
        if (this.miningFSM.is(MiningState.GoingToBase) && this.path != null && this.path.length > 0) {

            this.movingEventEmitter.once(EventConstants.EntityMovingUpdates.FinishedMoving, () => {
                if (this.miningFSM.is(MiningState.GoingToBase)) {
                    this.miningFSM.go(MiningState.InBase);
                }
            });
        }
    }


    requestMove(coordinates: Phaser.Math.Vector2) {
        console.log("X:" + coordinates.x + " , Y:" + coordinates.y);
        this.targetDestination = coordinates;
        var PlayerPos = Phaser.Tilemaps.Components.IsometricWorldToTileXY(this.x, this.y, true, PlayerPos, this.scene.cameras.main, this.mapReference.layer);
        this.pathFinder.findPath(PlayerPos.x - 1, PlayerPos.y, coordinates.x - 1, coordinates.y, (path) => {

            if (path != null && path.length > 0) {
                this.path = path;
                this.path.shift(); //first move is current position
                this.team == TeamNumbers.Player && GameStatus.ActiveGame ? Math.random() > 0.5 ? AudioEffectsSingleton.getInstance(this.scene).EngineerMoving1.play() : AudioEffectsSingleton.getInstance(this.scene).EngineerMoving2.play() : {};
                try {
                    this.engineerFSM.go(State.Moving);
                } catch { }
            }
            else {
                try {
                    this.team == TeamNumbers.Player ? AudioEffectsSingleton.getInstance(this.scene).Blocked.play() : {};
                    this.engineerFSM.go(State.Idle);
                } catch { }
            }
        });
        try {
            this.pathFinder.calculate();
        }
        catch { }
    }

    updateAngle(angle: number) {
        angle = Phaser.Math.Angle.Normalize(angle);
        angle = Phaser.Math.RadToDeg(angle) + 90;
        if (angle > 360) {
            angle = angle - 360;
        }
        if ((angle > 337.5 && angle <= 360) || (angle > 0 && angle <= 22.5)) {
            this.anims.play(this.currentAnimation + 'engineer' + "-" + this.team + "-N", true);
        }
        else if (angle > 22.5 && angle <= 67.5) {
            this.anims.play(this.currentAnimation + 'engineer' + "-" + this.team + "-NE", true);
        }
        else if (angle > 67.5 && angle <= 112.5) {
            this.anims.play(this.currentAnimation + 'engineer' + "-" + this.team + "-E", true);
        }
        else if (angle > 112.5 && angle <= 157.5) {
            this.anims.play(this.currentAnimation + 'engineer' + "-" + this.team + "-SE", true);
        }
        else if (angle > 157.5 && angle <= 202.5) {
            this.anims.play(this.currentAnimation + 'engineer' + "-" + this.team + "-S", true);
        }
        else if (angle > 202.5 && angle <= 247.5) {
            this.anims.play(this.currentAnimation + 'engineer' + "-" + this.team + "-SW", true);
        }
        else if (angle > 247.5 && angle <= 292.5) {
            this.anims.play(this.currentAnimation + 'engineer' + "-" + this.team + "-W", true);
        }
        else if (angle > 292.5 && angle <= 337.5) {
            this.anims.play(this.currentAnimation + 'engineer' + "-" + this.team + "-NW", true);
        }
    }

    Move() {

        let awaitTime: number = 500;
        if (this.engineerFSM.is(State.Moving) && this.path != null && this.path.length > 0 && this.health > 0) {
            this.AddTween({
                targets: this,
                NOTHING: { value: 0, duration: awaitTime },
                onComplete: () => { this.Move() }
            });

        }
        else if (this.engineerFSM.is(State.Moving)) {
            try{
                this.engineerFSM.go(State.Idle);

            }catch{}
        }

    }
    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    cancelMove() {
        try{
        this.engineerFSM.go(State.Idle);
        }catch{}
    }

    getStatus() {
        return this.engineerFSM.currentState.toString();
    }
    damage(amount: number) {
        if (this.health - amount <= 0) {
            this.engineerFSM.reset();
            this.miningFSM.reset();
            this.buildingFSM.reset();
        }
        super.damage(amount);
    }

}

export { EngineerEntity };