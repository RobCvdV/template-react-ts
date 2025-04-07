// class PlannedBlock extends Struct {
//   public blockType = this.state.blockType as string;
//   public move = this.state.move as number;
//   public position? = this.state.position as Position;
// }

import { DateTime, ensureArray, Struct } from "@core";
import { GameSettings, MatchInfo, Turn } from "@domains";

export type GameProgressState = {
  started?: boolean;
  startMoment?: DateTime;
  lastPlayedMoment?: DateTime;
  gameOver?: boolean;
  score?: number;
  level?: number;
  levelProgress?: number;
  turns?: Turn[];
  movesWithoutReaction?: number;
  // plannedBlocks?: PlannedBlock[];
  statistics?: Record<string, number>;
};

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

export class GameProgress extends Struct<GameProgressState> {
  public started = (this.state.started as boolean) || false;
  public startMoment = DateTime.orNow(this.state.startMoment);
  public lastPlayedMoment = DateTime.orNow(this.state.lastPlayedMoment);
  public gameOver = (this.state.gameOver as boolean) || false;
  public score = (this.state.score as number) || 0;
  public level = (this.state.level as number) || 1;
  public levelProgress = (this.state.levelProgress as number) || 0;
  public _turns = ensureArray(Turn, this.state.turns);

  public _settings: GameSettings;

  public movesWithoutReaction =
    (this.state.movesWithoutReaction as number) || 0;

  // public plannedBlocks = ensureArray(PlannedBlock, this.state.plannedBlocks);
  public statistics: Record<string, number> = this.state.statistics || {};

  get isOver(): boolean {
    return this.started && this.gameOver;
  }

  addTurn(match: MatchInfo): Turn {
    const turn = Turn.fromMatch(match);
    this._turns.push(turn);
    return turn;
  }

  get turn(): Turn {
    return this._turns[this._turns.length - 1];
  }

  // getBlocksPlannedForMove(move: number): PlannedBlock[] {
  //   return this.plannedBlocks.filter(b => b.move === move);
  // }
  //
  // getBlocksPlannedNow(): PlannedBlock[] {
  //   return this.getBlocksPlannedForMove(this.moves);
  // }
}
