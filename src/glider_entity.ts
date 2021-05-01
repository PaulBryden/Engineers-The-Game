import { Entity } from './entity'
import { typestate } from 'typestate';
import { EasyStarFlightLevelSingleton, EasyStarGroundLevelSingleton, Path } from './EasyStarSingleton';
import EasyStar from 'easystarjs'
import { MovingEntity } from './MovingEntity';
import { AudioEffectsSingleton } from './AudioEffectsSingleton';
import { GameStatus, TeamNumbers } from './GameConstants';

enum State {
    Idle = "Idle",
    Moving = "Moving",
    Attacking = "Attacking"
}
class GliderEntity extends MovingEntity {
    gliderFSM: typestate.FiniteStateMachine<State>;
    pathFinder: EasyStar.js;
    targetDestination: Phaser.Math.Vector2;
    targetEntity: Entity;
    entitiesToBeDamaged: Entity[];
    bulletTween: Phaser.Tweens.Tween;

    constructor(map: Phaser.Tilemaps.Tilemap, scene: Phaser.Scene, x: number, y: number, team: number) {
        super(map, "gliderPortrait" + "-" + team, "Glider", scene, x, y, "glider" + "-" + team, team);
        this.y += this.mapReference.layer.tileWidth / 4;
        this.removeInteractive();
        this.setInteractive(new Phaser.Geom.Circle(this.displayWidth / 2, 1 * this.displayWidth / 4, this.displayWidth / 2), this.handler);
        this.pathFinder = EasyStarFlightLevelSingleton.getInstance();
        this.gliderFSM = this.createFSM();
        this.anims.play('glider' + "-" + this.team + "-NW", true);
        this.centerToTileOffset = 16;
        this.entitiesToBeDamaged=[];
    }

    createFSM(): typestate.FiniteStateMachine<State> {
        let fsm: typestate.FiniteStateMachine<State> = new typestate.FiniteStateMachine<State>(State.Idle);
        fsm.from(State.Idle).to(State.Moving);
        fsm.from(State.Moving).to(State.Idle);
        fsm.from(State.Moving).to(State.Attacking);
        fsm.from(State.Attacking).to(State.Moving);
        fsm.from(State.Attacking).to(State.Idle);
        fsm.from(State.Idle).to(State.Attacking);
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
        fsm.on(State.Attacking, (from: State) => {
            for (let sub of this.subscribers) {
                sub.notify(State.Attacking);
            }
            this.Attack();
        });
        return fsm;
    }

    destroyBullet(bullet: Phaser.GameObjects.PointLight, enemy: Entity) {
        bullet.destroy();
        this.entitiesToBeDamaged.push(enemy);
    }

    CreateBullet() {
        let bullet: Phaser.GameObjects.PointLight = new Phaser.GameObjects.PointLight(this.scene, this.x, this.y, 0x0000f0, 7, 0.5, 0.3);
        bullet.setDepth(this.targetEntity.GetTileLocation().x + this.targetEntity.GetTileLocation().y);
        this.addBulletTween({
            targets: bullet,
            x: { value: this.targetEntity.x, duration: 200 },
            y: { value: this.targetEntity.y, duration: 200 },
            onComplete: () => { this.destroyBullet(bullet, this.targetEntity); }
        });

        this.scene.add.existing(bullet);
        AudioEffectsSingleton.getInstance(this.scene).Laser.play();
    }

    Attack() {
        let awaitTime: number = 500;
        let maxDistanceToTarget: number = 7;
        let minDistanceToTarget: number = 4;
        if(this.health<=0)
        {
            return;
        }
        let playerPos: Phaser.Math.Vector2 = this.GetTileLocation();
        if (this.targetEntity && this.scene.children.exists(this.targetEntity) && this.gliderFSM.is(State.Attacking)) {
            if (this.targetEntity.GetTileLocation().distance(playerPos) < maxDistanceToTarget) {
                this.CreateBullet();
                this.updateAngle(Phaser.Math.Angle.Between(this.x, this.y, this.targetEntity.x, this.targetEntity.y));
                if(Math.random() > 0.7 )
                {
                    this.path=[];
                }
            }else if (this.targetEntity.GetTileLocation().distance(playerPos) > minDistanceToTarget) {
                    this.requestAttack(this.targetEntity);
                }
            if (this.gliderFSM.is(State.Attacking)) {
                this.AddTween({
                    targets: this,
                    NOTHING: { value: 0, duration: awaitTime },
                    onComplete: () => { this.Attack(); }
                });
                //Not Moving but still firing Delay 500ms
            }

        }
        else {
            if (this.gliderFSM.is(State.Attacking)) {
                try
                {
                this.gliderFSM.go(State.Idle);
                }
                catch
                {

                }
            }
        }
    }


