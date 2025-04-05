import { Block, BlockData } from "@/game";

export type BombData = BlockData & {
  counter?: number;
};

// @ts-ignore
export class Bomb extends Block<BombData> {
  setCounter(counter: number): this {
    this.set("counter", counter);
    return this;
  }

  decrementCounter(): this {
    const counter = this.get("counter") ?? 0;
    this.set("counter", counter - 1);
    return this;
  }

  explode(): this {
    this.set("isExploded", true);
    this.setSelected(false);
    this.effects["explosion"] = this.scene.add.particles(
      this.x,
      this.y,
      "star",
      {
        speed: { min: -100, max: 100 },
        lifespan: { min: 1000, max: 2000 },
        quantity: 20,
        scale: { start: 0.5, end: 0 },
        blendMode: "ADD",
        color: [0xffff99, 0xffaa00, 0x0000],
      },
    );
    this.destroy();
    return this;
  }
}
