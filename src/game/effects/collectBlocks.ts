import { BlockSet } from "@domains";
import { waitMs } from "@core";
import { ZwapGame } from "@game";
import { makeScoreBubble } from "@/game/effects/ScoreBuble.ts";

export async function collectBlocks(scene: ZwapGame, blockSet: BlockSet) {
  const blocks = blockSet.allBlocks;
  const score = blockSet.score;
  const { x, y } = blockSet.center;
  const pitch = Math.log(12 - blocks.length) / Math.log(2) - 1;
  scene.sound.play("woosh", {
    rate: Phaser.Math.FloatBetween(pitch, pitch + 0.2),
  });

  const { color } = blocks[0];
  const scoreColor = color.clone().brighten(50);

  // blocks.forEach((block) => {
  scene.tweens.add({
    targets: blocks,
    x,
    y,
    ease: "Power2",
    alpha: 0.3,
    scale: 0.5,
    duration: 300,
    onComplete: () => {
      scene.tweens.add({
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
      makeScoreBubble(scene, x, y, scoreColor, score);
      // const pe = scene.add.particles(
      //   centerX,
      //   centerY,
    },
    // });
  });
  return waitMs(250);
}