    Move() {

        let awaitTime: number = 500;
        if (this.gliderFSM.is(State.Moving) && this.path != null && this.path.length > 0 && this.health>0) {
            var ex = this.path[0].x;
            var ey = this.path[0].y;
            var testCoords;
            var xyPos = Phaser.Tilemaps.Components.IsometricTileToWorldXY(ex, ey, testCoords, this.scene.cameras.main, this.mapReference.layer);
            let playerPos: Phaser.Math.Vector2 = this.GetTileLocation();
            if ((playerPos.y - (xyPos.y + this.mapReference.layer.tileWidth / 2) > -2) && (playerPos.y - (xyPos.y + this.mapReference.layer.tileWidth / 2) < 2)) //Horizontal moves are a greater distance. As such, ensure we treat it that way.
            {
                awaitTime += awaitTime * 0.3
            }
            this.AddTween({
                targets: this,
                NOTHING: { value: 0, duration: awaitTime },
                onComplete: () => { this.Move() }
            });
        }
        else if (this.gliderFSM.is(State.Moving)){
            try
            {
            this.gliderFSM.go(State.Idle);
            }
            catch
            {

            }
        }

    }
    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    cancelMove() {
        this.gliderFSM.go(State.Idle);
    }

    getStatus() {
        return this.gliderFSM.currentState.toString();
    }

    updateAngle(angle: number) {
        angle = Phaser.Math.Angle.Normalize(angle);
        angle = Phaser.Math.RadToDeg(angle) + 90;
        if (angle > 360) {
            angle = angle - 360;
        }
        if ((angle > 337.5 && angle <= 360) || (angle > 0 && angle <= 22.5)) {
            this.anims.play('glider' + "-" + this.team + "-N", true);
        }
        else if (angle > 22.5 && angle <= 67.5) {
            this.anims.play('glider' + "-" + this.team + "-NE", true);
        }
        else if (angle > 67.5 && angle <= 112.5) {
            this.anims.play('glider' + "-" + this.team + "-E", true);
        }
        else if (angle > 112.5 && angle <= 157.5) {
            this.anims.play('glider' + "-" + this.team + "-SE", true);
        }
        else if (angle > 157.5 && angle <= 202.5) {
            this.anims.play('glider' + "-" + this.team + "-S", true);
        }
        else if (angle > 202.5 && angle <= 247.5) {
            this.anims.play('glider' + "-" + this.team + "-SW", true);
        }
        else if (angle > 247.5 && angle <= 292.5) {
            this.anims.play('glider' + "-" + this.team + "-W", true);
        }
        else if (angle > 292.5 && angle <= 337.5) {
            this.anims.play('glider' + "-" + this.team + "-NW", true);
        }
    }

    updateRenderDepth() {
        super.updateRenderDepth();
        var tilePos = Phaser.Tilemaps.Components.IsometricWorldToTileXY(this.x, this.y + 16, true, new Phaser.Math.Vector2, this.scene.cameras.main, this.mapReference.layer);
        this.selectedRectangle.setX(this.x);
        this.selectedRectangle.setY(this.y);
        this.selectedRectangle.setDepth(tilePos.x + tilePos.y + 3);
        this.setDepth(tilePos.x + tilePos.y + 3);
    }


    requestMove(coordinates: Phaser.Math.Vector2) {
        this.targetDestination = coordinates;
        var PlayerPos = this.GetTileLocation();
        this.pathFinder.findPath(PlayerPos.x - 1, PlayerPos.y, coordinates.x - 1, coordinates.y, (path) => {

            if (path != null && path.length > 0) {
                this.path = path;
                this.path.shift(); //first move is current position
                this.team==TeamNumbers.Player && GameStatus.ActiveGame ?Math.random() > 0.5 ? AudioEffectsSingleton.getInstance(this.scene).EngineerMoving1.play() : AudioEffectsSingleton.getInstance(this.scene).EngineerMoving2.play():{};
                try
                {
                this.gliderFSM.go(State.Moving);
                }catch{}
            }
        });
        try{
        this.pathFinder.calculate();
        }
        catch{}
    }

    requestAttack(entity: Entity) {
        this.targetEntity = entity;
        this.targetDestination = entity.GetTileLocation();
        var PlayerPos = this.GetTileLocation();
        this.pathFinder.findPath(PlayerPos.x - 1, PlayerPos.y, this.targetDestination.x - 1, this.targetDestination.y, (path) => {

            if (path != null && path.length > 0) {
                this.path = path;
                this.path.shift(); //first move is current position
                try
                {
                this.gliderFSM.go(State.Attacking);
                }
                catch{}
            }
            else {
                try
                {
                this.gliderFSM.go(State.Idle);
                }catch{}
            }
        });
        try{
        this.pathFinder.calculate();
        }
        catch{}
    }
    update(delta) {
        if(this.entitiesToBeDamaged.length>0)
        {
            this.entitiesToBeDamaged.forEach(entity => {entity.damage(5)});
            this.entitiesToBeDamaged=[];
        }
        super.update(delta);
    }

    GetTileLocation() {
        return Phaser.Tilemaps.Components.IsometricWorldToTileXY(this.x, this.y + this.centerToTileOffset, true, new Phaser.Math.Vector2, this.scene.cameras.main, this.mapReference.layer);
    }
    damage(amount:number)
    {
        if(this.health-amount<=0)
        {
            this.gliderFSM.reset();
        }
        super.damage(amount);
    }

    addBulletTween(config:Object)
    {   
        if(this.scene)
        {
            if(this.bulletTween)
            {
                this.RemoveTween(this.bulletTween);
            }
            this.bulletTween=this.scene.tweens.create(config);
            this.bulletTween.play();
        }

    }

}

export { GliderEntity };