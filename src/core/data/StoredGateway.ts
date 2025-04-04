import {
  ConsLogger,
  Exception,
  getNamedLogs,
  Id,
  isDefined,
  Json,
  JsonEntity,
  JsonValue,
  List,
  singleton,
  toList,
} from "@core";
import { StorageBase } from "@/core-react";
import _ from "lodash";

export const removeId = <T extends Json>(d: T[], id: Id) => {
  const i = d.findIndex((it) => it.id === id);
  if (i < 0) return d;
  d.splice(i, 1);
  return d;
};

// export const updateItem = <T extends Json>(d: T[], item: T) => {
//   const id = item.id as Id;
//   if (isUndefined(id))
//     throw Exception.IsMissingId.because(
//       'updateItem@StoredGateway\n' + JSON.stringify(item),
//     );
//   const i = d.findIndex(it => it.id === id);
//   if (i < 0)
//     throw Exception.DoesNotExist.because(`StoredGateway.updateItem id:${id}`);
//   d.splice(i, 1, item);
//   return d;
// };

// This Gateway is like the InMemoryGateway, but also stores state to AsyncStorage
// Only use for local state only data. Is building block for other stored gateways.

let cons: ConsLogger;
export class StoredGateway<T extends JsonEntity = JsonEntity> {
  clearAllStores(): Promise<void> {
    this.storage.clearAll();
    return Promise.resolve();
  }

  constructor(
    readonly storageKey: string,
    readonly storage = singleton(StorageBase, storageKey),
  ) {
    cons = getNamedLogs({ name: "StoredGateway" });
  }

  public clear(): Promise<void> {
    this.storage.clearAll();
    return Promise.resolve();
  }

  all(): Promise<List<T>> {
    return this.storage
      .get<string[]>(`${this.storageKey}_keys`)
      .then(toList)
      .then((keys) => keys.mapAsync<T>((key) => this.storage.get<T>(key)));
  }

  byId(id: Id): Promise<T | undefined> {
    return this.storage.get<T>(id.toString(), undefined as any);
  }

  byIds(...ids: Id[]): Promise<List<T>> {
    return Promise.all(ids.map((id) => this.byId(id)))
      .then(toList)
      .then((p) => p.filter(isDefined) as List<T>);
  }

  exists(id: Id): Promise<boolean> {
    return this.byId(id).then((d) => isDefined(d));
  }

  add(item: T): Promise<T> {
    if (this.storage.exists(item.id.toString())) {
      return Promise.reject(
        Exception.AlreadyExists.because(
          `add@StoredGateway\n${JSON.stringify(item)}`,
        ),
      );
    }
    return this.upsert(item);
  }

  remove(id: string): Promise<true> {
    this.storage.remove(id);
    return Promise.resolve(true);
  }

  update(item: T): Promise<T> {
    cons.log("update", item);
    if (!this.storage.exists(item.id.toString())) {
      return Promise.reject(
        Exception.DoesNotExist.because(
          `update@StoredGateway\n${JSON.stringify(item)}`,
        ),
      );
    }
    return this.upsert(item);
  }

  upsert(item: T): Promise<T> {
    return this.storage.set(item.id.toString(), item).then(() => item);
  }

  upsertRemove(id: string, item?: T): Promise<T | undefined> {
    return item ? this.upsert(item) : this.remove(id).then(() => undefined);
  }

  search(q: JsonValue): Promise<List<T>> {
    if (q === null || q === undefined) {
      return Promise.resolve(toList([]));
    }
    if (typeof q === "object") {
      return this.all().then((p) => p.filter((item) => _.isMatch(item, q)));
    }
    return this.all().then((p) =>
      p.filter((item) => Object.values(item).includes(q)),
    );
  }
}
