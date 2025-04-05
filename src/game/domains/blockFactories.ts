import {
  Block,
  BlockData,
  BlockType,
  Bomb,
  GameSettings,
  ZwapGame,
} from "@/game";
import { getUuid, Id } from "@core";
import Container = Phaser.GameObjects.Container;

export function makeBlock(
  scene: ZwapGame,
  state: BlockData,
  container: Container,
): Block {
  let bl: Block;
  switch (state.type as Id) {
    case BlockType.Bomb.id:
      bl = new Bomb(scene, state);
      break;
    default:
      bl = new Block(scene, state);
  }
  container.add(bl);
  return bl;
}

export function randomBlockData(
  settings: GameSettings,
  col: number,
  row: number,
): BlockData {
  const x = col * settings.blockSpace + settings.blockSpace / 2;
  const y = row * settings.blockSpace + settings.blockSpace / 2;
  const { maxColors, maxBlockTypes } = settings;
  return {
    id: getUuid(),
    color: Math.floor(Math.random() * maxColors),
    type: Math.floor(Math.random() * maxBlockTypes),
    x,
    y,
    size: { width: settings.blockSize, height: settings.blockSize },
    settings,
  };
}

export function makeRandomBlock(
  scene: ZwapGame,
  settings: GameSettings,
  col: number,
  row: number,
  container: Container,
): Block {
  return makeBlock(scene, randomBlockData(settings, col, row), container);
}
