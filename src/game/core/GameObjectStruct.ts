import * as Phaser from "phaser";
import { GameObjects } from "phaser";
import { assertDefined, getUuid, Size, toJson } from "@core";
import JSONGameObject = Phaser.Types.GameObjects.JSONGameObject;

/**
 * @typedef {Object} SpriteData
 * @property {number} [x] - The x-coordinate of the sprite.
 * @property {number} [y] - The y-coordinate of the sprite.
 * @property {string} [texture] - The texture key of the sprite.
 */
export type SpriteData = JSONGameObject & {
  id: string;
  x: number;
  y: number;
  texture?: string;
  size?: Size;
};

/**
 * The GameObjectStruct class is a Phaser GameObject that represents a sprite in the game.
 * It bases its appearance on the data object it receives.
 *
 * @template T - The type of the data object.
 * @extends Phaser.GameObjects.Sprite
 */
export class GameObjectStruct<
  T extends SpriteData = SpriteData,
  S extends Phaser.Scene = Phaser.Scene,
  K extends keyof T = keyof T,
> extends GameObjects.Sprite {
  /**
   * Creates an instance of GameObjectStruct.
   *
   * @param {Phaser.Scene} scene - The scene to which this sprite belongs.
   * @param {T} data - The data object containing properties for the sprite.
   */
  constructor(scene: S, data: T) {
    assertDefined(data.texture, "texture@GameObjectStruct");

    super(scene, data.x, data.y, data.texture);
    this.setDataEnabled();
    this.data.set(data);
    this.name = data.id ?? getUuid();
    this.type = this.constructor.name;
    if (data.size) {
      this.setDisplaySize(data.size.width, data.size.height);
    }
    scene.add.existing(this as any);
    this.addToUpdateList();
  }

  toJSON(): T {
    return toJson(this.data.getAll());
  }

  /**
   * Returns a string representation of the GameObjectStruct.
   *
   * @returns {string} A string representing the GameObjectStruct.
   */
  toString(): string {
    return `${this.type} ${this.data.get("id")}`;
  }

  /**
   * Updates the data of the GameObjectStruct with the given partial data.
   *
   * @param {Partial<T>} partial - The partial data to update.
   * @returns {GameObjectStruct<T>} The updated GameObjectStruct instance.
   */
  updateData(partial: Partial<T>): this {
    this.data.merge(partial);
    return this;
  }

  set<V = T[K]>(key: K, value: V): this {
    this.data.set(key, value);
    return this;
  }

  get<K extends keyof T>(key: K): T[K] {
    return this.data.get(key as string);
  }

  // It bases its appearance on the Block type it will receive
  // It should be able to load a shape and a block from the assets
  // It also should be able to start tweens for different states and transitions:
  // - idle
  // - hover
  // - selected
  // - matchable
  // - matched (going to swap with matched block)
  // - falling
  // - gathered in a set (4+ blocks of the same color)
  // - destroyed
}
