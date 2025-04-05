import { EventBus, GameTheme, PuzzleBoard, themes } from "@game";
import { Scene } from "phaser";

type GeneralSettings = {
  theme: GameTheme;
  screenWidth: number;
  screenHeight: number;
};

export class ZwapGame extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  gameText: Phaser.GameObjects.Text;
  board: PuzzleBoard;
  settings: GeneralSettings = {
    theme: themes.boyish,
    screenWidth: 600,
    screenHeight: 1200,
  };

  constructor() {
    super("ZwapGame");
  }

  create() {
    this.camera = this.cameras.main;

    this.background = this.add.image(300, 600, "background");
    this.background.setAlpha(0.5);
    this.board = PuzzleBoard.fromSettings(this, "Normal");

    EventBus.emit("current-scene-ready", this);
  }

  changeScene() {
    this.scene.start("GameOver");
  }
}
