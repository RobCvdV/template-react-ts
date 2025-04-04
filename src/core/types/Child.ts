import { Struct } from "@/core/types/Struct";
import { getUuid } from "@/core/utils/getUuid";

export class Child extends Struct {
  readonly id = this.state.id || getUuid();
}
