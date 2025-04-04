import {
  Child,
  Id,
  JsonEntity,
  LoggerClass,
  singleton,
  StoredGateway,
} from "@core";

export class Repo<
  C extends Child = Child,
  T extends JsonEntity<Id> = JsonEntity<Id>,
> extends LoggerClass {
  constructor(
    name: string,
    readonly gw = singleton(StoredGateway<T>, name),
  ) {
    super(name);
  }

  upsertIt(item: C): Promise<C> {
    this.log("upsert", item.id);
    return this.gw.upsert(item.toJSON() as T).then(() => item);
  }
}
