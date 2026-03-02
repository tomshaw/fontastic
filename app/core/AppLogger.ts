
import log from 'electron-log';

export default class AppLogger {

  private static _instance: AppLogger;
  private logger: any;

  private constructor(logName: string) {
    this.logger = log.initialize();
    this.logger.transports.file.level = 'debug';
    this.logger.transports.file.fileName = logName + '.log';
    this.logger.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}] [{level}] {text}';
  }

  public static getInstance(name: string = 'default'): AppLogger {
    if (!this._instance) {
      this._instance = new AppLogger(name);
    }
    return this._instance;
  }

  public info(message: string): void {
    this.logger.info(message);
  }

  public error(e: Error): void {
    this.logger.error(e);
  }

  public warn(message: string): void {
    this.logger.warn(message);
  }

  public debug(message: string): void {
    this.logger.debug(message);
  }
}