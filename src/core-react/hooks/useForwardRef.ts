import { ForwardedRef, RefObject, useCallback, useRef } from "react";

export function useForwardRef<T extends Element>(ref: ForwardedRef<T>) {
  const _ref = useRef<T>(undefined);
  const setRef = useCallback(
    (el: T) => {
      if (typeof ref === "function") {
        ref(el);
      } else if (ref) {
        ref.current = el;
      }
      _ref.current = el;
    },
    [ref, _ref],
  );

  return [_ref, setRef] as [RefObject<T>, (r: T) => void];
}
