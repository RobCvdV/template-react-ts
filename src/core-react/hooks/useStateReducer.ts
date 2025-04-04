import { useState } from "react";

export const useStateReducer = <T>(
  init: T,
): [T, (s: ((s: T) => Partial<T>) | Partial<T>) => void] => {
  const [state, setState] = useState<T>(init);

  const setter = (p: ((s: T) => Partial<T>) | Partial<T>) => {
    setState((s) => {
      const n = typeof p === "function" ? p(s) : p;
      return { ...s, ...n };
    });
  };

  return [state, setter];
};
