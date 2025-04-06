import { AnyObject, getUuid, logColors, waitMs } from "@core";
import { GameObjectStruct, SpriteData } from "@/game/core/GameObjectStruct.ts";
import {
  BlockColor,
  BlockType,
  GameSettings,
  GameTheme,
  ZwapGame,
} from "@game";
import Color = Phaser.Display.Color;
import Sprite = Phaser.GameObjects.Sprite;
import Tween = Phaser.Tweens.Tween;
import ParticleEmitter = Phaser.GameObjects.Particles.ParticleEmitter;

export type BlockData = SpriteData & {
  color: number;
  type: number;

  isSelected?: boolean;
  isMatchable?: boolean;
  isMatched?: boolean;

  settings: GameSettings;
};

// the BLockSprite class is a GameObject that represents a block in the game
export class Block<T extends BlockData = BlockData> extends GameObjectStruct<
  T,
  ZwapGame
> {
  private tween: Tween | undefined;
  public bType: BlockType;
  public color: Color;
  public bColor: BlockColor;
  protected effects: AnyObject<Sprite | Tween | ParticleEmitter> = {};

  constructor(scene: ZwapGame, block: T) {
    const typeNr = block.type ?? 0;
    const texture = scene.settings.theme.shapes[typeNr].blockAsset;
    super(scene, { ...block, texture });
    this.setDataEnabled();
    this.setData(block);
    this.addToUpdateList();
    this.name = block.id ?? getUuid();
    this.type = this.constructor.name;
    this.bType = scene.settings.theme.shapes[typeNr];
    this.changeColor(block.color);
    this.setDepth(1);

    if (block.isSelected) {
      this.setSelected(true);
    }
  }

  changeColor(colorNr: number): this {
    const { colors } = this.theme;
    // cons.log("Change color", colorNr, colors[colorNr]);
    this.color = Color.RGBStringToColor(colors[colorNr]);
    this.bColor = BlockColor.byId<BlockColor>(colorNr);
    this.setTint(this.color.color);
    this.set("color", colorNr);
    return this;
  }

  get colorIndex(): number {
    return this.get("color");
  }

  get settings(): GameSettings {
    return this.get("settings");
  }

  get theme(): GameTheme {
    return (this.scene as ZwapGame).settings.theme;
  }

  changeType(typeNr: number): this {
    this.setTexture(this.theme.shapes[typeNr].blockAsset);
    this.set("type", typeNr);
    return this;
  }

  get id(): string {
    return this.get("id");
  }

  hasSameColorAs(other: Block): boolean {
    return this.get("color") === other.get("color");
  }

  hasSameTypeAs(other: Block): boolean {
    return this.get("type") === other.get("type");
  }

  get selected(): boolean {
    return !!this.get("isSelected");
  }
  set selected(selected: boolean) {
    this.setSelected(selected);
  }

  toString(): string {
    return `${logColors.encircled}${logColors.bold}${this.bColor.fg} ${this.bType.code} ${logColors.reset}`;
  }

  toLog(): { text: string; style: string } {
    return {
      text: `${this.bType.code}`,
      style: `background-color: ${this.color.rgba}; color: #333; border-radius: 3px; padding: 0px 4px; font-size: 16px; margin: 2px;`,
    };
  }

  setSelected(selected: boolean): this {
    this.set("isSelected", selected);
    if (selected) {
      const border = this.scene.add
        .sprite(this.x, this.y, "block-border")
        .setTint(this.tint)
        .setAlpha(1)
        .setScale(this.scale * 1.1)
        .setDepth(2);
      this.parentContainer.add(border);
      this.effects.border = border;
      const startColor = this.color.clone().darken(10);
      const endColor = this.color.clone().brighten(30);
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
            startColor,
            endColor,
            100,
            value,
          );
          border.setTint(color.color);
        },
      });
    } else {
      this.tween?.stop();
      this.tween = undefined;
      this.effects.border?.destroy();
      delete this.effects.border;
    }
    return this;
  }

  get isMatchable(): boolean {
    return !!this.get("isMatchable");
  }

  setMatchable(matchable: boolean): this {
    this.set("isMatchable", matchable);
    if (matchable) {
      const startColor = this.color.clone();
      const endColor = this.color.clone().brighten(30);
      const border = this.scene.add
        .sprite(this.x, this.y, "block-border")
        .setTint(this.tint)
        .setAlpha(1)
        .setScale(this.scale * 1.1)
        .setDepth(2);
      this.parentContainer.add(border);
      this.effects.border = border;
      this.tween = this.scene.tweens.addCounter({
        from: 0,
        to: 100,
        duration: 300,
        ease: "Sine.easeIn",
        onUpdate: (tween: Phaser.Tweens.Tween) => {
          const value = tween.getValue();
          const color = Color.Interpolate.ColorWithColor(
            startColor,
            endColor,
            100,
            value,
          );
          border.setTint(color.color);
        },
      });
    } else {
      this.tween?.stop();
      this.tween = undefined;
      this.effects.border?.destroy();
      delete this.effects.border;
    }
    return this;
  }

  async fallToRow(row: number) {
    const { halfSpace, rows, blockSpace } = this.settings;
    const reverseY = rows - row - 1;
    const newY = reverseY * blockSpace + halfSpace;
    const distance = Math.abs(this.y - newY);
    const duration = Math.log(distance + 1) * 50 + Math.random() * 70;
    this.scene.tweens.add({
      targets: this,
      y: newY,
      duration,
      ease: Phaser.Math.Easing.Sine.In,
      delay: duration * 0.2,
      onComplete: () => {
        if (row === 0) {
          const emitter = this.scene.add
            .particles(this.x, this.y + halfSpace * 0.8, "cloud", {
              blendMode: "ADD",
              duration: 1,
              quantity: 10,
              speedX: { min: -30, max: 30 },
              speedY: { min: -10, max: 10 },
              rotate: { min: -20, max: 20 },
              lifespan: { min: 800, max: 1200 },
              x: { min: -halfSpace, max: halfSpace },
              tint: [0x333333, 0x0],
              scaleX: { start: 0.3, end: 0.5, ease: "Sine.easeOut" },
              scaleY: { start: 0.3, end: 0.7, ease: "Sine.easeOut" },
              alpha: {
                start: 0.8,
                end: 0,
                ease: "Sine.easeOut",
              },
            })
            .setDepth(10);
          this.parentContainer.add(emitter);
          this.scene.time.delayedCall(400, () => {
            emitter.destroy();
          });
        }
      },
    });
    return waitMs(duration);
  }
}
