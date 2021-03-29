import { Entity } from "./entity";
import EasyStar from 'easystarjs'
import { Path } from "./EasyStarSingleton";
class MovingEntity extends Entity {

    path: Path;
    speed: number; //Speed in world coords/second
    constructor(map: Phaser.Tilemaps.Tilemap, icon: string, name: string, scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture, team: number, frame?: string | number) {
        super(map, icon, name, scene, x, y, texture, team, frame);
        this.speed = 100
        this.path = [];
    }
    requestMove(coordinates: Phaser.Math.Vector2) {
    }
    update(delta) {
        super.update(delta);

    }
}
export { MovingEntity }