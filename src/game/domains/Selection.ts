import { Block } from "@domains";

export type Selection = {
  selected?: Block;
  second?: Block;
};

export type SelectionState = {
  selected?: Block;
  second?: Block;
  matchable?: Block[];
};
