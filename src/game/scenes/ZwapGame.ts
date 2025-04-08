import {
  EnvironmentSettings,
  EventBus,
  GameSettings,
  GameTheme,
  PuzzleBoard,
  PuzzleBoardState,
  themes,
} from "@game";
import { Scene } from "phaser";
import { ensure, Json, singleton } from "@core";
import { StorageBase } from "@/core-react";

type GeneralSettings = {
  theme: GameTheme;
  game: GameSettings;
  environment: EnvironmentSettings;
};

export class ZwapGame extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  gameText: Phaser.GameObjects.Text;
  board: PuzzleBoard;
  settings: GeneralSettings;

  constructor(readonly store = singleton(StorageBase, "ZwapGame")) {
    super("ZwapGame");
  }

  create() {
    // get screen width and height from Phaser Game
    const gameSettings = GameSettings.Normal;
    const environment = EnvironmentSettings.fromBoardSize(
      gameSettings.columns,
      gameSettings.rows,
    );
    this.settings = {
      theme: themes.boyish,
      game: gameSettings,
      environment,
    };
    this.camera = this.cameras.main;
    console.log("ZwapGame", this.settings);
    this.background = this.add
      .image(
        environment.screenWidth / 2,
        environment.screenHeight / 2,
        "background",
      )
      .setDisplaySize(environment.screenWidth, environment.screenHeight);
    this.background.setAlpha(0.7).setTint(0xff9988);

    void this.store
      .get<PuzzleBoardState>("current-game")
      .then((game) => {
        if (!game || !game.settings) {
          console.log("No game found, creating new game");
          this.board = PuzzleBoard.fromSettings(this);
        } else {
          this.settings.game = ensure(
            GameSettings,
            game.settings,
            GameSettings.Normal,
          );
          this.board = new PuzzleBoard(this, game);
        }
        return this.board.startGame();
      })
      .then(() => {
        console.log("Game loaded", ...this.board.toLog());
      })
      .catch((e) => {
        console.error("Error loading game", e);
      });

    EventBus.emit("current-scene-ready", this);
  }

  async saveGame(game: Json) {
    console.log(game);
    return this.store.set("current-game", game);
  }

  changeScene() {
    this.scene.start("GameOver");
  }

  get env(): EnvironmentSettings {
    return this.settings.environment;
  }
  get theme(): GameTheme {
    return this.settings.theme;
  }
  get gameSettings(): GameSettings {
    return this.settings.game;
  }
}
