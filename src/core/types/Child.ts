import { Struct } from "@/core/types/Struct";
import { getUuid } from "@/core/utils/getUuid";
import { JsonEntity } from "@/core";

export class Child<T extends JsonEntity = JsonEntity> extends Struct<T> {
  readonly id = this.state.id || getUuid();
}
