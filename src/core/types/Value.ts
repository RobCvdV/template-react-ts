import { asString, isDefined, JsonValue, Validatable } from "@/core";

export class Value<V = string> implements Validatable {
  constructor(readonly value: V) {
    this.value = value;
  }

  get isValid(): boolean {
    return isDefined(this.value);
  }

  toJSON(): JsonValue {
    return this.value as unknown as JsonValue;
  }

  toString(): string {
    return asString(this.value);
  }
}

export const isValue = (v?: unknown): v is Value => v instanceof Value;
