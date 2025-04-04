export function asString(value: any): string {
  if (value.toString) {
    return value.toString();
  }
  return `${value}`;
}
