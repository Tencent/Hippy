/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2022 THL A29 Limited, a Tencent company.
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

/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */

const consoleModule = internalBinding('ConsoleModule');

const indent = (level) => {
  let tab = '';
  while (tab.length < level * 2) {
    tab += '  ';
  }
  return tab;
};

let inspectObject = null;
let inspect = null;

function getOwnPropertyDescriptors(param) {
  const result = {};
  const propKeys = Object.keys(param);
  propKeys.forEach((key, index) => {
    result[propKeys[index]] = Object.getOwnPropertyDescriptor(param, propKeys[index]);
  });
  return result;
}

inspectObject = (value, level = 0, recurseTimes = 2, linebreak = '\n') => {
  if (value === null) {
    return 'null';
  }
  if (Array.isArray(value)) {
    return `[ ${value.map(item => inspect(item, level + 1, recurseTimes - 1)).join(', ')} ]`;
  }

  switch (Object.prototype.toString.call(value)) {
    case '[object Date]': {
      return Date.prototype.toISOString.call(value);
    }
    case '[object RegExp]': {
      return RegExp.prototype.toString.call(value);
    }
    case '[object Error]': {
      return `${value.stack || Error.prototype.toString.call(value)}`;
    }
    case '[object Set]': {
      return `Set { ${[...value].map(item => inspect(item, level + 1, recurseTimes - 1, linebreak)).join(', ')} }`;
    }
    case '[object WeakSet]': {
      return 'WeakSet { [items unknown] }';
    }
    case '[object Map]': {
      const entries = [];
      value.forEach((val, key) => {
        entries.push(`${inspect(key, recurseTimes * -1, recurseTimes - 1, '')} => ${inspect(val, recurseTimes * -1, recurseTimes - 1, '')}`);
      });
      return `Map { ${entries.join(', ')} }`;
    }
    case '[object WeakMap]': {
      return 'WeakMap { [items unknown] }';
    }
    default: {
      break;
    }
  }

  if (value instanceof Error) {
    return `${value.stack || Error.prototype.toString.call(value)}`;
  }
  const descs = getOwnPropertyDescriptors(value);
  const keys = Object.keys(descs);
  const pairs = [];
  keys.forEach((key) => {
    const desc = descs[key];
    const itemPrefix = `${indent(level + 1)}${key} : `;
    if (desc.get) {
      if (desc.set) {
        pairs.push(`${itemPrefix}[Getter/Setter]`);
      } else {
        pairs.push(`${itemPrefix}[Getter]`);
      }
    } else if (desc.set) {
      pairs.push(`${itemPrefix}[Setter]`);
    } else if (desc.value) {
      pairs.push(`${itemPrefix}${inspect(desc.value, level + 1, recurseTimes - 1, linebreak)}`);
    }
  });
  return `{${linebreak}${pairs.join(`, ${linebreak}`)}${linebreak}${indent(level)}}`;
};

inspect = (value, level = 0, recurseTimes = 2, linebreak = '\n') => {
  switch (typeof value) {
    case 'string':
      return `'${value}'`;
    case 'symbol':
      return value.toString();
    case 'function':
      return `[Function${value.name ? `: ${value.name}` : ''}]`;
    case 'object':
      if (recurseTimes < 0) {
        return '[Object]';
      }
      return inspectObject(value, level, recurseTimes, linebreak);
    case 'bigint':
      return `n${value}`;
    case 'undefined':
    case 'number':
    case 'boolean':
    default:
      return `${value}`;
  }
};

let vmConsole;
if (typeof console !== 'undefined') {
  vmConsole = console;
}

const supportApiList = ['log', 'info', 'warn', 'error', 'debug'];
global.ConsoleModule = {};
supportApiList.forEach((api) => {
  global.ConsoleModule[api] = (...args) => {
    const log = args.map(arg => inspect(arg)).join(' ');
    consoleModule.Log(log, api);
  };
});

global.console = {
  reportUncaughtException(error) {
    if (error && error instanceof Error) {
      throw error;
    }
  },
};

if (vmConsole) {
  Object.keys(vmConsole).forEach((api) => {
    global.console[api] = vmConsole[api];
  });
}
