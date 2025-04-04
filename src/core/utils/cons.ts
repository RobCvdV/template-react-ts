export const logCommands = ["log", "warn", "error", "debug", "info"] as const;
export type LogCommand = (typeof logCommands)[number];

export const consSettings: {
  whitelist?: string[];
  blacklist?: string[];
  getIdentifier?: () => string;
} = {};

export function dd(n: number): string {
  return `${n < 10 ? "0" : ""}${n}`;
}

// Triple digit
export function td(n: number): string {
  if (n < 10) return `00${n}`;
  if (n < 100) return `0${n}`;
  return `${n}`;
}

export const logColors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  bold: "\x1b[1m",
  framed: "\x1b[51m",
  encircled: "\x1b[52m",
  overlined: "\x1b[53m",
  reverse: "\x1b[7m",
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",
} as const;

export type LogColor = keyof typeof logColors;

export function timeString(): string {
  const d = new Date();
  return `${dd(d.getMonth() + 1)}-${dd(d.getDate())} ${dd(d.getHours())}:${dd(d.getMinutes())}:${dd(
    d.getSeconds(),
  )}.${td(d.getMilliseconds())}`;
}

export type Tag = string;
export type LogArgs = any[];
export type TaggedLogArgs = [Tag, ...any[]];
export type Injector<C extends LogCommand = "log"> = <T>(
  x: T,
) => C extends "error" ? never : T;

export type Logger<A extends any[], R = void> = (...args: A) => R;
export type Console<L> = {
  [key in LogCommand]: L;
};

export type SmartConsole = Console<Logger<TaggedLogArgs>>;

export type InjectedLogger<C extends LogCommand = "log"> = Logger<
  TaggedLogArgs,
  Injector<C>
>;
export type InjectedConsole<C extends LogCommand> = Console<InjectedLogger<C>>;

export const cons = logCommands.reduce<SmartConsole>(
  (obj, cmd) => {
    obj[cmd] = (tag: Tag, ...args: any[]) => {
      return console[cmd](tag, ...args);
    };
    return obj;
  },
  {} as unknown as SmartConsole,
);

// export const injectCons = logCommands.reduce<InjectedConsole<'log'>>(
//   (obj, cmd) => {
//     obj[cmd] = ((tag, ...args) =>
//       <T>(x: T) => {
//         cons[cmd](tag, ...args, x);
//         return x;
//       }) as InjectedLogger<C>;
//     return obj;
//   },
//   {} as unknown as InjectedConsole,
// );

type LogOptions = {
  name: string;
  color: LogColor;
  addTimestamp: boolean;
};

export type ConsLogger = Console<Logger<LogArgs>> & {
  i: Console<Logger<LogArgs, Injector>>;
};

function logNamed(
  cmd: LogCommand,
  tag: string,
  addTimestamp: boolean,
  col: string,
  ...args: any[]
) {
  if (consSettings.whitelist && !consSettings.whitelist.includes(tag)) {
    return;
  }
  if (consSettings.blacklist?.includes(tag)) {
    return;
  }

  const stamp = addTimestamp ? `${timeString()} ` : "";
  const prefix = consSettings.getIdentifier
    ? `${consSettings.getIdentifier()} `
    : "";
  if (args.length === 1 && typeof args[0] === "function") {
    return cons[cmd](
      stamp + prefix + col + tag,
      `${logColors.reset}`,
      args[0](),
    );
  }
  return cons[cmd](stamp + prefix + col + tag, `${logColors.reset}`, ...args);
}

export const getLogColor = (tag: string): LogColor =>
  tag.includes("Session")
    ? "blue"
    : tag.includes("Gateway")
      ? "dim"
      : tag.includes("Repo")
        ? "yellow"
        : tag.includes("Resource")
          ? "cyan"
          : tag.includes("Provider")
            ? "magenta"
            : "green";

type ColorFunction = (input: any) => string;
type ColorFunctions = {
  [key in LogColor]: ColorFunction;
};
export const colorize: ColorFunctions = Object.entries(logColors).reduce(
  (acc, [colorKey, colorValue]) => {
    acc[colorKey as LogColor] = (input: any) =>
      `${colorValue}${input}${logColors.reset}`;
    return acc;
  },
  {} as unknown as ColorFunctions,
);

export const getNamedLogs = (options?: Partial<LogOptions>): ConsLogger => {
  const color = options?.color ?? getLogColor(options?.name || "");
  const settings = {
    name: "",
    color,
    addTimestamp: true,
    ...options,
  } as LogOptions;
  const col = logColors[color];

  const cons = {
    settings: settings,
    ...logCommands.reduce<ConsLogger>(
      (obj, cmd) => {
        obj[cmd] = (...args: any[]) =>
          logNamed(cmd, settings.name, settings.addTimestamp, col, ...args);
        return obj;
      },
      {
        i: logCommands.reduce<Console<Logger<LogArgs, Injector>>>(
          <C extends LogCommand>(
            obj: Console<Logger<LogArgs, Injector<C>>>,
            cmd: C,
          ) => {
            obj[cmd] =
              (...args: any[]) =>
              <T>(x: T): C extends "error" ? never : T => {
                logNamed(
                  cmd,
                  settings.name,
                  settings.addTimestamp,
                  col,
                  ...args,
                  x,
                );
                if (cmd === "error") throw x;
                return x as C extends "error" ? never : T;
              };
            return obj;
          },
          {} as any,
        ),
      } as ConsLogger,
    ),
  };

  return cons;
};
