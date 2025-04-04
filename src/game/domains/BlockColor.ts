import { Enum } from "@core";

// red: '\x1b[31m',
// green: '\x1b[32m',
// yellow: '\x1b[33m',
// blue: '\x1b[34m',
// magenta: '\x1b[35m',
// cyan: '\x1b[36m',
// white: '\x1b[37m',
// black: '\x1b[30m',
// reverse: '\x1b[7m',

// bgRed: '\x1b[41m',
// bgGreen: '\x1b[42m',
// bgBlue: '\x1b[44m',
// bgYellow: '\x1b[43m',
// bgMagenta: '\x1b[45m',
// bgCyan: '\x1b[46m',
// bgWhite: '\x1b[47m',
// bgBlack: '\x1b[40m',

export class BlockColor extends Enum {
  phaser: Phaser.Display.Color;
  constructor(
    name: string,
    id: number,
    code: string,
    readonly fgCol: string,
    readonly bgCol: string,
  ) {
    super(name, id, code);
    this.phaser = Phaser.Display.Color.HexStringToColor(code);
  }

  static readonly Red = new BlockColor(
    "Red",
    0,
    "#f00",
    "\x1b[31m",
    "\x1b[41m",
  );
  static readonly Green = new BlockColor(
    "Green",
    1,
    "#0f0",
    "\x1b[32m",
    "\x1b[42m",
  );
  static readonly Blue = new BlockColor(
    "Blue",
    2,
    "#00F",
    "\x1b[33m",
    "\x1b[44m",
  );
  static readonly Yellow = new BlockColor(
    "Yellow",
    3,
    "#ff0",
    "\x1b[34m",
    "\x1b[43m",
  );
  static readonly Magenta = new BlockColor(
    "Magenta",
    4,
    "#f2f",
    "\x1b[35m",
    "\x1b[45m",
  );
  static readonly Cyan = new BlockColor(
    "Cyan",
    5,
    "#0ff",
    "\x1b[36m",
    "\x1b[46m",
  );
  static readonly Orange = new BlockColor("Orange", 6, "#f90", "🟧", "");
  static readonly Pink = new BlockColor(
    "Pink",
    7,
    "rgb(255, 100, 200)",
    "🟪",
    "",
  );
  static readonly White = new BlockColor(
    "White",
    8,
    "#fff",
    "\x1b[37m",
    "\x1b[47m",
  );
  static readonly Black = new BlockColor(
    "Black",
    9,
    "#000",
    "\x1b[30m",
    "\x1b[40m",
  );

  static readonly reset = "\x1b[0m";

  get fg(): string {
    return this.fgCol + "\x1b[40m";
  }

  get bg(): string {
    return this.bgCol + "\x1b[30m";
  }

  get index(): number {
    return this.id as number;
  }

  static readonly colors = [
    BlockColor.Red,
    BlockColor.Green,
    BlockColor.Blue,
    BlockColor.Yellow,
    BlockColor.Magenta,
    BlockColor.Cyan,
    BlockColor.Orange,
    BlockColor.Pink,
    BlockColor.White,
    BlockColor.Black,
  ];
}
