import { ConsLogger, getNamedLogs } from "@core";

export class LoggerClass {
  protected log: ConsLogger["log"];
  protected warn: ConsLogger["warn"];
  protected error: ConsLogger["error"];

  constructor(name: string) {
    this.log = getNamedLogs({ name }).log;
    this.warn = getNamedLogs({ name }).warn;
    this.error = getNamedLogs({ name }).error;
  }
}
