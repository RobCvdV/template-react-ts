import { Block, BlockData, BlockType, Bomb, ZwapGame } from "@/game";
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
    environment: { blockSpace, halfSpace },
  } = scene.settings;
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

export function randomBlockData(scene: ZwapGame): BlockData {
  const {
    environment: env,
    game: { maxColors, maxBlockTypes },
  } = scene.settings;
  return {
    id: getUuid(),
    color: Math.floor(Math.random() * maxColors),
    type: Math.floor(Math.random() * maxBlockTypes),
    x: 0,
    y: 0,
    size: { width: env.blockSize, height: env.blockSize },
  };
}

export function makeRandomBlock(
  scene: ZwapGame,
  col: number,
  row: number,
  container: Container,
): Block {
  return makeBlock(scene, randomBlockData(scene), container, col, row);
}
