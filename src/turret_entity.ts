import {Entity} from './entity'
import { typestate } from 'typestate';
import {EventConstants} from './GameConstants'
import { EasyStarGroundLevelSingleton, Path } from './EasyStarSingleton';
import { BuildingEntity } from './building_entity';

class TurretEntity extends Entity
{
    constructor(map: Phaser.Tilemaps.Tilemap, scene: Phaser.Scene, x: number, y: number, team:number)
    {
        super(map,"turret"+"-"+team,"Turret",scene,x,y,"turret"+"-"+team,team);
        this.y+=this.mapReference.layer.tileWidth/4;
        EasyStarGroundLevelSingleton.getInstance().avoidAdditionalPoint(x-1,y);
        this.status="Operating";
        this.anims.play('turret' + "-" + this.team, true);
        this.setScale(1.3);
    }

}

export {TurretEntity};