import Phaser, { Scene } from "phaser";
import { cons } from "@core";
import Color = Phaser.Display.Color;
import Container = Phaser.GameObjects.Container;

export class ProgressBar {
  levelProgressBar: Phaser.GameObjects.Sprite;
  readonly scene: Scene;
  readonly container?: Container;

  constructor(
    scene: Scene | Container,
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    public color: Color,
    public max: number = 100,
    public progress: number = 0,
  ) {
    this.scene = scene instanceof Scene ? scene : scene.scene;
    this.container = scene instanceof Scene ? undefined : scene;

    this.levelProgressBar = this.scene.add
      .sprite(x, y, "blue-light-bar")
      .setOrigin(0)
      .setTint(color.color)
      .setDisplaySize(40, height);
    this.container?.add(this.levelProgressBar);
    const border = this.scene.add
      .rectangle(x, y, width, height)
      .setOrigin(0)
      .setStrokeStyle(3, color.color);
    this.setProgress(progress);
    this.container?.add(border);
  }

  setProgress(progress: number, max = this.max) {
    if (max > 0) {
      this.max = max;
    }
    this.progress = Phaser.Math.Clamp(progress, 0, this.max);
    const width = (this.width * this.progress) / this.max;
    cons.log("ProgressBar", this.progress, this.max, width);
    // tween to the new width
    this.scene.tweens.add({
      targets: this.levelProgressBar,
      scaleX: width / this.levelProgressBar.width,
      duration: 500,
      ease: Phaser.Math.Easing.Sine.InOut,
      onComplete: () => {
        this.levelProgressBar.setDisplaySize(width, this.height);
      },
    });
  }
}
