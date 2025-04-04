import {
  PubSubCallback,
  PubSubEventKeys,
  PubSubEventSubscription,
  subscribe,
  unsubscribe,
} from "@core";
import { DependencyList, useEffect } from "react";
import _ from "lodash";

export function useSubscribe<T extends PubSubEventKeys>(
  event: T | PubSubEventSubscription<T>,
  callback: PubSubCallback<T>,
  deps?: DependencyList,
) {
  const _event = _.isString(event)
    ? ({ type: event } as PubSubEventSubscription<T>)
    : event;
  return useEffect(() => {
    subscribe(_event, callback);

    return () => {
      unsubscribe(_event);
    };
  }, deps);
}
