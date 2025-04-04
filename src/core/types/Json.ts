import { AnyObject, Id } from "@core";

export type Json = AnyObject;
export type JsonEntity<I extends Id = Id> = AnyObject & { id: I };
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | Json
  | JsonValue[]
  | undefined;
