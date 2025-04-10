import { getUuid, logColors, waitMs } from "@core";
import {
  BlockBorder,
  BlockColor,
  BlockType,
  EnvironmentSettings,
  GameObjectStruct,
  GameSettings,
  GameTheme,
  randomDropSound,
  SpriteData,
  ZwapGame,
} from "@game";
import * as Phaser from "phaser";
import Color = Phaser.Display.Color;

export type BlockData = Omit<SpriteData, "size" | "texture"> & {
  color: number;
  type: number;

  isSelected?: boolean;
  isMatchable?: boolean;
  isMatched?: boolean;
};

// the BLockSprite class is a GameObject that represents a block in the game
export class Block<T extends BlockData = BlockData> extends GameObjectStruct<
  T,
  ZwapGame
> {
  public bType: BlockType;
  public color: Color;
  public bColor: BlockColor;
  declare public scene: ZwapGame;
  protected border: BlockBorder | undefined;

  constructor(scene: ZwapGame, block: T) {
    const typeNr = block.type ?? 0;
    const { blockSize } = scene.settings.environment;
    const texture = scene.settings.theme.shapes[typeNr].blockAsset;
    super(scene, {
      ...block,
      texture,
      size: { width: blockSize, height: blockSize },
    });
    this.setDataEnabled();
    this.setData(block);
    this.addToUpdateList();
    this.name = block.id ?? getUuid();
    this.type = this.constructor.name;
    this.bType = this.theme.shapes[typeNr];
    this.changeColor(block.color);
    this.setDepth(1);

    if (block.isSelected) {
      this.setSelected(true);
    }
  }

  toJSON(): T {
    return this.data.getAll() as T;
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (this.border) {
      this.border.setPosition(this.x, this.y);
    }
  }

  changeColor(colorNr: number): this {
    const { colors } = this.theme;
    this.color = Color.RGBStringToColor(colors[colorNr]);
    this.bColor = BlockColor.byId<BlockColor>(colorNr);
    this.setTint(this.color.color);
    this.set("color", colorNr);
    return this;
  }

  get colorIndex(): number {
    return this.get("color");
  }

  get settings(): GameSettings {
    return this.scene.settings.game;
  }
  get env(): EnvironmentSettings {
    return this.scene.settings.environment;
  }

  get theme(): GameTheme {
    return this.scene.settings.theme;
  }

  changeType(typeNr: number): this {
    this.setTexture(this.theme.shapes[typeNr].blockAsset);
    this.set("type", typeNr);
    return this;
  }

  get id(): string {
    return this.get("id");
  }

  hasSameColorAs(other: Block): boolean {
    return this.get("color") === other.get("color");
  }

  hasSameTypeAs(other: Block): boolean {
    return this.get("type") === other.get("type");
  }

  // get selected(): boolean {
  //   return !!this.get("isSelected");
  // }
  // set selected(selected: boolean) {
  //   this.setSelected(selected);
  // }

  toString(): string {
    return `${logColors.encircled}${logColors.bold}${this.bColor.fg} ${this.bType.code} ${logColors.reset}`;
  }

  toLog(): { text: string; style: string } {
    return {
      text: `${this.bType.code}`,
      style: `background-color: ${this.color.rgba}; color: #333; border-radius: 3px; padding: 0px 4px; font-size: 16px; margin: 2px;`,
    };
  }

  setSelected(selected: boolean): this {
    this.set("isSelected", selected);
    if (selected) {
      this.border = new BlockBorder(this.scene.board, this).blink();
    } else {
      this.border?.destroy();
    }
    return this;
  }

  destroy(): this {
    this.scene?.tweens.killTweensOf(this);
    this.border?.destroy();
    super.destroy();
    return this;
  }

  get isMatchable(): boolean {
    return !!this.get("isMatchable");
  }

  setMatchable(matchable: boolean): this {
    this.set("isMatchable", matchable);
    if (matchable) {
      this.border = new BlockBorder(this.scene.board, this);
    } else {
      this.border?.destroy();
    }
    return this;
  }

  async fallToRow(row: number) {
    const { halfSpace, blockSpace, centerX } = this.env;
    const { rows } = this.settings;
    const reverseY = rows - row - 1;
    const newY = reverseY * blockSpace + halfSpace;
    const distance = Math.abs(this.y - newY);
    if (distance < 1) {
      return;
    }
    const duration = Math.log(distance * 3 + 1) * 50 + Math.random() * 70;
    this.scene.tweens.add({
      targets: this,
      y: newY,
      duration,
      ease: Phaser.Math.Easing.Sine.In,
      delay: duration * 0.2,
      onComplete: () => {
        this.y = newY;
        this.scene.sound.play(randomDropSound(), {
          rate: Phaser.Math.FloatBetween(0.9, 1.3),
          pan: (this.x - centerX) / centerX,
        });
      },
    });
    return waitMs(duration);
  }
}
