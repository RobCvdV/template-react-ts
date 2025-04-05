import { assertDefined, Child, ensureArray, Struct } from "@core";
import { Block, BlockSet, MatchInfo } from "@domains";

export class ChainReaction extends Child {
  // readonly type: ReactionType
  readonly sets = ensureArray(BlockSet, this.state.sets);
  readonly addedBlocks = ensureArray(Block, this.state.addedBlocks);
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

  get matchedBlocks(): Block[] {
    const { selected, second } = this.match.selection;
    return [selected, second].filter((b) => b);
  }

  addChainReaction(reaction: ChainReaction): Turn {
    this.chainReactions.push(reaction);
    return this;
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
