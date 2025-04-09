import { Block, PuzzleBoard } from "@game";
import { BlendModes } from "phaser";
import { Position } from "@core";
import ParticleEmitterConfig = Phaser.Types.GameObjects.Particles.ParticleEmitterConfig;

type ConnectionMode = "weak" | "strong" | "none" | "active";
const config: ParticleEmitterConfig = {
  emitting: false,
  blendMode: BlendModes.ADD,
  alpha: { start: 0.5, end: 0, ease: Phaser.Math.Easing.Sine.In },
  lifespan: 200,
  scale: {
    start: 0.2,
    end: 0.5,
    ease: Phaser.Math.Easing.Sine.In,
  },
  speedX: [-10, 10],
  speedY: [-10, 10],
  quantity: 100,
};
const quantityFactor = {
  none: 0,
  weak: 0.01,
  strong: 0.08,
  active: 0.3,
};
const lifetime = {
  none: 0,
  weak: 200,
  strong: 200,
  active: 50,
};
const modeTint = {
  none: 0x000000,
  weak: 0xffffff,
  strong: 0x44ff44,
  active: 0xff2222,
};

export class ConnectionLine extends Phaser.GameObjects.Particles
  .ParticleEmitter {
  selected?: Block;
  second?: Block;
  end?: Position;
  mode: ConnectionMode = "none";

  constructor(public pb: PuzzleBoard) {
    super(pb.scene, 0, 0, "blue-light", {
      ...config,
      tint: () => modeTint[this.mode],
      lifespan: () => lifetime[this.mode],
    });
    this.setDepth(15).setBlendMode(Phaser.BlendModes.ADD);
    this.scene.add.existing(this);
    pb.board.add(this);
  }

  // preUpdate(time: number, delta: number) {
  //   super.preUpdate(time, delta);
  //   if (this.selected && this.second && this.mode === "active") {
  //     console.log(
  //       "YESSS PREE update connection line",
  //       this.selected.x,
  //       this.selected.y,
  //     );
  //     this.updateEnd(this.second, "active");
  //   }
  // }

  turnOff() {
    this.emitting = false;
    this.end = undefined;
    this.selected = undefined;
    this.second = undefined;
    this.emitZones.forEach((zone) => this.removeEmitZone(zone));
  }

  setSelected(selected: Block) {
    this.selected = selected;
  }

  updateEnd(posOrBlock: Position | Block, mode: ConnectionMode = "weak") {
    this.mode = mode;
    if (!this.selected || mode === "none") {
      this.emitting = false;
      this.end = undefined;
      this.second = undefined;
      return;
    }
    if (!this.end) {
      this.emitting = true;
    }
    this.pb.board.bringToTop(this);
    this.end = posOrBlock;
    this.second = posOrBlock instanceof Block ? posOrBlock : undefined;
    const line = new Phaser.Geom.Line(
      this.selected.x,
      this.selected.y,
      posOrBlock.x,
      posOrBlock.y,
    );
    const length = Phaser.Math.Distance.Between(
      line.x1,
      line.y1,
      line.x2,
      line.y2,
    );
    this.setQuantity(Math.floor(length * quantityFactor[mode]));
    this.emitZones.forEach((zone) => this.removeEmitZone(zone));
    this.addEmitZone({
      type: "random",
      source: new Phaser.Geom.Line(
        this.selected.x,
        this.selected.y,
        posOrBlock.x,
        posOrBlock.y,
      ),
      quantity: 1,
    });
  }
}
