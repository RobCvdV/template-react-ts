import { AnyObject } from "@core";
import { create, StoreApi, UseBoundStore } from "zustand";

type Func = (state: any) => any;

function insertDefaultReducers<S extends AnyObject, SS extends Func>(
  initialState: S,
  set: SS,
) {
  return {
    ...initialState,
    setPartial: (partial: Partial<S>) => {
      set((state: S) => ({ ...state, ...partial }));
    },
    reset: () => set((state: S) => ({ ...state, ...initialState })),
  };
}

type Set<S extends AnyObject> = (set: (state: S) => S) => void;

export function createStore<
  S extends AnyObject,
  R extends AnyObject<Func>,
  SS extends Set<S> = Set<S>,
  RR = R & { reset: () => void; setPartial: (partial: Partial<S>) => void },
  ST extends UseBoundStore<StoreApi<Store<S, R>>> & RR = UseBoundStore<
    StoreApi<Store<S, R>>
  > &
    RR,
>(initialState: S, reducers: (set: SS) => R) {
  const store = create<Store<S, R>>()((set) => ({
    ...insertDefaultReducers(initialState, set),
    ...reducers(set as unknown as SS),
  })) as ST;

  const extraSetters = {
    ...reducers(store.setState as unknown as SS),
    setPartial: (partial: Partial<S>) => {
      console.log("setPartial", partial);
      store.setState((s) => ({ ...s, ...partial }));
    },
    reset: () => store.setState((s) => ({ ...s, ...initialState })),
  };

  Object.keys(extraSetters).forEach((key) => {
    (store as unknown as RR)[key as keyof RR] = extraSetters[
      key
    ] as unknown as RR[keyof RR];
  });
  return store;
}

export type DefaultReducers<S extends AnyObject> = {
  setPartial: (partial: Partial<S>) => void;
  reset: () => void;
};

export type Store<S extends AnyObject, R extends AnyObject<Func>> = S &
  R &
  DefaultReducers<S>;

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never;

export const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
  _store: S,
) => {
  let store = _store as WithSelectors<typeof _store>;
  store.use = {};
  for (let k of Object.keys(store.getState())) {
    (store.use as any)[k] = () => store((s) => s[k as keyof typeof s]);
  }

  return store;
};
