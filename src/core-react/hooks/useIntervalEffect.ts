import { DependencyList, EffectCallback, useEffect, useRef } from "react";

// runs once immediately and then every interval ms
export function useIntervalEffect(
  callback: EffectCallback,
  interval: number,
  deps: DependencyList = [],
) {
  const intervalRef = useRef<NodeJS.Timeout>(undefined);
  useEffect(() => {
    clearInterval(intervalRef.current);
    callback();
    intervalRef.current = setInterval(() => callback(), interval);
    return () => clearInterval(intervalRef.current);
  }, [callback, interval, ...deps]);
}
