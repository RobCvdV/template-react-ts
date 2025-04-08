import { DateTime, ensureArray, Struct } from "@core";
import {
  BlockSet,
  ChainReaction,
  GameSettings,
  MatchInfo,
  ScoringValues,
  Turn,
} from "@domains";

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

  public _getSettings: () => GameSettings;
  public get _settings(): GameSettings {
    return this._getSettings();
  }

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

  addChainReaction(sets: BlockSet[]): ChainReaction {
    const reaction = this.turn.addChainReaction(sets);
    const { scoringValues } = this._settings;
    reaction.sets.forEach((set) => {
      set.score = set.blocks.reduce((sum, block) => {
        const val =
          scoringValues[block.bType.name as keyof ScoringValues] ??
          scoringValues.normal;
        return sum + val;
      }, 0);
      if (set.isPureType) {
        set.score *= scoringValues.pureSetMultiplier;
        if (set.containsKey) {
          console.log("PURE UNLOCK", set);
        }
        if (set.bombs.length) {
          console.log("PURE BOMB", set);
        }
      }
      if (set.bombs.length >= 2) {
        set.score *= scoringValues.bombMultiplier * set.bombs.length;
      }
      if (set.containsKey) {
        console.log("UNLOCK SOMETHING", set);
      }
    });
    reaction.sets.forEach(
      (set) => (set.score *= scoringValues.comboMultiplier),
    );
    if (reaction.sets.length > 1) {
      reaction.scores.combo = scoringValues.combo * (reaction.sets.length - 1);
    }

    return reaction;
  }

  // getBlocksPlannedForMove(move: number): PlannedBlock[] {
  //   return this.plannedBlocks.filter(b => b.move === move);
  // }
  //
  // getBlocksPlannedNow(): PlannedBlock[] {
  //   return this.getBlocksPlannedForMove(this.moves);
  // }
}
