import { AnyObject, assertDefined, ensureArray, Struct } from "@core";
import { Block, BlockSet, MatchInfo } from "@domains";

export class ChainReaction extends Struct {
  // readonly type: ReactionType
  readonly sets = ensureArray(BlockSet, this.state.sets);
  readonly addedBlocks = ensureArray(Block, this.state.addedBlocks);
  public reactionNr = this.state.reactionNr ?? (0 as number);
  readonly scores: AnyObject<number> = this.state.scores ?? {};
}

export class Turn extends Struct {
  public isDone = false;
  public match: MatchInfo = this.state.match as MatchInfo;
  public chainReactions: ChainReaction[] = ensureArray(
    ChainReaction,
    this.state.chainReactions,
  );

  static fromMatch(match: MatchInfo): Turn {
    return new Turn({
      match,
      chainReactions: [],
    });
  }

  setDone(): Turn {
    this.isDone = true;
    return this;
  }

  addChainReaction(sets: BlockSet[]): ChainReaction {
    const reaction = new ChainReaction({
      sets,
      addedBlocks: sets.flatMap((set) => set.allBlocks),
    });
    reaction.reactionNr = this.chainReactions.push(reaction) - 1;
    return reaction;
  }

  get currentChainReaction(): ChainReaction {
    assertDefined(
      this.chainReactions.length,
      "chainReactions@currentChainReaction",
    );
    return this.chainReactions[this.chainReactions.length - 1];
  }

  addedBlocksAfterChainReaction(newBlocks: Block[]): Turn {
    this.currentChainReaction.addedBlocks.push(...newBlocks);
    return this;
  }
}
