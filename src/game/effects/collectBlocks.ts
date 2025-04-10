import Phaser from "phaser";
import {
  asyncScoreBubble,
  BlockSet,
  centerOfBlockSets,
  ChainReaction,
  makeScoreBubble,
  PuzzleBoard,
} from "@game";
import { waitMs } from "@core";
import Color = Phaser.Display.Color;

export async function collectBlockSets(
  game: PuzzleBoard,
  reaction: ChainReaction,
  onScore?: (score: number | string) => void,
) {
  const blockSets = reaction.sets;
  const posTop = { x: 10, y: -game.env.offsetY * 0.75 };
  const posScores =
    blockSets.length > 1 ? centerOfBlockSets(blockSets) : posTop;
  const sound = blockSets.length > 1 ? "combo" : "tjing";
  const baseRate = blockSets.length > 1 ? 0.8 : 1;
  await blockSets.mapAsync((blockSet) => {
    return collectBlocks(game, blockSet, (bs) => {
      const { x, y } = bs.center;
      const score = bs.score;
      onScore?.(score);
      makeScoreBubble(game.scene, x, y, score, {
        sound,
        tweenConfig: {
          ...posScores,
          alpha: 1,
          duration: 400,
          baseRate,
        },
      });
    });
  });
  if (blockSets.length > 1) {
    await waitMs(500);
    const scoresMultiply = blockSets.map((bs) => bs.score).join(" x ");
    await asyncScoreBubble(
      game.scene,
      posScores.x,
      posScores.y,
      "COMBO\n" + scoresMultiply,
      {
        scale: 1.5,
        sound: "weesh",
        baseRate: 0.8,
        col: Color.HexStringToColor("#ff0"),
        tweenConfig: {
          ...posScores,
          alpha: 0,
          duration: 300,
        },
      },
    );
    await asyncScoreBubble(
      game.scene,
      posScores.x,
      posScores.y,
      `${reaction.scores.total}`,
      {
        scale: 1.5,
        col: Color.HexStringToColor("#ff0"),
        tweenConfig: {
          ...posTop,
          duration: 500,
        },
      },
    );
  }
}

export async function collectBlocks(
  game: PuzzleBoard,
  blockSet: BlockSet,
  onComplete?: (bs: BlockSet) => void,
) {
  const blocks = blockSet.allBlocks;
  const { x, y } = blockSet.center;
  const pitch = Math.log(12 - blocks.length) / Math.log(2) - 1;
  game.scene.sound.play("woosh", {
    rate: Phaser.Math.FloatBetween(pitch, pitch + 0.2),
  });

  game.scene.tweens.add({
    targets: blocks,
    x,
    y,
    ease: "Power2",
    alpha: 0.3,
    scale: 0.5,
    duration: 300,
    onComplete: () => {
      game.scene.tweens.add({
        targets: blocks,
        alpha: 0,
        scale: 0,
        ease: "Power2",
        duration: 100,
        onComplete: () => {
          blocks.forEach((block) => {
            block.destroy();
          });
        },
      });
      onComplete?.(blockSet);
    },
  });
  return waitMs(250);
}
