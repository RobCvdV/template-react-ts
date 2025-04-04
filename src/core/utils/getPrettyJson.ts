export const getPrettyJson = (data: any): string =>
  data instanceof ArrayBuffer
    ? '<non json data>'
    : JSON.stringify(data, null, 2);
