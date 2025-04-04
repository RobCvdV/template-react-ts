import { Json } from "@core";

export class Struct {
  constructor(protected readonly state: Json = {}) {}

  toJSON(): Json {
    const { state, ...rest } = this;
    return rest;
  }

  toString(): string {
    return this.constructor.name;
  }

  // override this method in your own classes
  update(_add: Json): Struct {
    return this;
  }

  protected merge(a: Json): Json {
    return { ...this, ...a };
  }
}
