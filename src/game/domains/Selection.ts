import { Block } from "@game";

export type Selection = {
  selected?: Block;
  second?: Block;
};

export type SelectionState = {
  selected?: Block;
  second?: Block;
  matchable?: Block[];
};
