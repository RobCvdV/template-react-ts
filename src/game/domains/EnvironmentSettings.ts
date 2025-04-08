import { Struct } from "@core";

export type EnvironmentSettingsState = {
  screenWidth: number;
  screenHeight: number;
  columns: number;
  rows: number;
};

export class EnvironmentSettings extends Struct {
  readonly width = this.state.screenWidth;
  readonly columns = this.state.columns;
  readonly rows = this.state.rows;
  readonly blockSpace = this.width / this.columns;
  readonly halfSpace = this.blockSpace / 2;
  readonly blockSize = this.blockSpace * 0.9;
  readonly height = this.blockSpace * this.rows;
  readonly screenWidth = this.state.screenWidth;
  readonly screenHeight = this.state.screenHeight;
  readonly offsetY: number = this.screenHeight - this.height - 50;

  static fromBoardSize(columns: number, rows: number): EnvironmentSettings {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    return new EnvironmentSettings({
      screenWidth,
      screenHeight,
      columns,
      rows,
    });
  }
}
