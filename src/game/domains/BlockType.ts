import { Enum } from "@core";
import { BlockAsset, blockKeys, shapeKeys } from "@/game/resources/shapes.ts";

export class BlockType extends Enum {
  static Circle = new BlockType("circle", 0, "●");
  static Square = new BlockType("square", 1, "■");
  static Triangle = new BlockType("triangle", 2, "▲");
  static Star = new BlockType("star", 3, "★");
  static Plus = new BlockType("plus", 4, "✚");
  static Xmark = new BlockType("xmark", 5, "✖");
  static Heart = new BlockType("heart", 6, "❤︎");
  static Wave = new BlockType("wave", 7, "∿");

  static Lock = new BlockType("lock", 8, "🔒");
  static Key = new BlockType("Key", 9, "🔑");
  static WirelessKey = new BlockType("wirelessKey", 10, "🔓");
  static Bomb = new BlockType("bomb", 11, "💣");

  private static readonly normalTypes = [
    BlockType.Circle,
    BlockType.Square,
    BlockType.Triangle,
    BlockType.Star,
    BlockType.Plus,
    BlockType.Xmark,
    BlockType.Heart,
    BlockType.Wave,
  ];

  private static readonly keyTypes = [BlockType.Key, BlockType.WirelessKey];

  get blockAsset(): BlockAsset {
    return blockKeys[this.id as keyof typeof blockKeys] as BlockAsset;
  }

  get shapeAsset(): string {
    return shapeKeys[this.id as keyof typeof shapeKeys] as string;
  }

  get isNormal(): boolean {
    return BlockType.normalTypes.includes(this);
  }

  get isKey(): boolean {
    return BlockType.keyTypes.includes(this);
  }

  get isLock(): boolean {
    return this === BlockType.Lock;
  }

  get isBomb(): boolean {
    return this === BlockType.Bomb;
  }
}
