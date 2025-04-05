import { AnyObject, Json } from "@core";

export class Struct<T extends AnyObject = Json> {
  constructor(protected readonly state: T = {} as T) {}

  toJSON(): Json {
    const { state, ...rest } = this;
    return rest;
  }

  toString(): string {
    return this.constructor.name;
  }

  // override this method in your own classes
  update(_add: T): this {
    return this;
  }

  protected merge(a: T): T {
    return { ...this, ...a };
  }
}
