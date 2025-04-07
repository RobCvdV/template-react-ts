import { Block, BlockSet } from "@game";

export class GameFlow {
  public interactionDisabled: boolean = false;
  public paused: boolean = false;
  public selected?: Block;
  public secondOption?: Block;
  public matchable: Block[] = [];
  public sets: BlockSet[] = [];
}
