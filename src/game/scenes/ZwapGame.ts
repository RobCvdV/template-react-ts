import {
  EventBus,
  GameSettings,
  GameTheme,
  PuzzleBoard,
  PuzzleBoardState,
  themes,
} from "@game";
import { Scene } from "phaser";
import { getNamedLogs, Json, singleton } from "@core";
import { StorageBase } from "@/core-react";

type GeneralSettings = {
  theme: GameTheme;
  game: GameSettings;
};

const cons = getNamedLogs({ name: "ZwapGame" });
export class ZwapGame extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  gameText: Phaser.GameObjects.Text;
  board: PuzzleBoard;
  settings: GeneralSettings = {
    theme: themes.boyish,
    game: GameSettings.Normal({ screenWidth: 600, screenHeight: 1200 }),
  };

  constructor(readonly store = singleton(StorageBase, "ZwapGame")) {
    super("ZwapGame");
  }

  create() {
    this.camera = this.cameras.main;
    this.background = this.add.image(300, 600, "background");
    this.background.setAlpha(0.3);

    void this.store
      .get<PuzzleBoardState>("current-game")
      .then((game) => {
        this.board = game
          ? new PuzzleBoard(this, game)
          : PuzzleBoard.fromSettings(this);
        return this.board.startGame();
      })
      .then(() => {
        cons.log("Game loaded", ...this.board.toLog());
      })
      .catch((e) => {
        cons.error("Error loading game", e);
      });

    EventBus.emit("current-scene-ready", this);
  }

  async saveGame(game: Json) {
    cons.log(game);
    return this.store.set("current-game", game);
  }

  changeScene() {
    this.scene.start("GameOver");
  }
}
