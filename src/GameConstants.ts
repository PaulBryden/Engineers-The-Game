import 'phaser'
class SoundConstants {
  public static readonly soundEffectConfig: Phaser.Types.Sound.SoundConfig = {
    mute: false,
    volume: 1,
    rate: 1,
    detune: 0,
    seek: 0,
    loop: false,
    delay: 0
  };

}
class EntityNames {
  public static readonly Engineer: string = "Engineer";
  public static readonly Base: string = "Base";
}

class StartOfGame
{
  public static readonly resourceCount: number = 300;
}

class CompassDirections {
  public static readonly North: string = "N";
  public static readonly NorthEas: string = "NE";
  public static readonly East: string = "E";
  public static readonly SouthEast: string = "SE";
  public static readonly South: string = "S";
  public static readonly SouthWest: string = "SW";
  public static readonly West: string = "W";
  public static readonly NorthWest: string = "NW";
}


export class TeamNumbers {
  public static readonly Neutral: number = 0;
  public static readonly Player: number = 1;
  public static readonly Enemy: number = 2;
}

export class EntityID {
  public static readonly Engineer: string = "Engineer";
  public static readonly Glider: string = "Glider";
}

export class BuildingEntityID {
  public static readonly Base: string = "Base";
  public static readonly Factory: string = "Factory";
  public static readonly Turret: string = "Turret";
  public static readonly Mine: string = "Mine";
  public static readonly Scaffold: string = "Scaffold";
}

namespace EventConstants {
  export class EntityActions {
    public static readonly Selected: string = "Select";
    public static readonly Move: string = "Move";
    public static readonly Mine: string = "Mine";
  }
  export class EntityMovingUpdates {
    public static readonly FinishedMoving: string = "FinishedMoving";
  }

  export class EntityBuild {
    public static readonly CreateEngineer: string = "CreateEngineer";
    public static readonly CreateGlider: string = "CreateGlider";
    public static readonly CreateBase: string = "CreateBase";
    public static readonly CreateFactory: string = "CreateFactory";
    public static readonly CreateBuilding: string = "CreateBuilding";
    public static readonly DestroyScaffold: string = "DestroyScaffold";
  }
  export enum BuildingStates {
    Idle = "Idle",
    Building = "Building"
  }

  export class Input {
    public static readonly BuildEngineer: string = "BuildEngineer";
    public static readonly BuildGlider: string = "BuildGlider";
    public static readonly RequestBuildEngineer: string = "RequestBuildEngineer";
    public static readonly RequestCancelEngineer: string = "RequestCancelEngineer";
    public static readonly RequestBuildGlider: string = "RequestBuildGlider";
    public static readonly RequestCancelGlider: string = "RequestCancelGlider";
    public static readonly RequestBuildBase: string = "RequestBuildBase";
    public static readonly RequestBuildScaffold: string = "RequestBuildScaffold";
    public static readonly RequestBuildFactory: string = "RequestBuildFactory";
    public static readonly RequestBuildTurret: string = "RequestBuildTurret";
    public static readonly Cancel: string = "Create";
  }
  export class Game {
    public static readonly UpdateResourceCount: string = "UpdateResourceCount";
    public static readonly AddResources: string = "AddResources";
    public static readonly RemoveResources: string = "RemoveResources";
    public static readonly DestroyEntity: string = "DestroyEntity";
  }
}

export { SoundConstants, EventConstants, CompassDirections, StartOfGame, EntityNames as EntityConstants }