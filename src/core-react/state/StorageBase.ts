import { AnyObject, ConsLogger, getNamedLogs, isUndefined } from "@core";

type Nullable<T> = T | null | undefined;

let cons: ConsLogger;
export class StorageBase {
  protected s: Storage;

  constructor(readonly key: string) {
    cons = getNamedLogs({ name: "Storage" });
    this.s = localStorage;
  }

  get<T extends AnyObject>(key: string, defaultValue?: T): Promise<T> {
    cons.log("get", key, "from", this.key, defaultValue);
    return Promise.resolve()
      .then(() => this.s.getItem(key))
      .then((value) => (value ? JSON.parse(value) : defaultValue) as T)
      .catch(() => defaultValue as T);
  }

  set<T extends AnyObject>(key: string, val: Nullable<T>): Promise<void> {
    cons.log("set", key, "in", this.key, val);
    return Promise.resolve(this.s).then((s) => {
      if (isUndefined(val)) {
        return s.removeItem(key);
      }

      return s.setItem(key, JSON.stringify(val));
    });
  }

  remove(key: string) {
    this.s.removeItem(key);
  }

  exists(key: string): boolean {
    return !!this.s.getItem(key);
  }

  clearAll() {
    this.s.clear();
  }
}
