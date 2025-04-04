import { Enum, Id, isDefined } from "@core";
import _ from "lodash";

export class Exception extends Enum {
  static readonly AlreadyExists = new Exception("Subject already exists");
  static readonly DoesNotExist = new Exception("Does not exist");
  static readonly IsMissingId = new Exception("Subject is missing an id");
  static readonly IsNotImplemented = new Exception("Is not implemented");
  static readonly IsNotValid = new Exception("Is not valid");
  static readonly Unknown = new Exception("Unknown error");

  constructor(
    readonly message: string,
    id?: Id,
    readonly reason?: string,
  ) {
    super(message, id ?? _.camelCase(message));
  }

  static readonly CouldNotExecute = (target: string): Exception =>
    new Exception(`Could not execute ${target}.`, "CouldNotExecute");

  static readonly CouldNotValidate = (target: string): Exception =>
    new Exception(`Could not validate ${target}.`, "CouldNotValidate");

  static readonly EnvironmentVariableNotFound = (variable: string): Exception =>
    new Exception(
      `Environment variable ${_.upperCase(variable)} could not be found.`,
      "EnvironmentVariableNotFound",
    );

  because = (reason: string): Exception =>
    new Exception(this.message, this.id, reason);
}

export const isException = (e?: unknown, t?: string): e is Exception =>
  e instanceof Exception && (isDefined(t) ? e.equals(t) : true);
export const isDoesNotExist = (e?: unknown): e is Exception =>
  e instanceof Exception && Exception.DoesNotExist.equals(e);
