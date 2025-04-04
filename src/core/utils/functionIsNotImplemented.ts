import { Exception } from "@/core/types/Exception";

export const functionIsNotImplemented = (reason: string) => {
  throw Exception.IsNotImplemented.because(reason);
};
