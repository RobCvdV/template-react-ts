import Phaser from "phaser";
import Sprite = Phaser.GameObjects.Sprite;
import Shape = Phaser.GameObjects.Shape;

export function moveTo(
  scene: Phaser.Scene,
  obj: Sprite | Shape,
  x: number,
  y: number,
  duration = 200,
  onComplete?: () => void,
): Phaser.Tweens.Tween {
  return scene.tweens.add({
    targets: obj,
    x,
    y,
    duration,
    ease: "Power2",
    onComplete,
  });
}
