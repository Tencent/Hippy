/* global __resourceQuery, __webpack_hash__ */

import webpackHotLog from './hot/log';
import parseURL from './utils/parseURL';
import socket from './socket';
import { formatProblem, show, hide } from './overlay';
import { log, setLogLevel } from './utils/log';
import reloadApp from './utils/reloadApp';
import createSocketURL from './utils/createSocketURL';
import applyReload from './utils/apply-reload';

const status = {
  // TODO Workaround for webpack v4, `__webpack_hash__` is not replaced without HotModuleReplacement
  // eslint-disable-next-line camelcase
  currentHash: typeof __webpack_hash__ !== 'undefined' ? __webpack_hash__ : '',
};

const options = {
  hot: false,
  liveReload: false,
  progress: false,
  overlay: false,
};
const parsedResourceQuery = parseURL(__resourceQuery);
log.info('HMR', parsedResourceQuery);

if (parsedResourceQuery.hot === 'true') {
  options.hot = true;

  log.info('Hot Module Replacement enabled.');
}

if (parsedResourceQuery['live-reload'] === 'true') {
  options.liveReload = true;

  log.info('Live Reloading enabled.');
}

if (parsedResourceQuery.logging) {
  options.logging = parsedResourceQuery.logging;
}

if (typeof parsedResourceQuery.reconnect !== 'undefined') {
  options.reconnect = Number(parsedResourceQuery.reconnect);
}

function setAllLogLevel(level) {
  // This is needed because the HMR logger operate separately from dev server logger
  webpackHotLog.setLogLevel(level === 'verbose' || level === 'log' ? 'info' : level);
  setLogLevel(level);
}

if (options.logging) {
  setAllLogLevel(options.logging);
}

const onSocketMessage = {
  hot() {
    if (parsedResourceQuery.hot === 'false') {
      return;
    }

    options.hot = true;

    log.info('Hot Module Replacement enabled.');
  },
  liveReload() {
    if (parsedResourceQuery['live-reload'] === 'false') {
      return;
    }

    options.liveReload = true;

    log.info('Live Reloading enabled.');
  },
  invalid() {
    log.info('App updated. Recompiling...');

    // Fixes #1042. overlay doesn't clear if errors are fixed but warnings remain.
    if (options.overlay) {
      hide();
    }
  },
  hash(hash) {
    status.previousHash = status.currentHash;
    status.currentHash = hash;
  },
  logging: setAllLogLevel,
  overlay(value) {
    if (typeof document === 'undefined') {
      return;
    }

    options.overlay = value;
  },
  reconnect(value) {
    if (parsedResourceQuery.reconnect === 'false') {
      return;
    }

    options.reconnect = value;
  },
  progress(progress) {
    options.progress = progress;
  },
  'progress-update': function progressUpdate(data) {
    if (options.progress) {
      log.info(`${data.pluginName ? `[${data.pluginName}] ` : ''}${data.percent}% - ${data.msg}.`);
    }
  },
  'still-ok': function stillOk() {
    log.info('Nothing changed.');

    if (options.overlay) {
      hide();
    }
  },
  ok() {
    if (options.overlay) {
      hide();
    }

    reloadApp(options, status);
  },
  // TODO: remove in v5 in favor of 'static-changed'
  'content-changed': function contentChanged(file) {
    log.info(`${file ? `"${file}"` : 'Content'} from static directory was changed. Reloading...`);
    applyReload();
  },
  'static-changed': function staticChanged(file) {
    log.info(`${file ? `"${file}"` : 'Content'} from static directory was changed. Reloading...`);
    applyReload();
  },
  warnings(warnings, params) {
    log.warn('Warnings while compiling.');

    const printableWarnings = warnings.map((error) => {
      const { header, body } = formatProblem('warning', error);

      return `${header}\n${body}`;
    });

    for (let i = 0; i < printableWarnings.length; i++) {
      log.warn(printableWarnings[i]);
    }

    const needShowOverlayForWarnings =      typeof options.overlay === 'boolean'
      ? options.overlay
      : options.overlay && options.overlay.warnings;

    if (needShowOverlayForWarnings) {
      show('warning', warnings);
    }

    if (params && params.preventReloading) {
      return;
    }

    reloadApp(options, status);
  },
  errors(errors) {
    log.error('Errors while compiling. Reload prevented.');

    const printableErrors = errors.map((error) => {
      const { header, body } = formatProblem('error', error);

      return `${header}\n${body}`;
    });

    for (let i = 0; i < printableErrors.length; i++) {
      log.error(printableErrors[i]);
    }

    const needShowOverlayForErrors =      typeof options.overlay === 'boolean'
      ? options.overlay
      : options.overlay && options.overlay.errors;

    if (needShowOverlayForErrors) {
      show('error', errors);
    }
  },
  error(error) {
    log.error(error);
  },
  close() {
    log.info('Disconnected!');

    if (options.overlay) {
      hide();
    }
  },
};

const socketURL = createSocketURL(parsedResourceQuery);

global.startHMR = () => {
  socket(socketURL, onSocketMessage, options.reconnect);
};

// need delay for hippy WebSocket constructor mount to global object
setTimeout(() => {
  global.startHMR();
}, 1000);
