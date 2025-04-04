import { GameObjects } from "phaser";
import { assertDefined, getNamedLogs, getUuid, Json } from "@core";

/**
 * @typedef {Object} SpriteData
 * @property {number} [x] - The x-coordinate of the sprite.
 * @property {number} [y] - The y-coordinate of the sprite.
 * @property {string} [texture] - The texture key of the sprite.
 */
export type SpriteData = Json & {
  id: string;
  x?: number;
  y?: number;
  texture?: string;
};

const cons = getNamedLogs({ name: "GameObjectStruct" });
/**
 * The GameObjectStruct class is a Phaser GameObject that represents a sprite in the game.
 * It bases its appearance on the data object it receives.
 *
 * @template T - The type of the data object.
 * @extends Phaser.GameObjects.Sprite
 */
export class GameObjectStruct<
  T extends SpriteData = SpriteData,
> extends GameObjects.Sprite {
  /**
   * Creates an instance of GameObjectStruct.
   *
   * @param {Phaser.Scene} scene - The scene to which this sprite belongs.
   * @param {T} data - The data object containing properties for the sprite.
   * @param {number} [x] - The x-coordinate of the sprite.
   * @param {number} [y] - The y-coordinate of the sprite.
   * @param {string} [texture] - The texture key of the sprite.
   */
  constructor(
    scene: Phaser.Scene,
    data: T,
    x?: number,
    y?: number,
    texture?: string,
  ) {
    const _x = (x ?? data.x ?? 1) * 60 + 50;
    const _y = (y ?? data.y ?? 1) * 60 + 50;
    texture = texture ?? data.texture;
    // assertDefined(x, "x@GameObjectStruct");
    // assertDefined(y, "y@GameObjectStruct");
    assertDefined(texture, "texture@GameObjectStruct");

    super(scene, _x, _y, texture);
    this.setDataEnabled();
    this.data.set(data);
    this.name = data.id ?? getUuid();
    this.type = this.constructor.name;
    this.setDisplaySize(50, 50);
    // adjust scale to fit the scene width, assuming the blocks are square and 100x100 by default
    // adjust scale to fit the scene width, assuming the blocks are square and 100x100 by default
    scene.add.existing(this);
    this.addToUpdateList();
  }

  // /**
  //  * Creates an instance of GameObjectStruct.
  //  *
  //  * @param cstr - The constructor/class for the GameObjectStruct.
  //  * @param {Phaser.Scene} scene - The scene to which this sprite belongs.
  //  * @param {T} data - The data object containing properties for the sprite.
  //  * @param {number} [x] - The x-coordinate of the sprite.
  //  * @param {number} [y] - The y-coordinate of the sprite.
  //  * @param {string} [texture] - The texture key of the sprite.
  //  */
  // static createGO<GO extends GameObjectStruct<T>, T extends SpriteData>(
  //   cstr: Constructor<GO>,
  //   scene: Phaser.Scene,
  //   data: T,
  //   x?: number,
  //   y?: number,
  //   texture?: string,
  // ) {
  //   x = x ?? data.x;
  //   y = y ?? data.y;
  //   texture = texture ?? data.texture;
  //   assertDefined(x, "x@GameObjectStruct");
  //   assertDefined(y, "y@GameObjectStruct");
  //   assertDefined(texture, "texture@GameObjectStruct");
  //   cons.log("constructor", x, y, texture);
  //
  //   const go = new cstr(scene, x, y, texture);
  //   go.name = data.id ?? getUuid();
  //   go.setDataEnabled();
  //   go.type = this.constructor.name;
  //   go.data.set(data);
  //   scene.add.existing(go);
  //   go.addToUpdateList();
  //   return go;
  // }

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

  set<K extends keyof T>(key: K, value: T[K]): this {
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
