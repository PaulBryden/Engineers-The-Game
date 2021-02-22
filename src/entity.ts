import { EventEmitterSingleton } from './EventEmitterSingleton'
import { EventConstants } from './GameConstants'
import { IStatePublisher, IStateSubscriber } from './stateful';

class Entity extends Phaser.GameObjects.Sprite implements IStatePublisher {
    icon: string;
    health: number;
    status: string;
    name: string;
    mapReference: Phaser.Tilemaps.Tilemap;
    eventEmitter: EventEmitterSingleton;
    selected: boolean;
    selectedRectangle: Phaser.GameObjects.Rectangle;
    subscribers: IStateSubscriber[];
    constructor(map: Phaser.Tilemaps.Tilemap, icon: string, name: string, scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture, frame?: string | number) {
        let vector: Phaser.Math.Vector2 = Phaser.Tilemaps.Components.IsometricTileToWorldXY(x, y, new Phaser.Math.Vector2(), scene.cameras.main, map.getLayer('Tile Layer 1'));
        super(scene, vector.x, vector.y, texture, frame);
        this.selectedRectangle = new Phaser.GameObjects.Rectangle(scene, this.x, this.y, this.width, this.height, 0xffffff, 0x0).setStrokeStyle(1, 0xffffff);
        scene.add.existing(this.selectedRectangle);
        this.selectedRectangle.setVisible(false);
        this.eventEmitter = EventEmitterSingleton.getInstance();
        this.setDepth(x + y);
        this.subscribers = [];
        this.setInteractive(new Phaser.Geom.Circle(this.width / 2, this.height / 2, this.width / 3), this.handler);
        this.on('pointerup', (pointer, localX, localY, event)=>{this.emitSelected(pointer,localX,localY,event)}, this);
        this.mapReference = map;
        scene.add.existing(this);
        this.icon = icon;
        this.health = 100;
        this.status = "Idle";
        this.name = name;
        this.selected = false;

    }
    subscribe(sub: IStateSubscriber): void {
        this.subscribers.push(sub);
    }
    unsubscribe(sub: IStateSubscriber): void {
        const index = this.subscribers.indexOf(sub);
        if (index > -1) {
            this.subscribers.splice(index, 1);
        }
    }

    handler(shape, x, y, gameObject) {
        if (shape.radius > 0 && x >= shape.left && x <= shape.right && y >= shape.top && y <= shape.bottom) {
            var dx = (shape.x - x) * (shape.x - x);
            var dy = (shape.y - y) * (shape.y - y);
            return (dx + dy) <= (shape.radius * shape.radius);
        }
        else {
            return false;
        }
    }

    emitSelected(pointer, localX, localY, event) {
        if (!this.selected) {
            event.stopPropagation();
            this.eventEmitter.emit(EventConstants.EntityActions.Selected, this);
        }
    }

    getIconString() {
        return this.icon;
    }

    getHealth() {
        return this.health;
    }

    getStatus() {
        return this.status;
    }

    getName() {
        return this.name;
    }

    updateRenderDepth() {
        var tilePos = Phaser.Tilemaps.Components.IsometricWorldToTileXY(this.x - 16, this.y - 16, true, new Phaser.Math.Vector2, this.scene.cameras.main, this.mapReference.layer);
        this.selectedRectangle.setX(this.x);
        this.selectedRectangle.setY(this.y);
        this.selectedRectangle.setDepth(tilePos.x + tilePos.y);
        this.setDepth(tilePos.x + tilePos.y);

    }

    updateSelected(selected: boolean) {
        this.selectedRectangle.setVisible(selected);
        this.selected = selected;
    }
}

export { Entity };