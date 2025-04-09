import { List, toList } from "@core";

type Constructor<T> = { new (...args: any[]): T };
type Obj = NonNullable<{ [k: string]: any }>;

export function ensureArray<T>(
  ctor: Constructor<T>,
  array: Array<T | Obj> = [],
): Array<T> {
  return array.map((it) => (it instanceof ctor ? it : new ctor(it)));
}

export function ensureList<T>(
  ctor: Constructor<T>,
  array: Array<T | Obj> = [],
): List<T> {
  return toList<T>(array.map((it) => (it instanceof ctor ? it : new ctor(it))));
}
