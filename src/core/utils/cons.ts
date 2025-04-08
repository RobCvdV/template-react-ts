export const logCommands = ["log", "warn", "error", "debug", "info"] as const;
export type LogCommand = (typeof logCommands)[number];

const oriConsole = { ...console };
console.log = (...args: any[]) => {
  return logNamed("log", undefined, true, undefined, ...args);
};
console.warn = (...args: any[]) => {
  return logNamed("warn", undefined, true, undefined, ...args);
};
console.error = (...args: any[]) => {
  return logNamed("error", undefined, true, undefined, ...args);
};
console.debug = (...args: any[]) => {
  return logNamed("debug", undefined, true, undefined, ...args);
};
console.info = (...args: any[]) => {
  return logNamed("info", undefined, true, undefined, ...args);
};

export const consSettings: {
  whitelist?: string[];
  blacklist?: string[];
  getIdentifier?: () => string;
} = {};

function getCaller() {
  let caller = new Error().stack?.split("\n")[4]?.trim() ?? "[missing caller]";
  caller = caller.replace("at ", "");
  //   .split("(")
  //   .map((x) => x.trim());
  // caller = callerArr.shift() ?? "[missing caller]";
  // caller = `${caller} (${callerArr.join(".").trim()}`;
  // oriConsole.log("CALLER?", caller);
  return caller;
}

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

export type SmartConsole = Console<Logger<TaggedLogArgs>> & {
  i: Console<Logger<TaggedLogArgs, Injector>>;
};

export type InjectedLogger<C extends LogCommand = "log"> = Logger<
  TaggedLogArgs,
  Injector<C>
>;
export type InjectedConsole<C extends LogCommand> = Console<InjectedLogger<C>>;

export const cons = logCommands.reduce<SmartConsole>(
  (obj, cmd) => {
    obj[cmd] = (tag: Tag, ...args: any[]) => {
      return oriConsole[cmd](tag, ...args);
    };
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
            logNamed(cmd, undefined, true, undefined, ...args, x);
            if (cmd === "error") throw x;
            return x as C extends "error" ? never : T;
          };
        return obj;
      },
      {} as any,
    ),
  } as unknown as SmartConsole,
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
  let format = "";
  let styles = [] as string[];
  if (typeof args[0] === "string" && format.includes("%c")) {
    format = args[0];
    styles = args.slice(1) as string[];
  } else {
    format = [format, ...args]
      .map((arg) => {
        if (typeof arg === "object" && arg.style && arg.text) {
          styles.push(arg.style, "");
          return `%c${arg.text}%c`;
        } else if (typeof arg === "object") {
          styles.push(arg);
          return ``;
        }
        return `${arg}`;
      })
      .join(" ");
  }
  return { format, styles };
}

function logNamed(
  cmd: LogCommand,
  tag: string | undefined,
  addTimestamp: boolean,
  col: string | undefined,
  ...args: any[]
) {
  const caller = getCaller();
  if (
    consSettings.whitelist &&
    !consSettings.whitelist?.some((x) => caller.includes(x))
  ) {
    return;
  }
  if (tag && consSettings.blacklist?.some((x) => caller.includes(x))) {
    return;
  }

  col = col ?? getLogColor(tag ?? "");

  const stamp = addTimestamp ? `${timeString()} ` : "";
  const prefix = consSettings.getIdentifier
    ? `${consSettings.getIdentifier()} `
    : "";
  if (args.length === 1 && typeof args[0] === "function") {
    return cons[cmd](
      `${stamp + prefix} %c${caller}%c\n`,
      `color: ${col}; font-weight: bold;`,
      "",
      args[0](),
    );
  }
  const { format, styles } = styledArgs(...args);
  return cons[cmd](
    `${stamp + prefix}%c${caller}%c\n${format}`,
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
