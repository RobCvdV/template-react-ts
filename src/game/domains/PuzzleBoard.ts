import { forEach } from "lodash";
import {
  ensure,
  getNamedLogs,
  getUuid,
  Id,
  Json,
  Position,
  Struct,
} from "@core";
import {
  Block,
  BlockData,
  BlockSet,
  GameSettings,
  makeBlock,
  makeRandomBlock,
  MatchInfo,
  Selection,
} from "@domains";
import { Scene } from "phaser";

type PuzzleBoardState = {
  id?: Id;
  width: number;
  height: number;
  data: (Json | Block)[][];
  settings: Json | GameSettings;
};

const cons = getNamedLogs({ name: "PuzzleBoard" });
export class PuzzleBoard extends Struct {
  readonly id: Id = this.state.id || getUuid();
  readonly width = this.state.width as number;
  readonly height = this.state.height as number;
  // data is a 2D array of Blocks, representing the board
  // data[0][0] is the bottom-left block
  // data[x][y] is the block at column x and row y
  // data[width - 1][height - 1] is the top-right block
  // the first index is the column, the second index is the row
  public data = (this.state.data as BlockData[][]).map((row) =>
    row.map((cell) => {
      cons.log("cell", typeof cell, cell);
      if (cell instanceof Block) {
        return cell;
      }
      return makeBlock(this.scene, cell);
    }),
  );

  readonly settings = ensure(
    GameSettings,
    this.state.settings,
    GameSettings.Normal,
  );

  constructor(
    data: PuzzleBoardState,
    readonly scene: Phaser.Scene,
  ) {
    super(data);
  }

  static fromSettings(settings: GameSettings, scene: Scene): PuzzleBoard {
    return new PuzzleBoard(
      {
        settings: settings,
        width: settings.boardWidth,
        height: settings.boardHeight,
        data: Array.from({ length: settings.boardWidth }, (_, c) =>
          Array.from({ length: settings.boardHeight }, (__, r) =>
            makeRandomBlock(
              scene,
              settings.maxColors,
              settings.maxBlockTypes,
              r,
              c,
            ),
          ),
        ),
      },
      scene,
    ).unchainByRecoloringBlocks();
  }

  get count(): number {
    return this.data.reduce((acc, row) => acc + row.length, 0);
  }

  get isEmpty(): boolean {
    return this.count === 0;
  }

