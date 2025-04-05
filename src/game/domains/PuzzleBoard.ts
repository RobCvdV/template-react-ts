import { forEach } from "lodash";
import { ensure, getNamedLogs, getUuid, Id, Position, Struct } from "@core";
import {
  Block,
  BlockData,
  BlockSet,
  GameProgress,
  GameProgressState,
  GameSettings,
  GameSettingsKey,
  GameSettingsState,
  makeBlock,
  makeRandomBlock,
  MatchInfo,
  randomBlockData,
  Selection,
} from "@domains";
import { ZwapGame } from "@/game";

export type PuzzleBoardState = {
  id?: Id;
  data: (BlockData | Block)[][];
  settings: GameSettingsState | GameSettings;
  scene: ZwapGame;
  progress?: GameProgressState | GameProgress;
};

const cons = getNamedLogs({ name: "PuzzleBoard" });
export class PuzzleBoard extends Struct<PuzzleBoardState> {
  readonly id: Id = this.state.id ?? getUuid();
  readonly progress = ensure(GameProgress, this.state.progress, {});
  readonly settings = ensure(GameSettings, this.state.settings, {});
  readonly scene = this.state.scene;

  // data is a 2D array of Blocks, representing the board
  // data[0][0] is the bottom-left block
  // data[x][y] is the block at column x and row y
  // data[width - 1][height - 1] is the top-right block
  // the first index is the column, the second index is the row
  public data = this.state.data.map((row) =>
    row.map((cell) => {
      if (cell instanceof Block) {
        return cell;
      }
      return makeBlock(this.scene, cell);
    }),
  );

  static fromSettings(
    scene: ZwapGame,
    mode: GameSettingsKey = "Normal",
  ): PuzzleBoard {
    const settings = GameSettings[mode](scene.settings.screenWidth);
    return new PuzzleBoard({
      settings,
      scene,
      data: Array.from({ length: settings.columns }, (_, c) =>
        Array.from({ length: settings.rows }, (__, r) =>
          randomBlockData(settings, c, r),
        ),
      ),
    }).unchainByRecoloringBlocks();
  }

  get count(): number {
    return this.data.reduce((acc, row) => acc + row.length, 0);
  }

  get isEmpty(): boolean {
    return this.count === 0;
  }

  // getPosition returns the column, row of the block
  getPosition(block: Block): [number, number] {
    for (let x = 0; x < this.settings.columns; x++) {
      for (let y = 0; y < this.settings.rows; y++) {
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
        const count = this.settings.rows - col.length;
        // cons.log(count, ' blocks in col:', x);
        const nbs = Array.from({ length: count }, (__, r) =>
          makeRandomBlock(this.scene, this.settings, c, r),
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
      if (
        x < 0 ||
        x >= this.settings.columns ||
        y < 0 ||
        y >= this.settings.rows
      ) {
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
      (bl.colorIndex +
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
        ([_x, _y]) =>
          _x >= 0 &&
          _x < this.settings.columns &&
          _y >= 0 &&
          _y < this.settings.rows,
      )
      .map(([_x, _y]) => this.getBlockAt({ x: _x, y: _y }));
  }

  toString(): string {
    return this.data
      .map((row) => row.map((b) => b.toString()).join(""))
      .join("\n");
  }
}
