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

type LogOptions = {
  name: string;
  color: LogColor;
  addTimestamp: boolean;
};

export type ConsLogger = Console<Logger<LogArgs>> & {
  i: Console<Logger<LogArgs, Injector>>;
};

function styledArgs(...args: any[]): { format: string; styles: string[] } {
  const styles = [] as string[];
  const format = args
    .map((arg) => {
      if (typeof arg === "object" && arg.style && arg.text) {
        styles.push(arg.style, "");
        return `%c${arg.text}%c`;
      } else if (typeof arg === "object") {
        return arg;
      }
      return `${arg}`;
    })
    .join(" ");
  return { format, styles };
}

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

  let caller = "";
  if (cmd === "log") {
    caller = new Error().stack?.split("\n")[3]?.trim() ?? "";
    caller = caller.replace("at ", "") + "\n";
  }

  const stamp = addTimestamp ? `${timeString()} ` : "";
  const prefix = consSettings.getIdentifier
    ? `${consSettings.getIdentifier()} `
    : "";
  if (args.length === 1 && typeof args[0] === "function") {
    return cons[cmd](
      `%c${caller}%c ${stamp + prefix}%c${tag}%c`,
      "color: #f99;",
      `color: ${col}; font-weight: bold;`,
      args[0](),
    );
  }
  const { format, styles } = styledArgs(...args);
  return cons[cmd](
    `%c${caller}%c ${stamp + prefix}%c${tag}%c ${format}`,
    "color: #f99;",
    "",
    `color: ${col}; font-weight: bold;`,
    "",
    ...styles,
  );
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

export const getNamedLogs = (options?: Partial<LogOptions>): ConsLogger => {
  const color = options?.color ?? getLogColor(options?.name || "");
  const settings = {
    name: "",
    color,
    addTimestamp: true,
    ...options,
  } as LogOptions;
  // const col = logColors[color];
  const col = color;

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
