import { typestate } from 'typestate';
import {EventConstants} from '../logic/GameConstants'
import { BuildUnitsEntity } from './BuildUnitsEntity';

class FactoryEntity extends BuildUnitsEntity
{
    constructor(map: Phaser.Tilemaps.Tilemap, scene: Phaser.Scene, x: number, y: number, team:number)
    {
        super(map,"factory"+"-"+team,"Factory",scene,x,y,EventConstants.Input.BuildGlider,EventConstants.EntityBuild.CreateGlider,"factory"+"-"+team, team);
        this.setInteractive(new Phaser.Geom.Circle(this.width/2, this.height/2, this.width/4),this.handler);

    }

}

export {FactoryEntity};