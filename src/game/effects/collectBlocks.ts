import { BlockSet } from "@domains";
import { waitMs } from "@core";
import { ZwapGame } from "@game";

export async function collectBlocks(scene: ZwapGame, blockSet: BlockSet) {
  const blocks = blockSet.allBlocks;
  const score = blockSet.score;
  const centerX =
    blocks.reduce((sum, block) => sum + block.x, 0) / blocks.length;
  const centerY =
    blocks.reduce((sum, block) => sum + block.y, 0) / blocks.length;

  const pitch = Math.log(12 - blocks.length) / Math.log(2) - 1;
  scene.sound.play("woosh", {
    rate: Phaser.Math.FloatBetween(pitch, pitch + 0.2),
  });

  const { color, width } = blocks[0];

  const rgba = color.clone().brighten(50).rgba;

  // blocks.forEach((block) => {
  scene.tweens.add({
    targets: blocks,
    x: centerX,
    y: centerY,
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
      const scoreBubble = scene.add
        .text(centerX, centerY, `${score}`, {
          fontSize: width * 0.5 + "px",
          color: "black",
          padding: { x: 10, y: 5 },
          stroke: rgba,
          strokeThickness: 10,
          shadow: {
            color: rgba,
            blur: 20,
            fill: true,
            stroke: true,
            offsetX: 0,
            offsetY: 0,
          },
          align: "center",
        })
        .setOrigin(0.5, 0.5);
      blocks[0].parentContainer?.add(scoreBubble);
      scene.sound.play("tjing", {
        rate: 1 + score / 100,
      });
      scene.tweens.add({
        targets: scoreBubble,
        alpha: 0.7,
        y: -30,
        x: scene.settings.environment.screenWidth / 2,
        scale: 1,
        ease: Phaser.Math.Easing.Sine.In,
        duration: 1000,
        onComplete: () => {
          scoreBubble.destroy();
        },
      });
      // const pe = scene.add.particles(
      //   centerX,
      //   centerY,
    },
    // });
  });
  return waitMs(250);
}
