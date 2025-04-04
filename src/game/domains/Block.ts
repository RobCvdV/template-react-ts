import { AnyObject, cons, getUuid, Id } from "@core";
import { GameObjectStruct, SpriteData } from "@/game/core/GameObjectStruct.ts";
import { BlockType, ZwapGame } from "@game";
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
export class Block<
  T extends BlockData = BlockData,
> extends GameObjectStruct<T> {
  private tween: Tween | undefined;
  public bType: BlockType;
  public bColor: Color;
  protected effects: AnyObject<Sprite | Tween | ParticleEmitter> = {};

  // constructor(
  //   scene: Phaser.Scene,
  //   block: BlockData,
  //   public bType: BlockType = BlockType.byId<BlockType>(block.type),
  //   public bColor: BlockColor = BlockColor.byId<BlockColor>(block.color),
  // ) {
  //   cons.log("Construct Block", block, bType?.blockAsset, bColor?.phaser.color);
  //   super(scene, block, block.x, block.y, bType.blockAsset);
  //   this.addToUpdateList();
  //   this.setTint(this.bColor.phaser.color).setOrigin(0.5, 0.5);
  //   this.bColor = BlockColor.byId<BlockColor>(block.color);
  //   this.bType = BlockType.byId<BlockType>(block.type);
  //
  //   if (block.isSelected) {
  //     this.setSelected(true);
  //   }
  //
  //   this.setInteractive({
  //     cursor: "pointer",
  //     hitArea: new Phaser.Geom.Rectangle(0, 0, this.width, this.height),
  //     hitAreaCallback: Phaser.Geom.Rectangle.Contains,
  //   });
  //
  //   this.on("pointerup", () => {
  //     cons.log("click", this.getData("isSelected"));
  //     this.setSelected(!this.getData("isSelected"));
  //   });
  // }

  static create<T extends BlockData = BlockData>(scene: ZwapGame, block: T) {
    const bType: BlockType = scene.settings.theme.shapes[block.type];
    const bColor: Color = Color.RGBStringToColor(
      scene.settings.theme.colors[block.color],
    );
    // cons.log("Construct Block", block, bType?.blockAsset, bColor?.phaser.color);

    const bl = new Block(scene, block, block.x, block.y, bType.blockAsset);
    bl.bType = bType;
    bl.bColor = bColor;
    bl.addToUpdateList();
    bl.setTint(bColor.color);
    bl.setOrigin(0.5, 0.5);
    bl.setDepth(100);

    if (block.isSelected) {
      bl.setSelected(true);
    }

    bl.setInteractive({
      cursor: "pointer",
      hitArea: new Phaser.Geom.Rectangle(0, 0, bl.width, bl.height),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
    });

    bl.on("pointerup", () => {
      cons.log("click", bl.getData("isSelected"));
      bl.setSelected(!bl.getData("isSelected"));
    });
    return bl;
  }

  changeColor(colorNr: number): this {
    const { colors } = (this.scene as ZwapGame).settings.theme;
    cons.log("Change color", colorNr, colors[colorNr]);
    this.bColor = Color.RGBStringToColor(colors[colorNr]);
    this.setTint(this.bColor.color);
    this.data.set("color", colorNr);
    return this;
  }

  get colorIndex(): number {
    return this.getData("color");
  }

  changeType(typeNr: number): this {
    this.setTexture(BlockType.byId<BlockType>(typeNr).blockAsset);
    this.data.set("type", typeNr);
    return this;
  }

  get id(): string {
    return this.data.values.id;
  }

  hasSameColorAs(other: Block): boolean {
    return this.getData("color") === other.getData("color");
  }

  hasSameTypeAs(other: Block): boolean {
    return this.getData("type") === other.getData("type");
  }

  get selected(): boolean {
    return this.getData("isSelected");
  }
  set selected(selected: boolean) {
    this.setSelected(selected);
  }

  setSelected(selected: boolean): this {
    this.data.set("isSelected", selected);
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
}

export type BombData = Omit<BlockData, "type"> & {
  counter?: number;
};
// @ts-ignore
export class Bomb extends Block<BombData> {
  readonly counter: number;

  static create(scene: ZwapGame, data: BombData): Bomb {
    const bl = new Bomb(scene, {
      ...data,
      type: 11,
      counter: data.counter ?? 10,
    });
    bl.setCounter(data.counter ?? 10);
    return bl;
  }

  setCounter(counter: number): this {
    this.data.set("counter", counter);
    return this;
  }
}

export function makeBlock(scene: ZwapGame, state: BlockData): Block {
  switch (state.type as Id) {
    case BlockType.Bomb.id:
      return Bomb.create(scene, state);
    default:
      return Block.create(scene, state);
  }
}

export function makeRandomBlock(
  scene: ZwapGame,
  maxColors: number,
  maxBlockTypes: number,
  row: number,
  col: number,
): Block {
  return makeBlock(scene, {
    id: getUuid(),
    color: Math.floor(Math.random() * maxColors),
    type: Math.floor(Math.random() * maxBlockTypes),
    x: col,
    y: row,
  } as BlockData);
}
