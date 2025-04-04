type Constructor<T = unknown> = { new (...args: any[]): T };
type Obj = NonNullable<{ [k: string]: any }>;

export function ensureArray<S extends Obj, X extends Obj>(
  ctor: Constructor<X>,
  array: Array<X | S> = [],
): Array<X> {
  return array.map((it) =>
    it instanceof ctor ? (it as X) : (new ctor(it) as X),
  );
}
