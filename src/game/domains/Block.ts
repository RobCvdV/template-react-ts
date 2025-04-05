import { AnyObject, getUuid, logColors } from "@core";
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
  readonly container: Phaser.GameObjects.Container;

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

    // this.setInteractive({
    //   cursor: "pointer",
    //   hitArea: new Phaser.Geom.Rectangle(0, 0, this.width, this.height),
    //   hitAreaCallback: Phaser.Geom.Rectangle.Contains,
    // });
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
      style: `color: ${this.bColor.code}; background-color: #333; border-radius: 3px; padding: 0px 4px; font-size: 16px; margin: 2px;`,
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

  fallToRow(row: number): this {
    const { halfSpace, rows, blockSpace, offsetY } = this.settings;
    const reverseY = rows - row - 1;
    this.scene.tweens.add({
      targets: this,
      y: reverseY * blockSpace + halfSpace,
      duration: 300,
      ease: Phaser.Math.Easing.Sine.In,
      delay: row * 100 + Math.random() * 90,
      onComplete: () => {
        if (row === 0) {
          this.scene.add
            .particles(this.x, this.y + halfSpace + offsetY, "cloud", {
              blendMode: "ADD",
              duration: 1,
              quantity: 10,
              speedX: { min: -30, max: 30 },
              speedY: { min: -10, max: 10 },
              rotate: { min: -20, max: 20 },
              lifespan: { min: 400, max: 1200 },
              x: { min: -halfSpace, max: halfSpace },
              tint: [0x333333, 0x0],
              scaleX: { start: 0.15, end: 0.5, ease: "Sine.easeIn" },
              scaleY: { start: 0.2, end: 1, ease: "Sine.easeIn" },
              alpha: { start: 0.8, end: 0, random: true, ease: "Sine.easeOut" },
            })
            .setDepth(10);
        }
      },
    });
    return this;
  }
}
