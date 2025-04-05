import { AnyObject, cons, getUuid, Id } from "@core";
import { GameObjectStruct, SpriteData } from "@/game/core/GameObjectStruct.ts";
import { BlockType, GameSettings, GameTheme, ZwapGame } from "@game";
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
export class Block<
  T extends BlockData = BlockData,
> extends GameObjectStruct<T> {
  private tween: Tween | undefined;
  public bType: BlockType;
  public bColor: Color;
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
    this.set("type", typeNr);
    this.changeColor(block.color);
    this.setDepth(100);

    if (block.isSelected) {
      this.setSelected(true);
    }

    this.setInteractive({
      cursor: "pointer",
      hitArea: new Phaser.Geom.Rectangle(0, 0, this.width, this.height),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
    });

    this.on("pointerup", () => {
      cons.log("click", this.getData("isSelected"));
      this.setSelected(!this.getData("isSelected"));
    });
  }

  changeColor(colorNr: number): this {
    const { colors } = this.theme;
    cons.log("Change color", colorNr, colors[colorNr]);
    this.bColor = Color.RGBStringToColor(colors[colorNr]);
    this.setTint(this.bColor.color);
    this.set("color", colorNr);
    return this;
  }

  get colorIndex(): number {
    return this.getData("color");
  }

  get settings(): GameSettings {
    return this.getData("settings");
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

  setSelected(selected: boolean): this {
    this.set("isSelected", selected);
    if (selected) {
      const border = this.scene.add
        .sprite(this.x, this.y, "block-border")
        .setTint(this.tint)
        .setAlpha(1)
        .setScale(this.scale * 1.1)
        .setDepth(101);
      this.effects.border = border;
      const startColor = this.bColor.clone().darken(10);
      const endColor = this.bColor.clone().brighten(30);
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
    const { halfSpace, rows, blockSpace } = this.settings;
    const reverseY = rows - row;
    this.effects.fall = this.scene.tweens.add({
      targets: this,
      y: reverseY * blockSpace + halfSpace,
      duration: 300,
      ease: Phaser.Math.Easing.Sine.In,
      delay: row * 100 + Math.random() * 90,
      onComplete: () => {
        delete this.effects.fall;
        if (row === 0) {
          this.scene.add.particles(this.x, this.y + halfSpace, "circle", {
            speedY: { min: -20, max: 20 },
            lifespan: { min: 500, max: 1000 },
            duration: 1,
            quantity: 10,
            x: { min: -halfSpace, max: halfSpace },
            blendMode: "ADD",
            tint: [0x333333, 0x0],
            scale: { start: 0.1, end: 0.4 },
            alpha: { start: 0.8, end: 0 },
          });
        }
      },
    });
    return this;
  }
}

export type BombData = BlockData & {
  counter?: number;
};
// @ts-ignore
export class Bomb extends Block<BombData> {
  setCounter(counter: number): this {
    this.set("counter", counter);
    return this;
  }

  decrementCounter(): this {
    const counter = this.get("counter") ?? 0;
    this.set("counter", counter - 1);
    return this;
  }

  explode(): this {
    this.set("isExploded", true);
    this.setSelected(false);
    this.effects["explosion"] = this.scene.add.particles(
      this.x,
      this.y,
      "star",
      {
        speed: { min: -100, max: 100 },
        lifespan: { min: 1000, max: 2000 },
        quantity: 20,
        scale: { start: 0.5, end: 0 },
        blendMode: "ADD",
        color: [0xffff99, 0xffaa00, 0x0000],
      },
    );
    this.destroy();
    return this;
  }
}

export function makeBlock(scene: ZwapGame, state: BlockData): Block {
  switch (state.type as Id) {
    case BlockType.Bomb.id:
      return new Bomb(scene, state);
    default:
      return new Block(scene, state);
  }
}

export function randomBlockData(
  settings: GameSettings,
  col: number,
  row: number,
): BlockData {
  const x = col * settings.blockSpace + settings.blockSpace / 2;
  const y = row * settings.blockSpace + settings.blockSpace / 2;
  const { maxColors, maxBlockTypes } = settings;
  return {
    id: getUuid(),
    color: Math.floor(Math.random() * maxColors),
    type: Math.floor(Math.random() * maxBlockTypes),
    x,
    y,
    size: { width: settings.blockSize, height: settings.blockSize },
    settings,
  };
}

export function makeRandomBlock(
  scene: ZwapGame,
  settings: GameSettings,
  col: number,
  row: number,
): Block {
  return makeBlock(scene, randomBlockData(settings, col, row));
}
