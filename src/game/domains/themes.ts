import { BlockType } from "@game";
import { AnyObject } from "@core";

export type GameTheme = {
  colors: [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
  ];
  shapes: [
    BlockType,
    BlockType,
    BlockType,
    BlockType,
    BlockType,
    BlockType,
    BlockType,
    BlockType,
    typeof BlockType.Lock,
    typeof BlockType.Key,
    typeof BlockType.WirelessKey,
    typeof BlockType.Bomb,
  ];
};

export const themes: AnyObject<GameTheme> = {
  boyish: {
    colors: [
      "rgb(120, 71, 66)",
      "rgb(255, 184, 61)",
      "rgb(67, 128, 67)",
      "rgb(62, 85, 131)",
      "rgb(102, 153, 153)",
      "rgb(186, 145, 128)",
      "rgb(138, 51, 51)",
      "rgb(179, 115, 41)",
      "rgb(171, 171, 171)",
      "rgb(255, 199, 43)",
      "rgb(253, 253, 245)",
      "rgb(26, 26, 26)",
    ],
    shapes: [
      BlockType.Circle,
      BlockType.Square,
      BlockType.Triangle,
      BlockType.Star,
      BlockType.Plus,
      BlockType.Heart,
      BlockType.Xmark,
      BlockType.Wave,
      // ---------
      BlockType.Lock,
      BlockType.Key,
      BlockType.WirelessKey,
      BlockType.Bomb,
    ],
  },
  girly: {
    colors: [
      "rgb(201, 110, 191)",
      "rgb(222, 227, 79)",
      "rgb(125, 201, 125)",
      "rgb(77, 140, 209)",
      "rgb(122, 94, 176)",
      "rgb(240, 163, 100)",
      "rgb(250, 51, 56)",
      "rgb(145, 105, 59)",
      "rgb(171, 171, 171)",
      "rgb(255, 199, 43)",
      "rgb(253, 253, 245)",
      "rgb(26, 26, 26)",
    ],
    shapes: [
      BlockType.Heart,
      BlockType.Square,
      BlockType.Triangle,
      BlockType.Star,
      BlockType.Plus,
      BlockType.Xmark,
      BlockType.Circle,
      BlockType.Wave,
      // ---------
      BlockType.Lock,
      BlockType.Key,
      BlockType.WirelessKey,
      BlockType.Bomb,
    ],
  },
};

export type GameThemeKey = keyof typeof themes;
