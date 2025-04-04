import { Enum } from "@core";
import { BlockAsset, blockKeys, shapeKeys } from "@/game/domains/shapes.ts";

export class BlockType extends Enum {
  static Circle = new BlockType("Circle", 0, "●");
  static Square = new BlockType("Square", 1, "■");
  static Triangle = new BlockType("Triangle", 2, "▲");
  static Star = new BlockType("Star", 3, "★");
  static Plus = new BlockType("Plus", 4, "✚");
  static Xmark = new BlockType("Xmark", 5, "✖");
  static Heart = new BlockType("Heart", 6, "❤︎");
  static Wave = new BlockType("Wave", 7, "⬟");

  static Lock = new BlockType("Lock", 8, "🔒");
  static Key = new BlockType("Key", 9, "🔑");
  static WirelessKey = new BlockType("WirelessKey", 10, "🔓");
  static Bomb = new BlockType("Bomb", 11, "💣");

  private static normalTypes = [
    BlockType.Circle,
    BlockType.Square,
    BlockType.Triangle,
    BlockType.Star,
    BlockType.Plus,
    BlockType.Xmark,
    BlockType.Heart,
    BlockType.Wave,
  ];

  private static keyTypes = [BlockType.Key, BlockType.WirelessKey];

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
