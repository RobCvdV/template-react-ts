import { Constructor } from "@core";

class Builder {
  private static state: any = {};
  static readonly singleton = <T>(ctr: Constructor<T>, ...args: any[]): T =>
    Builder.state[ctr.name] ?? (Builder.state[ctr.name] = new ctr(...args));
  static readonly reset = (): void => {
    Builder.state = {};
  };
}

export const build = {
  singleton: <T>(ctr: Constructor<T>, ...args: any[]): T =>
    Builder.singleton(ctr, ...args),
  reset: (): void => Builder.reset(),
};

export const singleton = <T>(ctr: Constructor<T>, ...args: any[]): T =>
  build.singleton(ctr, ...args);
