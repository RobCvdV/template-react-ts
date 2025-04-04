import { Child } from "@core";

export class GameSettings extends Child {
  readonly maxColors = this.state.maxColors as number;
  readonly maxBlockTypes = this.state.maxBlockTypes as number;
  readonly maxKeys = this.state.maxKeys as number;
  readonly maxLocks = this.state.maxLocks as number;
  readonly maxBombs = this.state.maxBombs as number;
  readonly boardWidth = this.state.boardWidth as number;
  readonly boardHeight = this.state.boardHeight as number;
  readonly speed = this.state.speed as number;

  static Normal = new GameSettings({
    id: "normal",
    maxColors: 6,
    maxBlockTypes: 6,
    maxKeys: 3,
    maxLocks: 3,
    maxBombs: 3,
    boardWidth: 8,
    boardHeight: 12,
    speed: 1,
  });
}
