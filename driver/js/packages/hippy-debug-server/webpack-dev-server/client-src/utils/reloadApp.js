import hotEmitter from '../hot/emitter';
import { log } from './log';
import applyReload from './apply-reload';

function reloadApp({ hot, liveReload }, status) {
  const { currentHash, previousHash } = status;
  const isInitial = currentHash.indexOf(previousHash) >= 0;

  if (isInitial) return;

  if (hot) {
    log.info('App hot update...');
    hotEmitter.emit('webpackHotUpdate', status.currentHash);
  } else if (liveReload) {
    applyReload();
  }
}

export default reloadApp;
