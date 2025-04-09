import { cons, DateTime, ensureArray, List, Struct } from "@core";
import {
  BlockSet,
  ChainReaction,
  GameSettings,
  MatchInfo,
  ScoringValues,
  Turn,
} from "@game";

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

  addChainReaction(sets: List<BlockSet>): ChainReaction {
    const reaction = this.turn.addChainReaction(sets);
    const { scoringValues } = this._settings;
    reaction.sets.forEach((st) => {
      st.score = st.blocks.reduce((sum, block) => {
        const val =
          scoringValues[block.bType.name as keyof ScoringValues] ??
          scoringValues.normal;
        return sum + val;
      }, 0);
      if (st.isPureType) {
        st.score *= scoringValues.pureSetMultiplier + scoringValues.pureSet;
        if (st.containsKey) {
          console.log("PURE UNLOCK", st);
        }
        if (st.bombs.length) {
          console.log("PURE BOMB", st);
        }
      }
      if (st.bombs.length >= 2) {
        st.score *= scoringValues.bombMultiplier * st.bombs.length;
      }
      if (st.containsKey) {
        console.log("UNLOCK SOMETHING", st);
      }
    });
    reaction.sets.forEach(
      (set) => (set.score *= scoringValues.comboMultiplier),
    );
    if (reaction.sets.length > 1) {
      reaction.scores.combo = scoringValues.combo * (reaction.sets.length - 1);
    }
    reaction.scores.total = reaction.sets.reduce((sum, set) => {
      cons.log("set", set);
      return sum + set.score;
    }, reaction.scores.combo || 0);

    this.score += reaction.scores.total;
    this.levelProgress += reaction.addedBlocks.length;
    cons.log("score", this.score, reaction.scores.total);
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
