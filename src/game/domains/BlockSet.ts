import { Block, Bomb } from "@game";
import Vector2 = Phaser.Math.Vector2;

export function centerOfBlockSets(blockSets: BlockSet[]): Vector2 {
  return blockSets
    .reduce(
      (center, blockSet) => {
        return center.add(blockSet.center);
      },
      new Vector2(0, 0),
    )
    .divide(new Vector2(blockSets.length, blockSets.length));
}

export class BlockSet {
  score = 0;
  constructor(
    public blocks: Block[] = [],
    public extraBlocks: Block[] = [],
  ) {}

  get center(): Vector2 {
    const center = new Vector2(0, 0);
    this.blocks.forEach((b) => {
      center.x += b.x;
      center.y += b.y;
    });
    center.x /= this.blocks.length;
    center.y /= this.blocks.length;
    return center;
  }

  toString(): string {
    return "[" + this.blocks.map((b) => b.toString()).join("") + "]";
  }

  toLog() {
    return ["[", ...this.blocks.map((b) => b.toLog()), "]"];
  }

  addToSet(block: Block): BlockSet {
    this.blocks.push(block);
    return this;
  }

  addExtraBlocks(blocks: Block[]): BlockSet {
    blocks.forEach((b) => {
      if (!this.blocks.includes(b)) {
        this.extraBlocks.push(b);
      }
    });
    return this;
  }

  hasBlock(block: Block): boolean {
    return this.blocks.some((b) => b.id === block.id);
  }

  get allBlocks(): Block[] {
    return [...this.blocks, ...this.extraBlocks];
  }

  get hasMinimumLength(): boolean {
    return this.blocks.length >= 4;
  }

  get bombs(): Bomb[] {
    return this.blocks.filter((b) => b.bType.isBomb) as Bomb[];
  }

  get isPureType(): boolean {
    return this.blocks.every(
      (b) => b.hasSameTypeAs(this.blocks[0]) || b.bType.isBomb || b.bType.isKey,
    );
  }

  get containsLock(): boolean {
    return this.blocks.some((b) => b.bType.isLock);
  }

  get containsKey(): boolean {
    return this.blocks.some((b) => b.bType.isKey);
  }
}
