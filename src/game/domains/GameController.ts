import { Block } from "@game";

export class GameController {
  public interactionDisabled: boolean = false;
  public paused: boolean = false;
  public selected?: Block;
  public matchable: Block[] = [];
}
