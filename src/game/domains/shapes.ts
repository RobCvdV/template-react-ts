export const shapes = [
  ["circle", "shapes/circle.svg"],
  ["square", "shapes/square.svg"],
  ["triangle", "shapes/triangle.svg"],
  ["star", "shapes/star.svg"],
  ["plus", "shapes/plus.svg"],
  ["xmark", "shapes/x-mark.svg"],
  ["heart", "shapes/heart.svg"],
  ["wave", "shapes/wave.svg"],
  ["lock", "shapes/lock.svg"],
  ["key", "shapes/key.svg"],
  ["keyWireless", "shapes/key-wireless.svg"],
  ["bomb", "shapes/bomb.svg"],
] as const;
export const blocks = [
  ["circle-block", "shapes/circle-block.svg"],
  ["square-block", "shapes/square-block.svg"],
  ["triangle-block", "shapes/triangle-block.svg"],
  ["star-block", "shapes/star-block.svg"],
  ["plus-block", "shapes/plus-block.svg"],
  ["xmark-block", "shapes/x-mark-block.svg"],
  ["heart-block", "shapes/heart-block.svg"],
  ["wave-block", "shapes/wave-block.svg"],
  ["lock-block", "shapes/lock-block.svg"],
  ["key-block", "shapes/key-block.svg"],
  ["keyWireless-block", "shapes/key-wireless-block.svg"],
  ["bomb-block", "shapes/bomb.svg"],
] as const;

export type ShapeAsset = (typeof shapes)[number][0];
export type BlockAsset = (typeof blocks)[number][0];

export const shapeKeys = shapes.map(([key]) => key) as ShapeAsset[];
export const blockKeys = blocks.map(([key]) => key) as BlockAsset[];

export const shapeAssets = Object.fromEntries(shapes);
export const blockAssets = Object.fromEntries(blocks);
