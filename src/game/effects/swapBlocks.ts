import { Block } from "@domains";
import { Scene } from "phaser";

export function swapBlocks(scene: Scene, selected: Block, second: Block) {
  const selectedX = selected.x;
  const selectedY = selected.y;
  const secondX = second.x;
  const secondY = second.y;
  selected.parentContainer.moveTo(
    selected,
    selected.parentContainer.length - 1,
  );
  second.parentContainer.moveTo(second, second.parentContainer.length - 1);

  // Calculate control points for the curve
  const controlX = (selectedX + secondX) / 2;
  const controlY = (selectedY + secondY) / 2;

  const xBias = Math.abs(selectedX - secondX) / 3;
  const yBias = Math.abs(selectedY - secondY) / 3;

  // Create a quadratic bezier curve
  const curve1 = new Phaser.Curves.QuadraticBezier(
    new Phaser.Math.Vector2(selectedX, selectedY),
    new Phaser.Math.Vector2(controlX - yBias, controlY - xBias),
    new Phaser.Math.Vector2(secondX, secondY),
  );
  const curve2 = new Phaser.Curves.QuadraticBezier(
    new Phaser.Math.Vector2(secondX, secondY),
    new Phaser.Math.Vector2(controlX + yBias, controlY + xBias),
    new Phaser.Math.Vector2(selectedX, selectedY),
  );

  // Create tweens for both blocks
  scene.tweens.add({
    targets: selected,
    x: { getEnd: () => secondX },
    y: { getEnd: () => secondY },
    ease: Phaser.Math.Easing.Quadratic.InOut,
    duration: 400,
    onUpdate: (tween, target) => {
      const t = tween.progress;
      const point = curve1.getPoint(t);
      target.x = point.x;
      target.y = point.y;
    },
    onComplete: () => {
      selected.x = secondX;
      selected.y = secondY;
    },
  });

  scene.tweens.add({
    targets: second,
    x: { getEnd: () => selectedX },
    y: { getEnd: () => selectedY },
    ease: Phaser.Math.Easing.Quadratic.InOut,
    duration: 400,
    onUpdate: (tween, target) => {
      const t = tween.progress;
      const point = curve2.getPoint(t);
      target.x = point.x;
      target.y = point.y;
    },
    onComplete: () => {
      second.x = selectedX;
      second.y = selectedY;
    },
  });
}
