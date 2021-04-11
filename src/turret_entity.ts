import {Entity} from './entity'
import { typestate } from 'typestate';
import {EventConstants} from './GameConstants'
import { EasyStarGroundLevelSingleton, Path } from './EasyStarSingleton';
import { BuildingEntity } from './building_entity';
import { AudioEffectsSingleton } from './AudioEffectsSingleton';

class TurretEntity extends Entity
{
    targetEntity: Entity;
    constructor(map: Phaser.Tilemaps.Tilemap, scene: Phaser.Scene, x: number, y: number, team:number)
    {
        super(map,"turret"+"-"+team,"Turret",scene,x,y,"turret"+"-"+team,team);
        this.y+=this.mapReference.layer.tileWidth/4;
        EasyStarGroundLevelSingleton.getInstance().avoidAdditionalPoint(x-1,y);
        this.status="Operating";
        this.anims.play('turret' + "-" + this.team, true);
        this.setScale(1.3);
        this.selectedRectangle.displayWidth= this.selectedRectangle.displayWidth*2/3;
        this.selectedRectangle.setVisible(false);
        this.AttackRoutine();
    }

    
    destroyBullet(bullet: Phaser.GameObjects.PointLight, enemy: Entity) {
        enemy.damage(5);
        bullet.destroy();
    }

    async CreateBullet(targetEntity: Entity) {
        var tweens = [];
        let bullet: Phaser.GameObjects.PointLight = new Phaser.GameObjects.PointLight(this.scene, this.x, this.y, 0x0000f0, 7, 0.5, 0.3);
        bullet.setDepth(targetEntity.GetTileLocation().x + targetEntity.GetTileLocation().y);
        tweens.push({
            targets: bullet,
            x: { value: targetEntity.x, duration: 200 },
            y: { value: targetEntity.y, duration: 200 },
            onComplete: () => { this.destroyBullet(bullet, targetEntity); }
        });

        this.scene.tweens.timeline({
            tweens: tweens
        });
        this.scene.add.existing(bullet);
        AudioEffectsSingleton.getInstance(this.scene).Laser.play();
    }

    async AttackRoutine()
    {
        if(this.targetEntity!=undefined && this.targetEntity.getHealth()>0)
        {
            this.CreateBullet(this.targetEntity);
        }
        else
        {
            this.targetEntity=undefined;
        }
        await this.delay(400);
        this.AttackRoutine();
    }
    
    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


}

export {TurretEntity};