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
  col?: number,
  row?: number,
): Block {
  const {
    settings: {
      game: { blockSpace, halfSpace },
    },
  } = scene;
  const x = col !== undefined ? halfSpace + col * blockSpace : state.x;
  const y = row !== undefined ? halfSpace + row * blockSpace : state.y;
  let bl: Block;
  switch (state.type as Id) {
    case BlockType.Bomb.id:
      bl = new Bomb(scene, { ...state, x, y });
      break;
    default:
      bl = new Block(scene, { ...state, x, y });
  }
  container.add(bl as any);
  return bl;
}

export function randomBlockData(settings: GameSettings): BlockData {
  const { maxColors, maxBlockTypes } = settings;
  return {
    id: getUuid(),
    color: Math.floor(Math.random() * maxColors),
    type: Math.floor(Math.random() * maxBlockTypes),
    x: 0,
    y: 0,
    size: { width: settings.blockSize, height: settings.blockSize },
  };
}

export function makeRandomBlock(
  scene: ZwapGame,
  col: number,
  row: number,
  container: Container,
): Block {
  return makeBlock(
    scene,
    randomBlockData(scene.settings.game),
    container,
    col,
    row,
  );
}
