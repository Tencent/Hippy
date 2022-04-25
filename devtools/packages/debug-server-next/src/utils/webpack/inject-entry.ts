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

import webpack from 'webpack';
import { Compiler, Configuration, Entry, EntryFunc } from '@debug-server-next/@types/webpack';

/**
 * inject entry to webpack config
 * @param options webpack config
 * @param entryName specific which entry will inject new files, will inject to all entries if not specific
 * @param prepends prepends those files to the head of original entry
 * @param appends appends those files to the end of original entry
 */
export const injectEntry = (
  compiler: Compiler,
  entryName?: string,
  prepends: string[] = [],
  appends: string[] = [],
): void => {
  const currentWebpack = (compiler as any).webpack || webpack;
  const { options } = compiler;
  if (!currentWebpack.version || currentWebpack.version.startsWith('4')) {
    injectEntryWebpack4(options, entryName, prepends, appends);
  } else {
    injectEntryWebpack5(options, entryName, prepends, appends);
  }
  compiler.hooks.entryOption.call(compiler.options.context, compiler.options.entry);
};

function injectEntryWebpack5(
  options: Compiler['options'],
  entryName?: string,
  prepends: string[] = [],
  appends: string[] = [],
): void {
  const entry: any = typeof options.entry === 'function' ? options.entry() : Promise.resolve(options.entry);

  options.entry = () =>
    entry.then((entryObj: any) => {
      function injectOneEntry(entryName: string) {
        const injectEntry: typeof entryObj[string] | undefined = entryObj[entryName];
        if (!injectEntry?.import) {
          throw new Error(
            `Could not find an entry named '${entryName}'. See https://webpack.js.org/concepts/entry-points/ for an overview of webpack entries.`,
          );
        }
        prepends.forEach((prepend) => {
          if (!injectEntry.import.includes(prepend)) injectEntry.import.unshift(prepend);
        });
        appends.forEach((append) => {
          if (!injectEntry.import.includes(append)) injectEntry.import.push(append);
        });
        return entryObj;
      }

      if (entryName) {
        injectOneEntry(entryName);
      } else {
        Object.keys(entryObj).forEach((entryName) => {
          injectOneEntry(entryName);
        });
      }
      return entryObj;
    });
}

function injectEntryWebpack4(
  options: Compiler['options'],
  entryName?: string,
  prepends: string[] = [],
  appends: string[] = [],
): void {
  function injectEntry(entry: Exclude<Configuration['entry'], EntryFunc>): string[] | Entry {
    switch (typeof entry) {
      case 'undefined': {
        throw new Error(
          `Could not find an entry named '${entryName}'. See https://webpack.js.org/concepts/entry-points/ for an overview of webpack entries.`,
        );
      }
      case 'string': {
        return [...prepends, entry, ...appends];
      }
      case 'object': {
        if (Array.isArray(entry)) {
          prepends.forEach((file) => {
            if (!entry.includes(file)) entry.unshift(file);
          });
          appends.forEach((file) => {
            if (!entry.includes(file)) entry.push(file);
          });
          return entry;
        }
        if (entryName) {
          return {
            ...entry,
            [entryName]: injectEntry(entry[entryName]) as unknown as string[],
          };
        }
        Object.keys(entry).forEach((key) => {
          entry[key] = injectEntry(entry[key]) as unknown as string[];
        });
        return entry;
      }
      default: {
        const _exhaust: never = entry;
        return _exhaust;
      }
    }
  }

  const { entry } = options;
  typeof entry === 'function'
    ? (options.entry = () => Promise.resolve(entry()).then(injectEntry))
    : (options.entry = () => injectEntry(entry));
}
