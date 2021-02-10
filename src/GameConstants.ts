import 'phaser'
class SoundConstants
{
    public static readonly  soundEffectConfig:Phaser.Types.Sound.SoundConfig = {
        mute: false,
        volume: 1,
        rate: 1,
        detune: 0,
        seek: 0,
        loop: false,
        delay: 0
    };

}
class EntityNames
{
        public static readonly Engineer:string = "Engineer";
        public static readonly Base:string = "Base";
}

class CompassDirections
{
        public static readonly North:string  = "N";
        public static readonly NorthEas:string = "NE";
        public static readonly East:string  = "E";
        public static readonly SouthEast:string  = "SE";
        public static readonly South:string  = "S";
        public static readonly SouthWest:string  = "SW";
        public static readonly West:string  = "W";
        public static readonly NorthWest:string  = "NW";
}


namespace EventConstants
{
    export class EntityActions {
        public static readonly Selected:string  = "Select";
        public static readonly Move:string  = "Move";
        public static readonly Mine:string  = "Mine";
      }

      export class EntityBuild {
        public static readonly  CreateEngineer:string  = "CreateEngineer";
        public static readonly CreateBase:string  = "CreateBase";
        }

      export class Input {
        public static readonly  BuildEngineer:string  = "BuildEngineer";
        public static readonly BuildBase:string  = "BuildBase";
        public static readonly Cancel:string  = "Create";
        }
}

export {SoundConstants, EventConstants, CompassDirections, EntityNames as EntityConstants}