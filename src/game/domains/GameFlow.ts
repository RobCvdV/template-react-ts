import { Block, BlockSet } from "@game";

export class GameFlow {
  public interactionDisabled: boolean = false;
  public selected?: Block;
  public matchable: Block[] = [];
  public sets: BlockSet[] = [];
}
