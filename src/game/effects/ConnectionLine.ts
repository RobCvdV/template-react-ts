import { Block } from "@domains";
import { BlendModes, Scene } from "phaser";

export const makeConnectionLine = (scene: Scene, bl1: Block, bl2: Block) => {
  const line = new Phaser.Geom.Line(bl1.x, bl1.y, bl2.x, bl2.y);
  const length = Phaser.Math.Distance.Between(bl1.x, bl1.y, bl2.x, bl2.y);
  return scene.add
    .particles(0, 0, "blue-light", {
      blendMode: BlendModes.ADD,
      alpha: { start: 0.5, end: 0, ease: Phaser.Math.Easing.Sine.In },
      lifespan: 200,
      scale: {
        start: 0.2,
        end: 0.5,
        ease: Phaser.Math.Easing.Sine.In,
      },
      speedX: [-10, 10],
      speedY: [-10, 10],
      quantity: length / 25,
      emitZone: {
        type: "random",
        source: line,
        quantity: 1,
      },
    })
    .setDepth(5)
    .setBlendMode(Phaser.BlendModes.ADD);
};
