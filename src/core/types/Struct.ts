import { AnyObject, Json } from "@core";
import { omit } from "lodash";

export class Struct<T extends Json = Json> {
  constructor(protected readonly state: T = {} as T) {}

  toJSON(): Json {
    const rest = omit(
      this,
      "toJSON",
      "state",
      "sys",
      "prototype",
      "toString",
      "update",
      "merge",
    );
    return toJson<T>(rest);
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

export function toJson<T extends Json = Json>(o: AnyObject): T {
  return JSON.parse(JSON.stringify(o)) as T;
}
