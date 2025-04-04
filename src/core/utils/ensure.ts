import { AnyObject, Constructor } from "@core";

export function ensure<S extends AnyObject, C extends AnyObject>(
  ctor: Constructor<C>,
  thing?: S | undefined extends AnyObject ? S : undefined,
  defaultThing?: never,
): C | undefined;
export function ensure<S extends X, X extends AnyObject>(
  ctor: Constructor<X>,
  thing: S,
  defaultThing?: never,
): X;
export function ensure<S extends AnyObject, X extends AnyObject>(
  ctor: Constructor<X>,
  thing: S,
  defaultThing?: never,
): X;

export function ensure<S extends AnyObject, X extends AnyObject>(
  ctor: Constructor<X>,
  thing: S | undefined,
  defaultThing: S,
): X;
export function ensure<X extends AnyObject>(
  ctor: Constructor<X>,
  thing: AnyObject | undefined,
  defaultThing: AnyObject,
): X;
export function ensure<X extends AnyObject>(
  ctor: Constructor<X>,
  thing?: AnyObject,
  defaultThing?: AnyObject,
): X | undefined;

export function ensure<X extends AnyObject>(
  ctor: Constructor<X>,
  thing?: unknown,
  defaultThing?: unknown,
): X | undefined {
  const it = thing || defaultThing;
  return !it ? undefined : it instanceof ctor ? (it as X) : (new ctor(it) as X);
}
