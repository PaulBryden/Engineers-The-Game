import {Entity} from './entity'
import { typestate } from 'typestate';
import {EventConstants} from './GameConstants'
import { EasyStarFlightLevelSingleton, EasyStarGroundLevelSingleton, Path } from './EasyStarSingleton';
import { BuildingEntity } from './building_entity';
import { EngineerEntity } from './engineer_entity';

class GliderEntity extends EngineerEntity
{
    constructor(map: Phaser.Tilemaps.Tilemap, scene: Phaser.Scene, x: number, y: number)
    {
        super(map,scene,x,y);
        this.y+=this.mapReference.layer.tileWidth/4;
        
        this.pathFinder = EasyStarFlightLevelSingleton.getInstance();
    }

    updateAngle(angle:number)
    {
        angle = Phaser.Math.Angle.Normalize(angle);
        angle = Phaser.Math.RadToDeg(angle)+90;
        if(angle>360)
        {
            angle=angle-360;
        }
        if((angle>337.5 && angle<=360)||(angle>0 && angle<=22.5))
        {
            this.anims.play('glider-N', true);
        }
        else if(angle>22.5 && angle<=67.5)
        {
            this.anims.play('glider-NE', true);
        }
        else if(angle>67.5 && angle<=112.5)
        {
            this.anims.play('glider-E', true);
        }
        else if(angle>112.5 && angle<=157.5)
        {
            this.anims.play('glider-SE', true);
        }
        else if(angle>157.5 && angle<=202.5)
        {
            this.anims.play('glider-S', true);
        }
        else if(angle>202.5 && angle<=247.5)
        {
            this.anims.play('glider-SW', true);
        }
        else if(angle>247.5 && angle<=292.5)
        {
            this.anims.play('glider-W', true);
        }
        else if(angle>292.5 && angle<=337.5)
        {
            this.anims.play('glider-NW', true);
        }
    }
    
    updateRenderDepth()
    {   
        super.updateRenderDepth();
        var tilePos = Phaser.Tilemaps.Components.IsometricWorldToTileXY(this.x-16, this.y-16, true, new Phaser.Math.Vector2, this.scene.cameras.main, this.mapReference.layer);
        this.selectedRectangle.setX(this.x);
        this.selectedRectangle.setY(this.y);
        this.selectedRectangle.setDepth(tilePos.x+tilePos.y+3);
        this.setDepth(tilePos.x+tilePos.y+3);
    }
}

export {GliderEntity};