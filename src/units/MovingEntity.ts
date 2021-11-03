import { Entity } from './Entity';
import EasyStar from 'easystarjs';
import { Path } from '../logic/EasyStarSingleton';
import { EventConstants } from '../logic/GameConstants';
class MovingEntity extends Entity 
{

    path: Path;
    speed: number; //Speed in world coords/second
    centerToTileOffset: number;
    movingEventEmitter: Phaser.Events.EventEmitter;
    constructor(map: Phaser.Tilemaps.Tilemap, icon: string, name: string, scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture, team: number, frame?: string | number) 
    {
        super(map, icon, name, scene, x, y, texture, team, frame);
        this.speed = 100;
        this.centerToTileOffset=0;
        this.path = [];
        this.movingEventEmitter = new Phaser.Events.EventEmitter();
    }
    requestMove(coordinates: Phaser.Math.Vector2) 
    {
    }
    
    updateAngle(angle: number) 
    {} //stub

    update(delta) 
    {
        super.update(delta);
        let justShifted = false;
        let distanceToTravelThisTick: number = this.speed * delta * 0.001;
        while (this.path.length > 0) 
        {
            const ex = this.path[0].x;
            const ey = this.path[0].y;
            var testCoords;
            const xyPos: Phaser.Math.Vector2 = Phaser.Tilemaps.Components.IsometricTileToWorldXY(ex, ey, testCoords, this.scene.cameras.main, this.mapReference.layer);
            xyPos.x += this.mapReference.layer.tileWidth / 2;
            xyPos.y += (this.mapReference.layer.tileWidth / 2) - this.centerToTileOffset;
            const currentPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(this.x, this.y);
            //v*t = d;
            if (xyPos.distance(currentPosition) < distanceToTravelThisTick && this.path.length > 1) 
            {
                this.path.shift();
                justShifted = true;
                distanceToTravelThisTick = distanceToTravelThisTick - xyPos.distance(currentPosition);
            }
            else if (xyPos.distance(currentPosition) < distanceToTravelThisTick && this.path.length == 1) 
            {
                this.path.shift();
                this.updateAngle(Phaser.Math.Angle.Between(this.x, this.y, xyPos.x, xyPos.y));
                this.x = (xyPos.x);
                this.y = (xyPos.y);
                this.movingEventEmitter.emit(EventConstants.EntityMovingUpdates.FinishedMoving);
                break;
            }
            else 
            {
                this.updateAngle(Phaser.Math.Angle.Between(this.x, this.y, xyPos.x, xyPos.y));
                const scaleRatio: number = distanceToTravelThisTick / xyPos.distance(currentPosition);
                this.x += (xyPos.x - this.x) * scaleRatio;
                this.y += (xyPos.y - this.y) * scaleRatio;
                break;
            }
        }

    }
}
export { MovingEntity };