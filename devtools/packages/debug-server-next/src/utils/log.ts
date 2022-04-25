/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import path from 'path';
import util from 'util';
import colors from 'colors/safe';
import { Logger as WinstonLogger, transports, format, createLogger } from 'winston';
import { lowerFirst, uniq, random } from 'lodash';
import { WinstonColor, LogLevel } from '@debug-server-next/@types/enum';
import { config } from '@debug-server-next/config';
import { aegis } from '@debug-server-next/utils/aegis';
import 'winston-daily-rotate-file';

export class Logger {
  protected logFilename;
  private loggerInstance: WinstonLogger;
  private label: string;
  private color: string;
  private hideInConsole: boolean;

  public constructor(label = '', color?: string, logFilename?: string, hideInConsole?: boolean) {
    this.label = label;
    this.color = color || getRandomColor();
    this.logFilename = logFilename || '%DATE%.log';
    this.hideInConsole = hideInConsole;
    this.initLoggerInstance();
  }

  public info(...args) {
    this.log(LogLevel.Info, ...args);
  }

  public verbose(...args) {
    this.log(LogLevel.Verbose, ...args);
  }

  public debug(...args) {
    this.log(LogLevel.Debug, ...args);
  }

  public silly(...args) {
    this.log(LogLevel.Silly, ...args);
  }

  public warn(...args) {
    this.log(LogLevel.Warn, ...args);
  }

  public error(...args) {
    this.log(LogLevel.Error, ...args);
  }

  private log(level, ...args) {
    const msg = util.format(...args);
    this.loggerInstance.log(level, msg);
    if (level === LogLevel.Error) {
      aegis.report(new Error(msg));
    } else if ([LogLevel.Warn].includes(level)) {
      aegis.infoAll(msg);
    }
  }

  private initLoggerInstance() {
    const label = colors[this.color](this.label);
    this.loggerInstance = createLogger({
      format: format.combine(
        format.errors({ stack: true }),
        format.label({ label }),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        format.colorize(),
        format.printf(({ level, message, label, timestamp }) => `${timestamp} ${label} ${level} ${message}`),
      ),
      transports: [
        new transports.DailyRotateFile({
          filename: path.join(config.logPath, this.logFilename),
          datePattern: 'YYYY-MM-DD-HH',
          zippedArchive: false,
          maxSize: '20m',
          maxFiles: '7d',
          level: LogLevel.Verbose,
        }),
        !this.hideInConsole &&
          new transports.Console({
            level: global.debugAppArgv?.log || LogLevel.Info,
          }),
      ].filter(Boolean),
    });
  }
}

export class TunnelLogger extends Logger {
  public constructor(label = '', color?: string, logFilename?: string) {
    super(label, color, logFilename || '%DATE%.tunnel.log', true);
  }
}

export class UserLogger extends Logger {}

const winstonColors = uniq(Object.values(WinstonColor).map(lowerFirst));
function getRandomColor() {
  return winstonColors[random(winstonColors.length - 1)];
}
