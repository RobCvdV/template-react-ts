import {
  collectBlocks,
  makeScoreBubble,
  MatchInfo,
  swapBlocks,
  ZwapGame,
} from "@game";

export class GameFlow {
  constructor(public scene: ZwapGame) {}

  get board() {
    return this.scene.board;
  }

  get header() {
    return this.board.header;
  }

  get progress() {
    return this.scene.progress;
  }

  async doReactions(match: MatchInfo) {
    const { selected, second } = match.selection;

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
        this.progress.addTurn(match);
        await swapBlocks(this.scene, selected, second);
        this.board.swap(selected, second);
        await this.doChainReactions();
        console.log("swap and chain reactions done");
        break;
      case "unlock":
        console.log("unlock", match.selection);
        break;
    }
  }

  async doChainReactions() {
    let hasSets = true;
    do {
      hasSets = await this.doReaction();
      console.log("doChainReactions", hasSets);
    } while (hasSets);
  }

  async doReaction(): Promise<boolean> {
    const sets = this.board.getBlockSets();
    console.log("collectSets", ...sets.flatMap((s) => s.toLog()));
    if (sets.length === 0) {
      return false;
    }
    const reaction = this.progress.addChainReaction(sets);
    await sets.mapAsync(async (st) => {
      const keys = st.allBlocks.map((b) => b.id);
      this.board.removeBlocks(keys);
      return collectBlocks(this.scene, st);
    });
    if (reaction.scores.combo) {
      const { x, y } = reaction.center;
      makeScoreBubble(this.scene, x, y, `COMBO\n${reaction.scores.combo}`, {
        col: Phaser.Display.Color.HexStringToColor("#ff0"),
        baseRate: Phaser.Math.FloatBetween(0.6, 0.75),
        sound: "combo",
      });
    }
    this.header.updateScore(this.progress.score);
    this.header.updateLevelProgress(this.progress.levelProgress);
    console.log("after collectBlocks");
    this.board.addBlocksToFillOnTop();
    console.log("after addBlocksToFillOnTop");
    await this.board.letBlocksFall();
    console.log("after letBlocksFall", ...this.board.toLog());
    return true;
  }
}
