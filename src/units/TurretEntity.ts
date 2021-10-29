import { Entity } from './Entity';
import { typestate } from 'typestate';
import { EventConstants } from '../logic/GameConstants';
import { EasyStarGroundLevelSingleton, Path } from '../logic/EasyStarSingleton';
import { BuildingEntity } from './BuildingEntity';
import { AudioEffectsSingleton } from '../audio/AudioEffectsSingleton';

class TurretEntity extends BuildingEntity {
    targetEntity: Entity;
    entitiesToBeDamaged: Entity[];
    bulletTween: Phaser.Tweens.Tween;
    constructor(map: Phaser.Tilemaps.Tilemap, scene: Phaser.Scene, x: number, y: number, team: number) {
        super(map, 'turret' + '-' + team, 'Turret', scene, x, y, 'turret' + '-' + team, team);
        this.y += this.mapReference.layer.tileWidth / 4;
        this.blockedTiles.push(new Phaser.Math.Vector2(x - 1, y));
        this.avoidAdditionalPoints();
        this.status = 'Active';
        this.anims.play('turret' + '-' + this.team, true);
        this.setScale(1.3);
        this.selectedRectangle.displayWidth = this.selectedRectangle.displayWidth * 2 / 3;
        this.selectedRectangle.setVisible(false);
        this.AttackRoutine();
        this.entitiesToBeDamaged = [];
    }


    destroyBullet(bullet: Phaser.GameObjects.PointLight, enemy: Entity) {
        this.entitiesToBeDamaged.push(enemy);
        bullet.destroy();
    }

    CreateBullet(targetEntity: Entity) {
        if (this.scene.children.exists(this.targetEntity) ) {
            const bullet: Phaser.GameObjects.PointLight = new Phaser.GameObjects.PointLight(this.scene, this.x, this.y, 0x0000f0, 7, 0.5, 0.3);
            bullet.setDepth(targetEntity.GetTileLocation().x + targetEntity.GetTileLocation().y);
            this.addBulletTween({
                targets: bullet,
                x: { value: targetEntity.x, duration: 200 },
                y: { value: targetEntity.y, duration: 200 },
                onComplete: () => {
                    this.destroyBullet(bullet, targetEntity); 
                }
            });

            this.scene.add.existing(bullet);
            AudioEffectsSingleton.getInstance(this.scene).Laser.play();
        }

    }

    AttackRoutine() {
        if (this.targetEntity != undefined && this.scene.children.exists(this.targetEntity)  && this.getHealth() > 0) {
            this.CreateBullet(this.targetEntity);
        }
        else if (this.getHealth() <= 0) {
            return;
        }
        else {
            this.targetEntity = undefined;
        }
        const tweens = [];

        this.AddTween({
            targets: {},
            NOTHING: { value: 0, duration: 800 },
            onComplete: () => {
                this.AttackRoutine();
            }
        });

        this.scene.tweens.timeline({
            tweens: tweens
        });
    }

    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    update(delta) {

        if (this.entitiesToBeDamaged.length > 0) {
            this.entitiesToBeDamaged.forEach(entity => {
                entity.damage(5); 
            });
            this.entitiesToBeDamaged = [];
        }
        super.update(delta);
    }

    addBulletTween(config: Record<string, unknown>) {
        if (this.scene) {
            if (this.bulletTween) {
                this.RemoveTween(this.bulletTween);
            }
            this.bulletTween=this.scene.tweens.create(config);
            this.bulletTween.play();
        }

    }

}

export { TurretEntity };