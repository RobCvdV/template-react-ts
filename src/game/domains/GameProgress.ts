// class PlannedBlock extends Struct {
//   public blockType = this.state.blockType as string;
//   public move = this.state.move as number;
//   public position? = this.state.position as Position;
// }

import { DateTime, ensureArray, Struct } from "@core";
import { Turn } from "@domains";

// type GameProgressState = {
//   started?: boolean;
//   startMoment?: DateTime;
//   lastPlayedMoment?: DateTime;
//   paused?: boolean;
//   gameOver?: boolean;
//   score?: number;
//   level?: number;
//   levelProgress?: number;
//   turns?: Turn[];
//   movesWithoutReaction?: number;
//   // plannedBlocks?: PlannedBlock[];
//   statistics?: Record<string, number>;
// };
// const defaultGameProgressState: GameProgressState = {
//   started: false,
//   startMoment: DateTime.now,
//   lastPlayedMoment: DateTime.now,
//   paused: true,
//   gameOver: false,
//   score: 0,
//   level: 1,
//   levelProgress: 0,
//   turns: [],
//   movesWithoutReaction: 0,
//   // plannedBlocks: [],
//   statistics: {},
// };

export class GameProgress extends Struct {
  public started = (this.state.started as boolean) || false;
  public startMoment = new Date(this.state.startMoment || DateTime.now);
  public lastPlayedMoment = new DateTime(
    this.state.lastPlayedMoment || DateTime.now,
  );
  public paused = (this.state.paused as boolean) || true;
  public gameOver = (this.state.gameOver as boolean) || false;
  public score = (this.state.score as number) || 0;
  public level = (this.state.level as number) || 1;
  public levelProgress = (this.state.levelProgress as number) || 0;

  readonly turns = ensureArray(Turn, this.state.turns);
  public movesWithoutReaction =
    (this.state.movesWithoutReaction as number) || 0;

  // public plannedBlocks = ensureArray(PlannedBlock, this.state.plannedBlocks);
  public statistics: Record<string, number> = this.state.statistics || {};

  get isRunning(): boolean {
    return this.started && !this.paused && !this.gameOver;
  }

  get isPaused(): boolean {
    return this.started && this.paused && !this.gameOver;
  }

  get isOver(): boolean {
    return this.started && this.gameOver;
  }

  // getBlocksPlannedForMove(move: number): PlannedBlock[] {
  //   return this.plannedBlocks.filter(b => b.move === move);
  // }
  //
  // getBlocksPlannedNow(): PlannedBlock[] {
  //   return this.getBlocksPlannedForMove(this.moves);
  // }
}
