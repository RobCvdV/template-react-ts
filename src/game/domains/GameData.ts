import { Child, ensure, Json, JsonEntity } from "@core";
import { GameProgress, GameSettings, PuzzleBoard } from "@domains";

export type GameDataType = JsonEntity & {
  version?: string;
  settings?: Json;
  puzzleBoard?: Json;
  progress?: Json;
  statistics?: any;
};

export class GameData extends Child {
  readonly version = this.state.version || "1.0";
  readonly settings = ensure(
    GameSettings,
    this.state.settings,
    GameSettings.Normal,
  );
  readonly puzzleBoard = ensure(
    PuzzleBoard,
    this.state.puzzleBoard,
    PuzzleBoard.fromSettings(this.settings),
  );
  readonly progress = ensure(GameProgress, this.state.progress, {});

  static from(settings: GameSettings): GameData {
    console.log("GameData", settings);
    return new GameData({
      settings: settings,
      progress: {},
      statistics: {},
    });
  }
}
