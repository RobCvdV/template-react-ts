import { isPromise } from "@core";

type Pro<A> = A | PromiseLike<A>;
type Aw<A> = Awaited<A>;

const couple = <F, S>(first: Pro<F>, second: Pro<S>): Promise<[Aw<F>, Aw<S>]> =>
  Promise.all([first, second]);

/** A monad to chain promises, similar to a promise chain, but at the same time collects add passes through all results thus far in the chain. The final 'value' or all 'values' can be retrieved as a Promise that can be caught for rejects during the chain.
 * Use through the chain function, for easy with.
 * ```ts
 * chain(ui.askAmount())
 *   .add((n) => cooling.fetchBurgers(n))
 *   .add((n) => storage.fetchBuns(n))
 *   .add(() => cupboard.findTools())
 *   .with((...stuff) => console.log('collected so far:', stuff))
 *   .add((tools, buns, burgers, amount) => kitchen.prepareBurgers(amount, burgers, buns, tools))
 *   .value.then(meals => console.log(meals)) // value returns the last value added, which is the output of prepareBurgers
 *   .catch(e => console.error(e))
 * ```
 */
class Chain<F, T extends [F, ...any[]]> {
  constructor(readonly _values: Promise<T>) {}

  /**
   * Add a callback to the call chain, whose (promised) result gets inserted as first into the collection of values. The next 'add' wil get the prior ands result value as the first argument, so the chain is more similar in structure to a normal promise chain.
   * @param func a function that gets called with the previous collected results from then calls. Should return a (promised) value to be inserted into the collection for a successor call.
   * @returns a new Chain object with the currently collected values including the one returned by func, as the first value.
   */
  add<X>(func: (...values: T) => Promise<X> | X): Chain<X, [X, ...T]> {
    return new Chain<X, [X, ...T]>(
      this._values.then((vs) =>
        couple(vs, func(...vs)).then(([vls, v]) => [v, ...vls]),
      ),
    );
  }

  /**
   * Add a callback to the call chain, whose result is ignored or is void, so it does not get added to the collection. Can also be used for logging purposes or to do (async) side effects without influencing the collection of values.
   * @param func a function that gets called with the previous collected results from then calls.
   * @returns this Chain object with the all collected values.
   */
  with(func: (...values: T) => unknown): Chain<F, T> {
    return new Chain(
      this._values.then((vs) => func(...vs)).then(() => this._values),
    );
  }

  /**
   * A promise that resolves to nothing, if no result is needed when done, but rejecttions can still be caught
   */
  done(): Promise<void> {
    return this._values.then(() => undefined);
  }

  /**
   * A promise that resolves all the values collected
   */
  get values(): Promise<T> {
    return this._values;
  }

  /**
   * A promise that resolves the last value collected
   */
  get value(): Promise<F> {
    return this._values.then((vs) => vs[0]);
  }
}

/**
 * Monad to chain promises, like a normal promise chain, but collect add pass through all results thus far in the chain. Use finally to output the collected results in a normal Promise.
 * @param value Either a value of any type or a Promise.
 * @returns A Chain object that allows chaining more promises add collect their results.
 *
 * ```ts
 * chain(ui.askAmount())
 *   .add((n) => cooling.fetchBurgers(n))
 *   .add((n) => storage.fetchBuns(n))
 *   .add(() => cupboard.findTools())
 *   .with((...stuff) => console.log('collected so far:', stuff))
 *   .add((tools, buns, burgers, amount) => kitchen.prepareBurgers(amount, burgers, buns, tools))
 *   .value.then(meals => console.log(meals)) // value returns the last value added, which is the output of prepareBurgers
 *   .catch(e => console.error(e))
 * ```
 */
export const chain = <V>(
  value: Promise<V> | V = undefined as any,
): Chain<V, [V]> =>
  new Chain<V, [V]>(
    isPromise(value) ? value.then((v) => [v]) : Promise.resolve([value]),
  );
