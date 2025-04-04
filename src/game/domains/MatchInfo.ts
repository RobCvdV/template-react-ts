import { Selection } from "./Selection";

export type MatchKind = "none" | "swap" | "unlock" | "unlock-wireless";
export type MatchInfo = {
  kind: MatchKind;
  selection: Required<Selection>;
};
