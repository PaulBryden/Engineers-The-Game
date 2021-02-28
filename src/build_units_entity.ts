import { Entity } from './entity'
import { typestate } from 'typestate';
import { EventConstants } from './GameConstants'
import { BuildingEntity } from './building_entity'

class BuildUnitsEntity extends BuildingEntity {
    buildingFSM: typestate.FiniteStateMachine<EventConstants.BuildingStates>;
    buildCounter: number;
    createEntityEvent: string;
    constructor(map: Phaser.Tilemaps.Tilemap, icon: string, name: string, scene: Phaser.Scene, x: number, y: number, requestBuildEvent: string, createEntityEvent: string, texture: string | Phaser.Textures.Texture, frame?: string | number) {
        super(map, icon, name, scene, x, y, texture);
        this.createEntityEvent = createEntityEvent;
        this.eventEmitter.on(requestBuildEvent, () => { this.selected ? this.requestBuild() : {}; });
        this.eventEmitter.on(EventConstants.Input.Cancel, () => { this.selected ? this.requestCancel() : {}; });
        this.buildingFSM = this.createFSM();
        this.buildCounter = 0;
    }

    createFSM(): typestate.FiniteStateMachine<EventConstants.BuildingStates> {
        let fsm: typestate.FiniteStateMachine<EventConstants.BuildingStates> = new typestate.FiniteStateMachine<EventConstants.BuildingStates>(EventConstants.BuildingStates.Idle);
        fsm.from(EventConstants.BuildingStates.Idle).to(EventConstants.BuildingStates.Building);
        fsm.from(EventConstants.BuildingStates.Building).to(EventConstants.BuildingStates.Idle);
        fsm.on(EventConstants.BuildingStates.Building, async (from: EventConstants.BuildingStates) => {
            for (let subs of this.subscribers) {
                subs.notify(EventConstants.BuildingStates.Building);
            }
            await this.Build();
        });
        fsm.on(EventConstants.BuildingStates.Idle, async (from: EventConstants.BuildingStates) => {
            for (let subs of this.subscribers) {
                subs.notify(EventConstants.BuildingStates.Idle);
            }
        });
        return fsm;
    }

    requestBuild() {
        this.buildingFSM.go(EventConstants.BuildingStates.Building);

    }
    requestCancel() {
        this.buildCounter = 0;
        this.buildingFSM.go(EventConstants.BuildingStates.Idle);

    }

    getStatus() {
        return this.buildingFSM.currentState.toString();
    }

    async Build() {

        var tweens = [];
        await this.delay(500);
        if (this.buildingFSM.is(EventConstants.BuildingStates.Building)) {
            this.buildCounter++;
            if (this.buildCounter != 10) {
                await this.Build();
            }
            else {
                this.buildCounter = 0;
                this.eventEmitter.emit(this.createEntityEvent, Phaser.Tilemaps.Components.IsometricWorldToTileXY(this.x - 32, this.y - 32, true, new Phaser.Math.Vector2(), this.scene.cameras.main, this.mapReference.layer));
                this.buildingFSM.go(EventConstants.BuildingStates.Idle);

            }
        }

    }
    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


}

export { BuildUnitsEntity };