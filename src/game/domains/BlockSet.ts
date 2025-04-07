import { Block, Bomb } from "@domains";

export class BlockSet {
  score = 0;
  constructor(
    public blocks: Block[] = [],
    public extraBlocks: Block[] = [],
  ) {}

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
