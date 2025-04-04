import { AnyObject, List, toList } from "@core";

export class Dict<
  T = any,
  KT extends T & { key: string } = T & { key: string },
> {
  private data: { [key: string]: T };

  constructor(initial: AnyObject<T> = {}) {
    this.data = initial;
  }

  static fromArray<T>(array: T[], key: (t: T) => string): Dict<T> {
    return new Dict(array.reduce((acc, t) => ({ ...acc, [key(t)]: t }), {}));
  }

  get keys() {
    return Object.keys(this.data);
  }

  get values() {
    return Object.values(this.data);
  }

  get entries() {
    return Object.entries(this.data);
  }

  get length() {
    return this.keys.length;
  }

  get(key: string): T {
    return this.data[key];
  }

  set(key: string, value: T): Dict<T> {
    this.data[key] = value;
    return this;
  }

  replace(...values: KT[]): Dict<T> {
    values.forEach((value) => {
      this.data[value.key] = value;
    });
    return this;
  }

  getMultiple(keys: string[]): List<T> {
    return toList(keys).map((key) => this.data[key]);
  }

  forEach(f: (key: string, value: T) => void): void {
    this.entries.forEach(([key, value]) => f(key, value));
  }

  remove(keys: string[]): Dict<T> {
    keys.forEach((key) => {
      // console.log('removing', key, (this.data[key] as any).block.toString());
      delete this.data[key];
    });
    return this;
  }
}
