import { Struct } from "@core";

export type EnvironmentSettingsState = {
  screenWidth: number;
  screenHeight: number;
  columns: number;
  rows: number;
};

export class EnvironmentSettings extends Struct {
  readonly screenWidth = this.state.screenWidth;
  readonly screenHeight = this.state.screenHeight;
  readonly columns = this.state.columns;
  readonly rows = this.state.rows;
  readonly blockSpace = Math.min(
    this.screenWidth / this.columns,
    (this.screenHeight - 100) / this.rows,
  );
  readonly halfSpace = this.blockSpace / 2;
  readonly blockSize = this.blockSpace * 0.9;
  readonly width = this.blockSpace * this.columns;
  readonly height = this.blockSpace * this.rows;
  readonly offsetY: number = this.screenHeight - this.height;
  readonly offsetX: number = (this.screenWidth - this.width) / 2;
  readonly centerX: number = this.width / 2;
  readonly centerY: number = this.height / 2;

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
