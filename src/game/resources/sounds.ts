export const sounds = [
  ["click", "click.wav"],
  ["swap", "swap-phaser.wav"],
  ["down", "swap-phaser-down.wav"],
  // ["swap", "swap-phaser-old.wav"],
  ["switch01", "switch-4.wav"],
  ["switch02", "switch-5.wav"],
  ["switch03", "switch-6.wav"],
  ["switch04", "switch-7.wav"],
  ["switch05", "switch-9.wav"],
  ["switch06", "switch-11.wav"],
  ["switch07", "switch-12.wav"],
  ["switch08", "switch-15.wav"],
  ["switch09", "switch-17.wav"],
  ["switch10", "switch-18.wav"],
  ["switch11", "switch-19.wav"],
  ["tjing", "tjing.wav"],
  ["warped", "warped-combine.wav"],
  ["explosion", "warped-up-explosion.wav"],
  ["weesh", "woosh.wav"],
  ["woosh", "woosh-low.wav"],
  ["zapped", "zapped-laser.wav"],
  ["combo", "combo.m4a"],
] as const;

export type SoundAsset = (typeof sounds)[number][0];

export const soundKeys = sounds.map(([key]) => key) as SoundAsset[];

export const soundAssets = Object.fromEntries(sounds);

const switchSounds = [
  "switch01",
  "switch02",
  "switch03",
  "switch04",
  "switch05",
  "switch06",
  "switch07",
  "switch08",
  "switch09",
  "switch10",
  "switch11",
];

export function randomDropSound(): SoundAsset {
  return Phaser.Utils.Array.GetRandom(switchSounds) as SoundAsset;
}
