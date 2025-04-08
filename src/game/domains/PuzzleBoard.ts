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
  toList,
} from "@core";
import {
  Block,
  BlockData,
  BlockSet,
  GameProgress,
  GameProgressState,
  GameSettings,
  GameSettingsState,
  makeBlock,
  makeRandomBlock,
  MatchInfo,
  Selection,
} from "@domains";
import { ZwapGame } from "@/game";
import { GameFlow } from "@/game/domains/GameFlow.ts";
import { makeConnectionLine } from "@/game/effects/ConnectionLine.ts";
import { swapBlocks } from "@/game/effects/swapBlocks.ts";
import { collectBlocks } from "@/game/effects/collectBlocks.ts";
import { EnvironmentSettings } from "@/game/domains/EnvironmentSettings.ts";
import { makeScoreBubble } from "@/game/effects/ScoreBuble.ts";
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
  readonly _container: Container;
  readonly _gameFlow = new GameFlow();
  readonly _scene: ZwapGame;

  // data is a 2D array of Blocks, representing the board
  // data[0][0] is the bottom-left block
  // data[x][y] is the block at column x and row y
  // data[width - 1][height - 1] is the top-right block
  // the first index is the column, the second index is the row
  public data: Block<BlockData>[][];

  toJSON(): PuzzleBoardState {
    return pick(super.toJSON(), "id", "progress", "settings", "data");
  }

  constructor(
    scene: ZwapGame,
    readonly state: PuzzleBoardState,
  ) {
    super(state);
    this._gameFlow.interactionDisabled = true;
    this._scene = scene;
    console.log(
      "PuzzleBoard",
      this.env.width,
      this.env.height,
      this.env.offsetY,
      this.env.blockSpace,
    );
    this._container = this._scene.add
      .container(this.env.offsetX, this.env.offsetY)
      .setSize(this.env.width, this.env.height);
    this.progress._getSettings = () => this.settings;
    this.data =
      this.state.data?.map((col, c) =>
        col.map((cell, r) =>
          makeBlock(this._scene, cell, this._container, c, -5 - r * 3),
        ),
      ) ?? Array.from({ length: this.settings.columns }, () => []);

    this.initListeners();
  }

  get env(): EnvironmentSettings {
    return this._scene.settings.environment;
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

  get settings(): GameSettings {
    return this._scene.settings.game;
  }

  async startGame() {
    await this.letBlocksFall();
    this._gameFlow.interactionDisabled = false;
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
    const { selected } = this._gameFlow;
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
        makeRandomBlock(this._scene, c, -5 - r * 3, this._container),
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
    return this._container.getLocalTransformMatrix().applyInverse(pos.x, pos.y);
  }

  select(block: Block): void {
    this._gameFlow.selected?.setSelected(false);
    this._gameFlow.matchable.forEach((b) => b.setMatchable(false));
    block.setSelected(true);
    this._gameFlow.selected = block;
    this._gameFlow.matchable = this.getAllSwappableWith(block);
    this._gameFlow.matchable.forEach((b) => b.setMatchable(true));
    // console.log("selected", block.toLog());
  }

  deselect(): void {
    this._gameFlow.secondOption = undefined;
    this._gameFlow.selected?.setSelected(false);
    this._gameFlow.matchable.forEach((b) => b?.setMatchable(false));
    this._gameFlow.matchable = [];
    this._gameFlow.selected = undefined;
  }

  async doReactions(block: Block) {
    this._gameFlow.interactionDisabled = true;
    const match = this.getMatchInfo(block);
    console.log(
      "doReactions",
      match.kind,
      match.selection?.selected.toLog(),
      match.selection?.second.toLog(),
    );
    switch (match.kind) {
      case "none":
        break;
      case "swap":
        this.deselect();
        this.progress.addTurn(match);
        await swapBlocks(this._scene, match.selection.selected, block);
        this.swap(match.selection.selected, block);
        await this.doChainReactions();
        console.log("swap and chain reactions done");
        break;
      case "unlock":
        console.log("unlock", match.selection);
        break;
    }
    await this._scene.saveGame(this.toJSON());
    this._gameFlow.interactionDisabled = false;
    console.log("interactionDisabled false");
  }

  async doChainReactions() {
    let hasSets = true;
    do {
      hasSets = await this.collectSets();
      console.log("doChainReactions", hasSets);
    } while (hasSets);
  }

  async collectSets(): Promise<boolean> {
    const sets = this.getBlockSets();
    const reaction = this.progress.addChainReaction(sets);
    console.log("collectSets", ...sets.flatMap((s) => s.toLog()));
    if (sets.length === 0) {
      return false;
    }
    await sets.mapAsync(async (st) => {
      const keys = st.allBlocks.map((b) => b.id);
      this.removeBlocks(keys);
      return collectBlocks(this._scene, st);
    });
    if (reaction.scores.combo) {
      const { x, y } = reaction.center;
      makeScoreBubble(
        this._scene,
        x,
        y,
        Phaser.Display.Color.HexStringToColor("#ff0"),
        `COMBO\n${reaction.scores.combo}`,
        Phaser.Math.FloatBetween(0.7, 0.8),
        "combo",
      );
    }
    console.log("after collectBlocks");
    this.addBlocksToFillOnTop();
    console.log("after addBlocksToFillOnTop");
    await this.letBlocksFall();
    console.log("after letBlocksFall", ...this.toLog());
    return true;
  }

  handleEventDown(event: Pointer) {
    if (this._gameFlow.interactionDisabled) {
      return;
    }
    event.event.stopPropagation();
    const block = this.getBlockAt(event);
    if (block) {
      if (!this._gameFlow.selected) {
        this.select(block);
      } else if (block === this._gameFlow.selected) {
        this.deselect();
      }
    }
  }

  dragLine?: Phaser.GameObjects.Particles.ParticleEmitter;
  handleEventUp(event: Pointer) {
    if (this._gameFlow.interactionDisabled) {
      return;
    }
    event.event.stopPropagation();
    const block = this.getBlockAt(event);
    this.dragLine?.destroy();
    this.dragLine = undefined;
    if (!block) {
      return;
    }
    if (this._gameFlow.selected) {
      this.doReactions(block).catch(cons.i.error("handleEventUp"));
    }
    if (this._gameFlow.selected?.id !== block.id) {
      this.deselect();
    }
  }

  handleEventMove(event: Pointer) {
    if (this._gameFlow.interactionDisabled) {
      return;
    }
    event.event.stopPropagation();
    const block = this.getBlockAt(event);

    if (
      this._gameFlow.selected &&
      block?.isMatchable &&
      block.id !== this._gameFlow.selected.id &&
      block.id != this._gameFlow.secondOption?.id
    ) {
      this._gameFlow.secondOption = block;
      // console.log("handleEventMove", "block:", block.x, block.y);
      this.dragLine?.destroy();
      this.dragLine = undefined;
      this.dragLine = makeConnectionLine(
        this._scene,
        this._gameFlow.selected,
        block,
      );
      this._container.add(this.dragLine);
    } else if (this.dragLine && !block.isMatchable) {
      this._gameFlow.secondOption = undefined;
      this.dragLine.destroy();
      this.dragLine = undefined;
    }
  }

  toLog() {
    return this.data.flatMap((row) => [...row.map((b) => b.toLog()), "\n"]);
  }

  private initListeners() {
    this._container.setInteractive(
      new Phaser.Geom.Rectangle(
        this.env.width / 2,
        this.env.height / 2,
        this.env.width,
        this.env.height,
      ),
      Phaser.Geom.Rectangle.Contains,
    );

    this._container.on("pointerdown", this.handleEventDown.bind(this));
    this._container.on("pointerup", this.handleEventUp.bind(this));
    this._container.on("pointermove", this.handleEventMove.bind(this));
  }
}
