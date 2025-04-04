export type Optional<T> = T | undefined;
export type OptionalSome<T, TR extends keyof T> = T & Partial<Pick<T, TR>>;
