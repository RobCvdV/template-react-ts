import { cons, getUuid, Id } from "@core";
import { GameObjectStruct, SpriteData } from "@/game/core/GameObjectStruct.ts";
import { BlockColor, BlockType } from "@game";
import { Scene } from "phaser";
import Color = Phaser.Display.Color;

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
  private tween: Phaser.Tweens.Tween | undefined;
  public bType: BlockType;
  public bColor: BlockColor;

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

  static create<T extends BlockData = BlockData>(
    scene: Phaser.Scene,
    block: T,
  ) {
    const bType: BlockType = BlockType.byId<BlockType>(block.type);
    const bColor: BlockColor = BlockColor.byId<BlockColor>(block.color);
    cons.log("Construct Block", block, bType?.blockAsset, bColor?.phaser.color);
    const bl = new Block(scene, block, block.x, block.y, bType.blockAsset);
    bl.bType = bType;
    bl.bColor = BlockColor.byId<BlockColor>(block.color);
    bl.addToUpdateList();
    bl.setTint(bColor.phaser.color).setOrigin(0.5, 0.5);

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
    this.setTint(BlockColor.byId<BlockColor>(colorNr).phaser.color);
    this.data.set("color", colorNr);
    return this;
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
      const startColor = this.bColor.phaser.clone().darken(10);
      const endColor = this.bColor.phaser.clone().brighten(40);
      this.tween = this.scene.tweens.addCounter({
        from: 0,
        to: 100,
        duration: 500,
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
          this.setTint(color.color);
        },
      });
    } else {
      this.tween?.stop();
      const startColor = Color.IntegerToColor(this.tint);
      const endColor = this.bColor.phaser.clone();
      this.tween = this.scene.tweens.addCounter({
        from: 100,
        to: 0,
        duration: 200,
        onUpdate: (tween: Phaser.Tweens.Tween) => {
          const value = tween.getValue();
          const color = Color.Interpolate.ColorWithColor(
            startColor,
            endColor,
            100,
            value,
          );
          this.setTint(color.color);
        },
      });
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

  static create(scene: Phaser.Scene, data: BombData): Bomb {
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

export function makeBlock(scene: Scene, state: BlockData): Block {
  switch (state.type as Id) {
    case BlockType.Bomb.id:
      return Bomb.create(scene, state);
    default:
      return Block.create(scene, state);
  }
}

export function makeRandomBlock(
  scene: Scene,
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
