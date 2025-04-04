import { asString, Constructor, Id, isA, isArray, isDefined } from "@core";

export type OneOrMore<T> = T | Array<T>;
export type ArrayLike<T> = OneOrMore<T>[];
export const toArray = <T>(...items: ArrayLike<T>): T[] =>
  items.length > 1
    ? (items as T[])
    : isArray(items[0])
      ? items[0]
      : isDefined(items[0])
        ? [items[0]]
        : [];

export class List<T = unknown> extends Array<T> {
  asc(key: keyof T): this {
    return this.sort((e1, e2) => (e1[key] > e2[key] ? 1 : -1));
  }

  desc(key: keyof T): this {
    return this.sort((e1, e2) => (e1[key] < e2[key] ? 1 : -1));
  }

  first(
    p?: (value: T, index: number, array: T[]) => unknown,
    params?: unknown,
  ): T {
    return (p ? this.find(p, params) : this[0]) as T;
  }

  isFirst(value: T): boolean {
    return value === this.first();
  }

  next(
    p?: (value: T, index: number, array: T[]) => unknown,
    params?: unknown,
  ): T {
    return p ? this[this.findIndex(p, params) + 1] : this[0];
  }

  prev(
    p?: (value: T, index: number, array: T[]) => unknown,
    params?: unknown,
  ): T {
    return p ? this[this.findIndex(p, params) - 1] : this[0];
  }

  last(
    p?: (value: T, index: number, array: T[]) => unknown,
    params?: unknown,
  ): T {
    return p ? this.filter(p, params).last() : this[this.length - 1];
  }

  isLast(value: T): boolean {
    return value === this.last();
  }

  overlaps(...items: ArrayLike<T>): boolean {
    return toList<T>(...items).some((i) => this.some((t) => i === t));
  }

  diff(others: ArrayLike<T>): List<T> {
    return this.filter((i) => !others.includes(i));
  }

  diffByKey(others: ArrayLike<T>, key: keyof T): List<T> {
    return this.filter((i: any) => !others.some((o: any) => o[key] === i[key]));
  }

  symmetricDiff(others: ArrayLike<T>): List<T> {
    return this.diff(others).concat(toList<T>(...others).diff(this));
  }
  symmetricDiffByKey(others: ArrayLike<T>, key: keyof T): List<T> {
    return this.diffByKey(others, key).concat(
      toList<T>(...others).diffByKey(this, key),
    );
  }

  intersect(others: ArrayLike<T>): List<T> {
    return this.filter((i) => others.includes(i));
  }

  intersectByKey(others: ArrayLike<T>, key: keyof T): List<T> {
    return this.filter((i: any) => others.some((o: any) => o[key] === i[key]));
  }

  // toJSON(): Json[] {
  //   return this.reduce((a, i) => {
  //
  //     a.push(JSON.parse(i));
  //     return a;
  //   }, new Array<Json>());
  // }

  map<U>(
    f: (value: T, index: number, array: T[]) => U,
    params?: unknown,
  ): List<U> {
    return toList<U>(super.map(f, params));
  }

  flatMap<U, This = unknown>(
    f: (
      this: This,
      value: T,
      index: number,
      array: T[],
    ) => ReadonlyArray<U> | U,
    params?: This,
  ): List<U> {
    return toList<U>(super.flatMap(f, params));
  }

  mapDefined<U>(
    f: (value: T, index: number, array: T[]) => U,
    params?: unknown,
  ): List<NonNullable<U>> {
    return this.map(f, params).defined();
  }

  async mapAsync<O = T>(
    f: (value: T, index: number, array: T[]) => Promise<O>,
  ): Promise<List<O>> {
    return Promise.all(super.map((e, i, arr) => f(e, i, arr))).then((a) =>
      toList<O>(a),
    );
  }

  distinct(): List<T> {
    return this.filter((i, index) => this.indexOf(i) === index);
  }

  filter(
    p: (value: T, index: number, array: T[]) => unknown,
    params?: unknown,
  ): List<T> {
    return toList<T>(super.filter(p, params));
  }

  sum(p: (t: T) => number): number {
    return this.reduce((sum: number, i) => sum + p(i), 0);
  }

  max(key: keyof T): T {
    return this.desc(key).first();
  }

  min(key: keyof T): T {
    return this.asc(key).first();
  }

  byId(id: Id): T {
    return this.first((i) => asString((i as any).id) === asString(id));
  }

  add(...items: ArrayLike<T>): this {
    super.push(...toArray(...items));
    return this;
  }

  concat(...items: ConcatArray<T>[]): List<T>;
  concat(...items: (T | ConcatArray<T>)[]): List<T>;
  concat(...items: (T | ConcatArray<T>)[]): List<T> {
    return toList<T>(super.concat(...items));
  }

  reverse(): List<T> {
    return toList<T>(super.reverse());
  }

  splice(start: number, deleteCount?: number): List<T>;
  splice(start: number, deleteCount: number, ...items: T[]): List<T>;
  splice(start: number, deleteCount: number, ...items: T[]): List<T> {
    return toList<T>(super.splice(start, deleteCount, ...items));
  }

  remove(item: T): List<T> {
    const index = this.indexOf(item);
    if (index > -1) {
      this.splice(index, 1);
    }
    return this;
  }

  replace(key: keyof T, item: T): List<T> {
    const val = item[key];
    const index = this.findIndex((i) => i[key] === val);
    if (index > -1) {
      this[index] = item;
    }
    return this;
  }

  switch(item: T): List<T> {
    return this.includes(item) ? this.remove(item) : this.add(item);
  }

  defined(): List<NonNullable<T>> {
    return this.reduce(
      (l, v) => (isDefined(v) ? l.add(v) : l),
      toList<NonNullable<T>>(),
    );
  }

  toObject(
    key: keyof T,
    options: { deleteKey?: boolean } = {},
  ): Record<string | number | symbol, T> {
    return this.reduce((o: any, i) => {
      o[i[key]] = i;
      if (options.deleteKey) delete o[i[key]][key];
      return o;
    }, {});
  }

  toObjectList(key: keyof T): Record<string | number | symbol, List<T>> {
    return this.reduce(
      (a, t) => {
        const k = t[key] as unknown as string | number | symbol;
        a[k] = a[k] ?? toList();
        a[k].push(t);
        return a;
      },
      {} as Record<string | number | symbol, List<T>>,
    );
  }

  weave(insertFrom: T[], interval: number): this {
    for (
      let i = interval, n = 0;
      i <= this.length && n < insertFrom.length;
      i += interval + 1
    ) {
      this.splice(i, 0, insertFrom[n++]);
    }
    return this;
  }

  slice(start?: number, end?: number): List<T> {
    return toList(super.slice(start, end));
  }

  none(p: (t: T) => boolean): boolean {
    return !this.some(p);
  }
}

export const toList = <T = unknown>(...items: ArrayLike<T>): List<T> =>
  new List<T>().add(...items);

export const isList = <T>(l?: unknown): l is List<T> =>
  isDefined(l) && isArray(l) && isA<List<T>>(l, "first", "last", "asc", "desc");

export const asList = <T>(
  c: Constructor<T>,
  items: unknown | unknown[] = [],
): List<T> => toList<T>(toArray(items).map((i) => new c(i)));

export const maxValue = <T>(l: List<T>, key: keyof T): T[keyof T] | undefined =>
  l.desc(key).first()?.[key];

export const minValue = <T>(l: List<T>, key: keyof T): T[keyof T] | undefined =>
  l.asc(key).first()?.[key];
