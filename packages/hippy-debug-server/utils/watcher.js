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
