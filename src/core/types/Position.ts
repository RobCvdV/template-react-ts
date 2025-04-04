export type Position = {
  x: number;
  y: number;
};

export function toPos(x: number, y: number): Position {
  return {x, y};
}

export function fromPos(pos: Position): [number, number] {
  return [pos.x, pos.y];
}
