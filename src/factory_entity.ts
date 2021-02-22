import { typestate } from 'typestate';
import {EventConstants} from './GameConstants'
import { BuildUnitsEntity } from './build_units_entity';

class FactoryEntity extends BuildUnitsEntity
{
    constructor(map: Phaser.Tilemaps.Tilemap, scene: Phaser.Scene, x: number, y: number)
    {
        super(map,"factory","Factory",scene,x,y,EventConstants.Input.BuildGlider,EventConstants.EntityBuild.CreateGlider,"factory");
        this.setInteractive(new Phaser.Geom.Circle(this.width/2, this.height/2, this.width/4),this.handler);

    }

}

export {FactoryEntity};