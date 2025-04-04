import _ from "lodash";
import { AnyObject, Exception, Func, getNamedLogs, getUuid, Id } from "@core";

export type PubSubEventType = {
  Error: { error: string | Error | Exception } & AnyObject;
  ConnectionStatus: { isConnected: boolean } & AnyObject;
  PushMessage: { message: string; data?: AnyObject } & AnyObject;
  Snack: { message: string; duration?: number; route?: string };
};
export type PubSubEventKeys = keyof PubSubEventType;

type ExtraProps<K extends PubSubEventKeys> = PubSubEventType[K];

export type PubSubEvent<T extends PubSubEventKeys> = {
  type?: T;
} & ExtraProps<T>;

export type PubSubEventSubscription<T extends PubSubEventKeys> = Partial<
  PubSubEvent<T>
>;

export type PubSubCallback<T extends PubSubEventKeys> = (
  e: PubSubEvent<T>,
) => void;

export type Subscription<T extends PubSubEventKeys> = {
  event: PubSubEventSubscription<T>;
  id: Id;
  callback: PubSubCallback<T>;
  unsubscribe: Func<void, never>;
};

export type SubscribeFunction = <T extends PubSubEventKeys>(
  event: T | PubSubEventSubscription<T>,
  callback: PubSubCallback<T>,
) => Func<void, never>;

const subscriptions: { [key: Id]: Subscription<any> } = {};
const cons = getNamedLogs({ name: "PubSub" });

export const subscribe: SubscribeFunction = (event, callback) => {
  const id = getUuid();
  const _event = _.isString(event) ? { type: event } : event;
  cons.log("subscribe", _event, id, subscriptions);

  const unsubscribe = () => {
    delete subscriptions[id];
  };

  subscriptions[id] = {
    event: _event,
    id,
    callback,
    unsubscribe,
  };

  return unsubscribe;
};

export const unsubscribe = <T extends PubSubEventKeys = any>(
  event: T | PubSubEventSubscription<T>,
) => {
  const _event = _.isString(event) ? { type: event } : event;
  Object.values(subscriptions)
    .filter((s) => _.isMatch(_event, s.event))
    .forEach((s) => s.unsubscribe());
};

export const publish = <T extends PubSubEventKeys>(
  event: T | PubSubEvent<T>,
  options: ExtraProps<T> = {} as ExtraProps<T>,
) => {
  const _event = _.isString(event)
    ? ({ type: event, ...options } as PubSubEvent<T>)
    : event;
  const fired = Object.values(subscriptions)
    .filter((s) => _.isMatch(_event, s.event))
    .map((s) => s.callback(_event)).length;

  if (fired) {
    cons.log("event", _event, "handled by", fired, "subscribers");
  }
};
