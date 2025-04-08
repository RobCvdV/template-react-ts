import { Struct } from "@core";

const type = (a: unknown) => {
  if (a === undefined) return "undefined";
  if (a === null) return "null";
  if (a === true || a === false) return "boolean";
  if (typeof a === "number") return "number";
  if (typeof a === "string") return "string";
  return a.constructor?.name ?? typeof a;
};

export const inspect = (...args: any[]) => {
  console.debug(
    `\nInspecting \x1b[36m${args.length}\x1b[0m args:\n${args
      .map((a, i) => {
        const t = type(a);
        const v = JSON.stringify(a, null, 2);
        const s =
          a instanceof Struct
            ? `\nwith state JSON value: ${JSON.stringify(a["state"], null, 2)}`
            : "";
        const f =
          t === "Function" ? `\nwith string value: \n${a.toString()}` : "";

        return `(\x1b[36m${i}\x1b[0m) type is \x1b[36m${t}\x1b[0m with JSON value:\n${v}${s}${f}`;
      })
      .join("\n\n")}`,
  );
};
