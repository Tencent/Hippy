/* eslint-disable-next-line import/no-extraneous-dependencies */
import Regexp from 'path-to-regexp';
import { warn } from './warn';

// $flow-disable-line
const regexpCompileCache  = Object.create(null);

function fillParams(path, params, routeMsg) {
  try {
    const filler =      regexpCompileCache[path]
      || (regexpCompileCache[path] = Regexp.compile(path));
    return filler(params || {}, { pretty: true });
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      warn(false, `missing param for ${routeMsg}: ${e.message}`);
    }
    return '';
  }
}

export default fillParams;
