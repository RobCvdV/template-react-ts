import { BlockSet } from "@domains";
import { Scene } from "phaser";
import { waitMs } from "@core";

export async function collectBlocks(scene: Scene, blockSet: BlockSet) {
  const blocks = blockSet.allBlocks;
  const centerX =
    blocks.reduce((sum, block) => sum + block.x, 0) / blocks.length;
  const centerY =
    blocks.reduce((sum, block) => sum + block.y, 0) / blocks.length;

  blocks.forEach((block) => {
    scene.tweens.add({
      targets: block,
      x: centerX,
      y: centerY,
      ease: "Power2",
      alpha: 0.3,
      scale: 0.5,
      duration: 300,
      onComplete: () => {
        scene.tweens.add({
          targets: block,
          alpha: 0,
          scale: 0,
          ease: "Power2",
          duration: 100,
          onComplete: () => {
            block.destroy();
          },
        });
      },
    });
  });
  return waitMs(300);
}
