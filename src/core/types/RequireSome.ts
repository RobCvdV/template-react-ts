export type RequireSome<T, TR extends keyof T> = T & Required<Pick<T, TR>>;
