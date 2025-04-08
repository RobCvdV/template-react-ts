import { AnyObject, getUuid, logColors, waitMs } from "@core";
import { GameObjectStruct, SpriteData } from "@/game/core/GameObjectStruct.ts";
import {
  BlockColor,
  BlockType,
  GameSettings,
  GameTheme,
  randomDropSound,
  ZwapGame,
} from "@game";
import * as Phaser from "phaser";
import { EnvironmentSettings } from "@/game/domains/EnvironmentSettings.ts";
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
  declare public scene: ZwapGame;
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
    this.bType = this.theme.shapes[typeNr];
    this.changeColor(block.color);
    this.setDepth(1);

    if (block.isSelected) {
      this.setSelected(true);
    }
  }

  // @ts-ignore
  toJSON(): BlockData {
    return this.data.getAll() as BlockData;
  }

  changeColor(colorNr: number): this {
    const { colors } = this.theme;
    // console.log("Change color", colorNr, colors[colorNr]);
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
    return this.scene.settings.game;
  }
  get env(): EnvironmentSettings {
    return this.scene.settings.environment;
  }

  get theme(): GameTheme {
    return this.scene.settings.theme;
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
      this.parentContainer?.add(border);
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
      this.parentContainer?.add(border);
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
    const { halfSpace, blockSpace, centerX } = this.env;
    const { rows } = this.settings;
    const reverseY = rows - row - 1;
    const newY = reverseY * blockSpace + halfSpace;
    const distance = Math.abs(this.y - newY);
    if (distance < 1) {
      return;
    }
    const duration = Math.log(distance * 3 + 1) * 50 + Math.random() * 70;
    this.scene.tweens.add({
      targets: this,
      y: newY,
      duration,
      ease: Phaser.Math.Easing.Sine.In,
      delay: duration * 0.2,
      onComplete: () => {
        this.y = newY;
        this.scene.sound.play(randomDropSound(), {
          rate: Phaser.Math.FloatBetween(0.9, 1.3),
          pan: (this.x - centerX) / centerX,
        });
      },
    });
    return waitMs(duration);
  }
}