  getPosition(block: Block): [number, number] {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (this.data[x][y]?.id === block?.id) {
          return [x, y];
        }
      }
    }
    return [-1, -1];
  }

  getMatchInfo(bl: Block, selected?: Block): MatchInfo {
    if (!selected || !bl || selected.id === bl.id) {
      return { kind: "none" } as MatchInfo;
    }
    const selection = { selected, second: bl } as Required<Selection>;
    if (bl.bType.isLock && selected.bType.isKey) {
      return { selection, kind: "unlock" };
    }
    if (bl.hasSameTypeAs(selected)) {
      return { selection, kind: "swap" };
    }
    return { selection, kind: "none" };
  }

  canSwap(a: Block, b: Block): boolean {
    return a.hasSameTypeAs(b);
  }

  getAllSwappableWith(b: Block): Block[] {
    return this.data.flat().filter((block) => this.canSwap(b, block));
  }

  swap(a: Block, b: Block): [Position, Position] {
    const [x1, y1] = this.getPosition(a);
    const [x2, y2] = this.getPosition(b);
    this.data[x1][y1] = b;
    this.data[x2][y2] = a;
    return [
      { x: x2, y: y2 },
      { x: x1, y: y1 },
    ];
  }

  addBlocksToFillOnTop(): Block[] {
    cons.log("addBlocksToFillOnTop...");
    const newBlocks = this.data
      .map((col, c) => {
        const count = this.settings.boardHeight - col.length;
        // cons.log(count, ' blocks in col:', x);
        const nbs = Array.from({ length: count }, (__, r) =>
          makeRandomBlock(
            this.scene,
            this.settings.maxColors,
            this.settings.maxBlockTypes,
            r,
            c,
          ),
        );
        col.push(...nbs);
        return nbs;
      })
      .flat();
    cons.log(
      "addBlocksToFillOnTop",
      newBlocks.map((b) => b.toString()).join(""),
    );
    this.unchainByRecoloringBlocks(newBlocks);
    cons.log("addBlocksToFillOnTop count", newBlocks.length);
    return newBlocks;
  }

  addBlocks(blocks: Block[][]): void {
    blocks.forEach((col, x) => {
      this.data[x] = col.concat(this.data[x]);
    });
    cons.log("board after addBlocks", this.data);
  }

  removeBlocks(ids: string[]): void {
    this.data = this.data.map((col) => {
      return col.filter((b) => ids.includes(b.id));
    });
    // cons.log('board after removeBlocks', this.data);
  }

  replaceBlock(block: Block, newBlock: Block): void {
    const [x, y] = this.getPosition(block);
    this.data[x][y] = newBlock;
  }

  // getBlockAt(x: Position): Block;
  // getBlockAt(x: number, y: number): Block;
  getBlockAt({ x, y }: Position): Block {
    return this.data[x][y];
  }

  private sets: BlockSet[] = [];
  clearSets() {
    this.sets = [];
  }

  findSetForBlock(block: Block): BlockSet {
    const existing = this.sets.find((set) => set.hasBlock(block));
    if (existing) {
      return existing;
    }
    const pos = this.getPosition(block);
    const set = new BlockSet([block]);
    const visited = new Set<string>();
    const visit = (x: number, y: number) => {
      if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
        return;
      }
      if (visited.has(`${x},${y}`)) {
        return;
      }
      visited.add(`${x},${y}`);
      const otherBlock = this.getBlockAt({ x, y });
      if (block.hasSameColorAs(otherBlock)) {
        if (!set.hasBlock(otherBlock)) {
          set.addToSet(otherBlock);
        }
        visit(x - 1, y);
        visit(x + 1, y);
        visit(x, y - 1);
        visit(x, y + 1);
      }
    };
    visit(...pos);

    set.addExtraBlocks(
      set.bombs.map((bomb) => this.getBlocksSurroundingBlock(bomb)).flat(),
    );

    if (set.hasMinimumLength) {
      this.sets.push(set);
    }
    return set;
  }

  getBlockSets(blocks?: Block[]): BlockSet[] {
    return (blocks || this.data.flat())
      .reduce<BlockSet[]>((acc, block) => {
        const ch = this.findSetForBlock(block);
        if (!acc.includes(ch)) {
          acc.push(ch);
        }
        return acc;
      }, [])
      .filter((set) => set.hasMinimumLength);
  }

  private nextRandomColorForBlock(bl: Block) {
    cons.log("nextRandomColorForBlock", bl.id);
    bl.changeColor(
      (bl.bColor.index +
        1 +
        Math.floor(Math.random() * this.settings.maxColors)) %
        this.settings.maxColors,
    );
  }

  private _unchainByRecoloringBlocks(blocks: Block[]): boolean {
    // first get all the sets where one of the blocks is in
    const sets = this.getBlockSets(blocks);
    cons.log("sets", sets.map((c) => c.toString()).join("\n"));

    // then recolor as little blocks as possible to break the sets
    forEach(sets, (set) => {
      const block = set.blocks[0];
      this.nextRandomColorForBlock(block);
    });

    return sets.length > 0;
  }

  unchainByRecoloringBlocks(blocks?: Block[]) {
    const blocksToCheck = blocks || this.data.flat();
    let changed = false;
    do {
      this.clearSets();
      changed = this._unchainByRecoloringBlocks(blocksToCheck);
      cons.log("unchainByRecoloringBlocks", changed);
    } while (changed);
    return this;
  }

  getBlocksSurroundingBlock(block: Block): Block[] {
    const [x, y] = this.getPosition(block);
    const surrounding = [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ];
    return surrounding
      .filter(
        ([_x, _y]) => _x >= 0 && _x < this.width && _y >= 0 && _y < this.height,
      )
      .map(([_x, _y]) => this.getBlockAt({ x: _x, y: _y }));
  }

  toString(): string {
    return this.data
      .map((row) => row.map((b) => b.toString()).join(""))
      .join("\n");
  }
}

class SetResult {
  set: BlockSet;
  blocksToDestroy: Block[] = [];
  newBlocks: Block[] = [];

  constructor(set: BlockSet) {
    this.set = set;
  }
}
