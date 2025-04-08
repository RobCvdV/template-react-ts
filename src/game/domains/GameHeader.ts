import { EnvironmentSettings, GameSettings, PuzzleBoard } from "@game";
import Phaser from "phaser";
import { ProgressBar } from "@/game/domains/ProgressBar.ts";
import Container = Phaser.GameObjects.Container;

export class GameHeader extends Container {
  score: Phaser.GameObjects.Text;
  level: Phaser.GameObjects.Text;
  progressBar: ProgressBar;
  private scoreValue = 0;

  constructor(public board: PuzzleBoard) {
    super(board.scene, 0, 0);
    this.scene.add.existing(this);
    this.setDepth(100);
    this.setSize(this.env.screenWidth, this.env.offsetY);
    let { offsetY, screenWidth } = this.env;
    offsetY = Math.min(offsetY, 60);
    const centerX = screenWidth / 2;
    const margin = offsetY * 0.06;
    const { text, bar } = this.theme;
    const { score, level, levelProgress } = this.board.progress;

    const image = this.scene.add
      .image(0, 0, "background-hor")
      .setDisplaySize(screenWidth, offsetY)
      .setTintFill(0x778787, 0x689898, 0x666696, 0x555595)
      .setTint(0x666666)
      .setOrigin(0);
    this.add(image);

    this.score = this.scene.add
      .text(margin, margin, `Score: ${score}`, {
        fontSize: offsetY * 0.4 + "px",
        color: text.rgba,
      })
      .setOrigin(0);
    this.add(this.score);

    this.level = this.scene.add
      .text(centerX + margin, margin, `Level: ${level}`, {
        fontSize: offsetY * 0.3 + "px",
        color: text.rgba,
      })
      .setOrigin(0);
    this.add(this.level);

    this.progressBar = new ProgressBar(
      this,
      centerX + margin,
      offsetY / 2,
      centerX - margin * 2,
      (offsetY - margin) / 2,
      bar,
      board.settings.progressNeeded,
      levelProgress,
    );
  }

  get theme() {
    return this.board.theme.ui;
  }

  get env(): EnvironmentSettings {
    return this.board.env;
  }

  get settings(): GameSettings {
    return this.board.settings;
  }

  updateScore(score: number) {
    this.score.setText(`Score: ${score}`);
    // add some sparkle effect
    this.scene.tweens.addCounter({
      from: this.scoreValue,
      to: score,
      duration: 500,
      onUpdate: (tween) => {
        const value = Math.round(tween.getValue());
        this.score.setText(`Score: ${value}`);
      },
      onComplete: () => {
        this.scoreValue = score;
        this.score.setText(`Score: ${score}`);
      },
    });
  }

  updateLevel(level: number) {
    this.level.setText(`Level: ${level}`);
    // add some sparkle effect
  }

  updateLevelProgress(level: number) {
    this.progressBar.setProgress(level);
  }
}
