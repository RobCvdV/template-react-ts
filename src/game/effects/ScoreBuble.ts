import { SoundAsset, ZwapGame } from "@game";
import { isString } from "@core";
import Color = Phaser.Display.Color;

type ScoreBubbleOptions = {
  col?: Color;
  baseRate?: number;
  sound?: SoundAsset;
  callback?: () => void;
};

export function makeScoreBubble(
  scene: ZwapGame,
  x: number,
  y: number,
  score: number | string,
  {
    col = scene.theme.ui.text,
    baseRate = 1,
    sound = "tjing",
    callback,
  }: ScoreBubbleOptions = {},
) {
  const { offsetY, blockSize, centerX } = scene.settings.environment;
  const pan = (x - centerX) / centerX;
  const rgba = col.rgba;
  const text = `${score}`;
  const rate = isString(score) ? baseRate : baseRate + score / 40;
  const scoreBubble = scene.add
    .text(x, y, `${text}`, {
      fontSize: blockSize * 0.7 + "px",
      color: "black",
      padding: { x: 10, y: 5 },
      stroke: col.rgba,
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
  scene.board.board.add(scoreBubble);
  scene.sound.play(sound, { rate, pan });
  scene.tweens.add({
    targets: scoreBubble,
    alpha: 0.7,
    y: -offsetY / 2,
    x: centerX / 3,
    scale: 0.5,
    ease: Phaser.Math.Easing.Sine.In,
    duration: 600,
    onComplete: () => {
      scoreBubble.destroy();
      callback?.();
    },
  });
  return scoreBubble;
}
