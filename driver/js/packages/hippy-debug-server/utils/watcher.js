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

const chokidar = require('chokidar');

class Watcher {
  constructor(options) {
    this.options = options;
  }
  /**
   * start to watch
   * @returns {Promise<watcher>}
   */
  async start() {
    const { options } = this;
    return new Promise((resolve, reject) => {
      let ignored = options.watchIgnore;
      const defaultIgnored = [/node_modules/, '**/.*'];
      if (!ignored) {
        ignored = defaultIgnored;
      } else {
        ignored = defaultIgnored.concat(ignored);
      }
      this.watchFileThrottling = {};
      // Initialize watcher
      const watcher = chokidar.watch(options.watchDir || options.context, {
        interval: 800, // Interval of file system polling, set 800ms
        persistent: true,
        ignoreInitial: true,
        ignored,
      });
      // Listen watcher events
      watcher.on('add', filepath => this.watchFileThrottle(filepath, this.options.onFileAdded));
      watcher.on('change', filepath => this.watchFileThrottle(filepath, this.options.onFileChanged));
      watcher.on('unlink', filepath => this.watchFileThrottle(filepath, this.options.onFileDeleted));
      watcher.on('ready', () => {
        resolve(watcher);
      });
      watcher.on('error', reject);
    });
  }

  /**
   * throttle for watch file diff
   * @param filepath
   * @param cb
   */
  watchFileThrottle(filepath, cb) {
    const time = Date.now();
    if (
      !this.watchFileThrottling[filepath]
      || time - this.watchFileThrottling[filepath] > 300
    ) {
      this.watchFileThrottling[filepath] = time;
      cb(filepath);
    }
  }
}

module.exports = Watcher;
