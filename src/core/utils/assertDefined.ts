import { cons, Exception } from "@core";

export function assertDefined<T>(
  value: T | undefined | null,
  where = "unknown",
): asserts value is T {
  if (value === undefined || value === null) {
    const description = `Value should be defined: ${where}`;
    cons.error(description);
    throw Exception.IsNotValid.because(description);
  }
}
