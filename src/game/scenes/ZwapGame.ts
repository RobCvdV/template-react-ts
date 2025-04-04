import { EventBus, GameSettings, GameTheme, PuzzleBoard, themes } from "@game";
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

    // this.gameText = this.add.text(512, 384, 'Make something fun!\nand share it with us:\nsupport@phaser.io', {
    //     fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
    //     stroke: '#000000', strokeThickness: 8,
    //     align: 'center'
    // }).setOrigin(0.5).setDepth(100);

    this.board = PuzzleBoard.fromSettings(GameSettings.Normal, this);

    EventBus.emit("current-scene-ready", this);
  }

  changeScene() {
    this.scene.start("GameOver");
  }
}
