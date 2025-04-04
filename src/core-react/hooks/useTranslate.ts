import { useCallback } from "react";
import { useTranslation } from "next-i18next";
import { TOptionsBase } from "i18next";
import en from "@/locales/en/common.json";
import { AnyObject } from "@core";

type Options = TOptionsBase;
type TranslationType = typeof en;
type Domains = keyof TranslationType;

type DotNotation<T extends object, P extends string = ""> = {
  [K in keyof T]: T[K] extends object
    ? DotNotation<T[K], `${P}${K & string}.`>
    : `${P}${K & string}`;
}[keyof T];

// create a type from TranslationType that is a union of all paths of the fields
export type TranslationPaths = DotNotation<TranslationType>;

export const useTranslate = <
  D extends Domains | undefined = undefined,
  T extends AnyObject = D extends Domains
    ? TranslationType[D]
    : TranslationType,
>(
  domain?: D,
) => {
  const { t: tOriginal } = useTranslation(domain);

  // @ts-ignore
  return useCallback(
    (key: any, args?: Options & T) => {
      const r = tOriginal(key, args as any);
      return `${r}`;
    },
    [tOriginal],
  ) as (key: DotNotation<T>, args?: Options & T) => string;
};
