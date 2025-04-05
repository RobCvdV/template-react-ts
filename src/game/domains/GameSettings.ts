import { Child, JsonEntity } from "@core";

export type GameSettingsState = JsonEntity & {
  maxColors: number;
  maxBlockTypes: number;
  maxKeys: number;
  maxLocks: number;
  maxBombs: number;
  columns: number;
  rows: number;
  speed: number;
  width: number;
  screenWidth: number;
  screenHeight: number;
};

export class GameSettings extends Child<GameSettingsState> {
  readonly id = this.state.id as string;
  readonly maxColors = this.state.maxColors;
  readonly maxBlockTypes = this.state.maxBlockTypes;
  readonly maxKeys = this.state.maxKeys;
  readonly maxLocks = this.state.maxLocks;
  readonly maxBombs = this.state.maxBombs;
  readonly columns = this.state.columns;
  readonly rows = this.state.rows;
  readonly speed = this.state.speed;
  readonly width = this.state.width;
  readonly blockSpace = this.width / this.columns;
  readonly halfSpace = this.blockSpace / 2;
  readonly blockSize = this.blockSpace * 0.9;
  readonly height = this.blockSpace * this.rows;
  readonly screenWidth = this.state.screenWidth;
  readonly screenHeight = this.state.screenHeight;
  readonly offsetY: number = this.screenHeight - this.height;

  static Normal(gs: {
    screenWidth: number;
    screenHeight: number;
  }): GameSettings {
    return new GameSettings({
      id: "normal",
      maxColors: 6,
      maxBlockTypes: 6,
      maxKeys: 3,
      maxLocks: 3,
      maxBombs: 3,
      columns: 8,
      rows: 12,
      speed: 1,
      width: gs.screenWidth,
      ...gs,
    });
  }
}

export type GameSettingsKey = keyof Omit<typeof GameSettings, "prototype">;
