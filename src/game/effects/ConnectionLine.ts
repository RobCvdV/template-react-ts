import { Block, PuzzleBoard } from "@game";
import { BlendModes, GameObjects } from "phaser";
import { Position } from "@core";

type ConnectionMode = "weak" | "strong" | "none" | "active";

const quantityFactor = {
  none: 0,
  weak: 0.01,
  strong: 0.03,
  active: 0.05,
};

export class ConnectionLine extends GameObjects.GameObject {
  dragLine: Phaser.GameObjects.Particles.ParticleEmitter;
  selected?: Block;
  second?: Block;
  end?: Position;
  zones: (
    | Phaser.GameObjects.Particles.Zones.RandomZone
    | Phaser.GameObjects.Particles.Zones.EdgeZone
  )[] = [];

  constructor(public pb: PuzzleBoard) {
    super(pb.scene, "ConnectionLine");
    this.dragLine = this.scene.add
      .particles(0, 0, "blue-light", {
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
      })
      .setDepth(15)
      .setBlendMode(Phaser.BlendModes.ADD);
    pb.board.add(this.dragLine);
  }

  update() {
    if (this.selected?.active && this.second?.active) {
      this.updateEnd(this.second, "active");
    }
  }

  turnOff() {
    this.dragLine.emitting = false;
    this.end = undefined;
    this.selected = undefined;
    this.zones.forEach((zone) => this.dragLine.removeEmitZone(zone));
    this.zones = [];
  }

  setSelected(selected: Block) {
    this.selected = selected;
  }

  updateEnd(pos: Position | Block, mode: ConnectionMode = "weak") {
    if (!this.selected || mode === "none") {
      this.dragLine.emitting = false;
      this.end = undefined;
      return;
    }
    if (!this.end) {
      this.dragLine.emitting = true;
    }
    this.pb.board.bringToTop(this.dragLine);
    this.end = pos;
    const line = new Phaser.Geom.Line(
      this.selected.x,
      this.selected.y,
      pos.x,
      pos.y,
    );
    const length = Phaser.Math.Distance.Between(
      line.x1,
      line.y1,
      line.x2,
      line.y2,
    );
    this.dragLine.setQuantity(Math.floor(length * quantityFactor[mode]));
    this.zones.forEach((zone) => this.dragLine.removeEmitZone(zone));
    this.zones = this.dragLine.addEmitZone({
      type: "random",
      source: new Phaser.Geom.Line(
        this.selected.x,
        this.selected.y,
        pos.x,
        pos.y,
      ),
      quantity: 1,
    });
  }
}
