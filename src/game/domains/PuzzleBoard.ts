import { forEach, pick } from "lodash";
import {
  cons,
  ensure,
  getUuid,
  Id,
  JsonEntity,
  List,
  Position,
  Struct,
  toJson,
  toList,
} from "@core";
import {
  Block,
  BlockData,
  BlockSet,
  ConnectionLine,
  EnvironmentSettings,
  GameController,
  GameFlow,
  GameHeader,
  GameProgress,
  GameProgressState,
  GameSettings,
  GameSettingsState,
  makeBlock,
  makeRandomBlock,
  MatchInfo,
  Selection,
  ZwapGame,
} from "@game";
import Container = Phaser.GameObjects.Container;
import Pointer = Phaser.Input.Pointer;
import Vector2 = Phaser.Math.Vector2;

export type PuzzleBoardState = JsonEntity & {
  data?: BlockData[][];
  settings: GameSettingsState | GameSettings;
  progress?: GameProgressState | GameProgress;
};

export class PuzzleBoard extends Struct<PuzzleBoardState> {
  readonly id: Id = this.state.id ?? getUuid();
  readonly progress = ensure(GameProgress, this.state.progress, {});
  // data is a 2D array of Blocks, representing the board
  // data[0][0] is the bottom-left block
  // data[x][y] is the block at column x and row y
  // data[width - 1][height - 1] is the top-right block
  // the first index is the column, the second index is the row
  public data: Block<BlockData>[][];

  public board: Container;
  public header: GameHeader;
  readonly controller = new GameController();
  readonly scene: ZwapGame;
  readonly connectionLine: ConnectionLine;

  // the only fields / props that need to be serialized to recreate the game at any point
  // in time. "settings" here are GameSettings, environment and theme are flexible and should NOT
  // be serialized or influence actual game state.
  toJSON(): PuzzleBoardState {
    return toJson<PuzzleBoardState>(
      pick(this, "id", "progress", "settings", "data"),
    );
  }

  constructor(
    scene: ZwapGame,
    readonly state: PuzzleBoardState,
  ) {
    super(state);
    this.controller.interactionDisabled = true;
    this.scene = scene;
    this.initHeader();
    this.initBoard();

    this.progress._getSettings = () => this.settings;
    this.data =
      this.state.data?.map((col, c) =>
        col.map((cell, r) =>
          makeBlock(this.scene, cell, this.board, c, -5 - r * 3),
        ),
      ) ?? Array.from({ length: this.settings.columns }, () => []);
    this.connectionLine = new ConnectionLine(this);
  }

  static fromSettings(scene: ZwapGame): PuzzleBoard {
    const settings = scene.settings.game;
    const pb = new PuzzleBoard(scene, {
      id: getUuid(),
      settings,
    });
    pb.addBlocksToFillOnTop();
    return pb;
  }

  get env(): EnvironmentSettings {
    return this.scene.settings.environment;
  }

  get settings(): GameSettings {
    return this.scene.settings.game;
  }

  get theme() {
    return this.scene.settings.theme;
  }

