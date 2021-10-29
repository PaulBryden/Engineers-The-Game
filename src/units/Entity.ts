import { AudioEffectsSingleton } from '../audio/AudioEffectsSingleton';
import { EventEmitterSingleton } from '../logic/EventEmitterSingleton'
import { EventConstants } from '../logic/GameConstants'
import { IStatePublisher, IStateSubscriber } from '../logic/IStatePublisher';

class Entity extends Phaser.GameObjects.Sprite implements IStatePublisher {
    icon: string;
    health: number;
    status: string;
    name: string;
    mapReference: Phaser.Tilemaps.Tilemap;
    eventEmitter: EventEmitterSingleton;
    selected: boolean;
    selectedRectangle: Phaser.GameObjects.Rectangle;
    healthBackgroundRectangle: Phaser.GameObjects.Rectangle;
    healthForegroundRectangle: Phaser.GameObjects.Rectangle;
    subscribers: IStateSubscriber[];
    team:number;
    fogOfWarMask: Phaser.GameObjects.Image;
    currentlyRunningTween: Phaser.Tweens.Tween;
    clickableArea: Phaser.Geom.Circle;

    constructor(map: Phaser.Tilemaps.Tilemap, icon: string, name: string, scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture, team:number, frame?: string | number) {
        let vector: Phaser.Math.Vector2 = Phaser.Tilemaps.Components.IsometricTileToWorldXY(x, y, new Phaser.Math.Vector2(), scene.cameras.main, map.getLayer('Tile Layer 1'));
        super(scene, vector.x, vector.y, texture, frame);
        this.selectedRectangle = new Phaser.GameObjects.Rectangle(scene, this.x, this.y, this.width, this.height, 0xffffff, 0x0).setStrokeStyle(2, 0xffffff);
        this.healthBackgroundRectangle = new Phaser.GameObjects.Rectangle(scene, this.x, this.y-(10+(this.displayHeight/2)), 40, 5, 0xffffff, 1);
        this.healthForegroundRectangle = new Phaser.GameObjects.Rectangle(scene, this.x, this.y-(10+(this.displayHeight/2)), 38, 3, 0x064f13, 1);
        scene.add.existing(this.selectedRectangle);
        scene.add.existing(this.healthBackgroundRectangle);
        scene.add.existing(this.healthForegroundRectangle);
        this.selectedRectangle.setVisible(false);
        this.eventEmitter = EventEmitterSingleton.getInstance();
        this.setDepth(x + y);
        this.subscribers = [];
        this.clickableArea= new Phaser.Geom.Circle(this.width / 2, this.height / 2, this.width / 3);
        this.setInteractive(this.clickableArea, this.handler);
        this.on('pointerup', (pointer, localX, localY, event)=>{this.emitSelected(pointer,localX,localY,event)}, this);
        this.mapReference = map;
        scene.add.existing(this);
        this.icon = icon;
        this.health = 100;
        this.status = "Idle";
        this.name = name;
        this.selected = false;
        this.team=team;
        
        this.fogOfWarMask = this.scene.make.image({
            x: this.x,
            y: this.y,
            key: 'vision',
            add: false
        })
        this.fogOfWarMask.scale = 2;
    }
    
    GetFogOfWarMask()
    {
        return this.fogOfWarMask;
    }
    GetTileLocation()
    {
        return Phaser.Tilemaps.Components.IsometricWorldToTileXY(this.x, this.y, true, new Phaser.Math.Vector2, this.scene.cameras.main, this.mapReference.layer);
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
    damage(amount:number)
    {
        this.health-=amount;
        if(this.health<=0)
        {
            this.eventEmitter.emit(EventConstants.Game.DestroyEntity,this);
            AudioEffectsSingleton.getInstance(this.scene).Destroyed.play();
        }
        else
        {
            this.healthForegroundRectangle.displayWidth=38*(this.health/100);
        }

    }

    updateRenderDepth() {
        var tilePos = Phaser.Tilemaps.Components.IsometricWorldToTileXY(this.x - 16, this.y - 16, true, new Phaser.Math.Vector2, this.scene.cameras.main, this.mapReference.layer);
        this.selectedRectangle.setX(this.x);
        this.selectedRectangle.setY(this.y);
        this.fogOfWarMask.setX(this.x);
        this.fogOfWarMask.setY(this.y);
        this.selectedRectangle.setDepth(100);
        
        this.healthBackgroundRectangle.setX(this.x);
        this.healthBackgroundRectangle.setY(this.y-(10+(this.displayHeight/2)));
        this.healthBackgroundRectangle.setDepth(100);
        
        this.healthForegroundRectangle.setX(this.x-(19*(1-(this.health/100))));
        this.healthForegroundRectangle.setY(this.y-(10+(this.displayHeight/2)));
        this.healthForegroundRectangle.setDepth(100);
        this.setDepth(tilePos.x + tilePos.y);

    }

    update(delta)
    {
        this.updateRenderDepth();
    }

    destroy()
    {
        this.RemoveTween(this.currentlyRunningTween);
        this.selectedRectangle.destroy();
        this.healthBackgroundRectangle.destroy();
        this.healthForegroundRectangle.destroy();
        this.fogOfWarMask.destroy();
        super.destroy();
    }

    AddTween(config: Object)
    {
        if(this.scene)
        {
            if(this.currentlyRunningTween)
            {
                this.RemoveTween(this.currentlyRunningTween);
            }
            this.currentlyRunningTween=this.scene.tweens.create(config);
            this.currentlyRunningTween.play();
        }

    }

    RemoveTween(tween:Phaser.Tweens.Tween)
    {
        if(this.scene)
        {
            try{
            this.scene.tweens.remove(tween);
            }catch{}

        }
    }

    updateSelected(selected: boolean) {
        this.selectedRectangle.setVisible(selected);
        this.selected = selected;
    }
}

export { Entity };