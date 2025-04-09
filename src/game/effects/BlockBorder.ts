import Phaser from "phaser";
import { Block, PuzzleBoard } from "@game";
import Sprite = Phaser.GameObjects.Sprite;
import Color = Phaser.Display.Color;

export class BlockBorder extends Sprite {
  public startColor: Color;
  public endColor: Color;
  private tween: Phaser.Tweens.Tween | undefined;

  constructor(
    readonly game: PuzzleBoard,
    readonly block: Block,
  ) {
    super(game.scene, block.x, block.y, "block-border");
    this.setAlpha(0);
    this.setTint(block.color.color);
    this.setScale(block.scale * 1.1);
    this.setDepth(2);
    const color = block.color.clone();
    this.startColor = color.clone().darken(30);
    this.endColor = color.clone().brighten(30);
    this.scene.add.existing(this);
    game.board.add(this);
    this.scene.tweens.addCounter({
      from: 0,
      to: 100,
      duration: 300,
      ease: "Sine.easeIn",
      onUpdate: (tween: Phaser.Tweens.Tween) => {
        const value = tween.getValue();
        const colorTw = Color.Interpolate.ColorWithColor(
          color,
          this.endColor,
          200,
          value,
        );
        this.setTint(colorTw.color);
        this.setAlpha(value / 100);
      },
    });
  }

  blink(): this {
    this.tween = this.scene.tweens.addCounter({
      from: 0,
      to: 100,
      duration: 300,
      ease: "Sine.easeIn",
      repeat: -1,
      yoyo: true,
      onUpdate: (tween: Phaser.Tweens.Tween) => {
        const value = tween.getValue();
        const color = Color.Interpolate.ColorWithColor(
          this.startColor,
          this.endColor,
          100,
          value,
        );
        this.setTint(color.color);
      },
    });
    return this;
  }

  destroy(): void {
    this.tween?.stop();
    this.tween = undefined;
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        super.destroy(true);
      },
    });
  }
}