  async startGame() {
    await this.letBlocksFall();
    this.controller.interactionDisabled = false;
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

  getMatchInfo(bl: Block): MatchInfo {
    const { selected } = this.controller;
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
    return a !== b && a.hasSameTypeAs(b);
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

  addBlocksToFillOnTop() {
    // console.log("addBlocksToFillOnTop...");
    const newBlocks = this.data.flatMap((col, c) => {
      const count = this.settings.rows - col.length;
      const nbs = Array.from({ length: count }, (__, r) =>
        makeRandomBlock(this.scene, c, -5 - r * 3, this.board),
      );
      col.push(...nbs);
      return nbs;
    });

    this.unchainByRecoloringBlocks(newBlocks);
    console.log("board after addBlocksToFillOnTop\n", ...this.toLog());
  }

  async letBlocksFall(blocks?: Block[]) {
    const ids = (blocks ?? this.data.flat()).map((b) => b.id);
    await Promise.all(
      this.data.flatMap(async (col) => {
        return Promise.all(
          col.flatMap(async (block, r) => {
            if (!ids.includes(block.id)) {
              return;
            }
            return block.fallToRow(r);
          }),
        );
      }),
    );
    console.log("letBlocksFall done");
  }

  addBlocks(blocks: Block[][]): void {
    blocks.forEach((col, x) => {
      this.data[x] = col.concat(this.data[x]);
    });
    console.log("board after addBlocks", this.data);
  }

  removeBlocks(ids: string[]): void {
    this.data = this.data.map((col) => {
      return col.filter((b) => !ids.includes(b.id));
    });
  }

  replaceBlock(block: Block, newBlock: Block): void {
    const [x, y] = this.getPosition(block);
    this.data[x][y] = newBlock;
  }

  getBlockAt(pos: Position | Pointer): Block {
    let { x, y } = pos;
    if (pos instanceof Pointer) {
      const localPos = this.getLocalPosition(pos);
      x = Math.floor(localPos.x / this.env.blockSpace);
      y = this.settings.rows - Math.floor(localPos.y / this.env.blockSpace) - 1;
    }
    return this.data[x][y];
  }

  private _sets: BlockSet[] = [];
  findSetForBlock(block: Block): BlockSet | undefined {
    const existing = this._sets.find((set) => set.hasBlock(block));
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
      this._sets.push(set);
      return set;
    }
    return undefined;
  }

  getBlockSets(blocks?: Block[]): List<BlockSet> {
    const sets = (blocks || this.data.flat()).reduce<List<BlockSet>>(
      (acc, block) => {
        const ch = this.findSetForBlock(block);
        if (ch && !acc.includes(ch)) {
          acc.push(ch);
        }
        return acc;
      },
      toList(),
    );
    this._sets = [];
    return sets;
  }

  private nextRandomColorForBlock(bl: Block) {
    // console.log("nextRandomColorForBlock", bl.id);
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
    // console.log("sets", ...sets.flatMap((c) => c.toLog()));

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
      changed = this._unchainByRecoloringBlocks(blocksToCheck);
      // console.log("unchainByRecoloringBlocks", changed);
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

  getLocalPosition(pos: Position): Vector2 {
    return this.board.getLocalTransformMatrix().applyInverse(pos.x, pos.y);
  }

  select(block: Block): void {
    this.controller.selected?.setSelected(false);
    this.controller.matchable.forEach((b) => b.setMatchable(false));
    block.setSelected(true);
    this.controller.selected = block;
    this.controller.matchable = this.getAllSwappableWith(block);
    this.controller.matchable.forEach((b) => b.setMatchable(true));
    this.connectionLine.setSelected(block);
    // console.log("selected", block.toLog());
  }

  deselect(): void {
    this.controller.selected?.setSelected(false);
    this.controller.matchable.forEach((b) => b?.setMatchable(false));
    this.controller.matchable = [];
    this.controller.selected = undefined;
    this.connectionLine.turnOff();
  }

  async handleMatch(match: MatchInfo) {
    if (match.kind === "none") {
      return;
    }
    this.controller.interactionDisabled = true;
    await new GameFlow(this.scene).doReactions(match);
    this.deselect();
    await this.scene.saveGame(this.toJSON());
    this.controller.interactionDisabled = false;
  }

  handleEventDown(event: Pointer) {
    if (this.controller.interactionDisabled) {
      return;
    }
    event.event.stopPropagation();
    const block = this.getBlockAt(event);
    if (block) {
      if (!this.controller.selected) {
        this.select(block);
      } else if (block === this.controller.selected) {
        this.deselect();
      }
    }
  }

  handleEventUp(event: Pointer) {
    if (this.controller.interactionDisabled) {
      return;
    }
    event.event.stopPropagation();
    const block = this.getBlockAt(event);
    if (!block) {
      this.connectionLine.turnOff();
      return;
    }
    if (this.controller.selected) {
      const match = this.getMatchInfo(block);
      this.handleMatch(match).catch(cons.i.error("handleEventUp"));
    }
    if (this.controller.selected?.id !== block.id) {
      this.deselect();
    }
  }

  handleEventMove(event: Pointer) {
    if (this.controller.interactionDisabled) {
      return;
    }
    event.event.stopPropagation();
    const block = this.getBlockAt(event);

    if (this.controller.selected) {
      if (
        block?.isMatchable &&
        block.id !== this.controller.selected.id &&
        block.id != this.connectionLine.second?.id
      ) {
        this.connectionLine.updateEnd(block, "strong");
      } else {
        const localPos = this.getLocalPosition(event);
        this.connectionLine.updateEnd(localPos, "weak");
      }
    }
  }

  toLog() {
    return this.data.flatMap((row) => [...row.map((b) => b.toLog()), "\n"]);
  }

  private initHeader() {
    this.header = new GameHeader(this);

    // this._header.setInteractive(
    //   new Phaser.Geom.Rectangle(
    //     this._header.width / 2,
    //     this._header.height / 2,
    //     this._header.width,
    //     this._header.height,
    //   ),
    //   Phaser.Geom.Rectangle.Contains,
    // );
    //
    // this._header.on("pointerdown", this.handleEventDown.bind(this));
    // this._header.on("pointermove", this.handleEventMove.bind(this));
    // this._header.on("pointerup", this.handleEventUp.bind(this));
  }

  private initBoard() {
    this.board = this.scene.add
      .container(this.env.offsetX, this.env.offsetY)
      .setSize(this.env.width, this.env.height);

    this.board.setInteractive(
      new Phaser.Geom.Rectangle(
        this.board.width / 2,
        this.board.height / 2,
        this.board.width,
        this.board.height,
      ),
      Phaser.Geom.Rectangle.Contains,
    );

    this.board.on("pointerdown", this.handleEventDown.bind(this));
    this.board.on("pointermove", this.handleEventMove.bind(this));
    this.board.on("pointerup", this.handleEventUp.bind(this));
  }
}
