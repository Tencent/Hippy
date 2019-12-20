/* eslint-disable no-underscore-dangle */

import fillParams from './params';
import { parsePath, resolvePath } from './path';
import { resolveQuery } from './query';
import { warn } from './warn';

function normalizeLocation(raw, current, append, router) {
  let next = typeof raw === 'string' ? { path: raw } : raw;
  // named target
  if (next.name || next._normalized) {
    return next;
  }

  // relative params
  if (!next.path && next.params && current) {
    next = { ...next };
    next._normalized = true;
    const params      = { ...current.params, ...next.params };
    if (current.name) {
      next.name = current.name;
      next.params = params;
    } else if (current.matched.length) {
      const rawPath = current.matched[current.matched.length - 1].path;
      next.path = fillParams(rawPath, params, `path ${current.path}`);
    } else if (process.env.NODE_ENV !== 'production') {
      warn(false, 'relative params navigation requires a current route.');
    }
    return next;
  }

  const parsedPath = parsePath(next.path || '');
  const basePath = (current && current.path) || '/';
  const path = parsedPath.path
    ? resolvePath(parsedPath.path, basePath, append || next.append)
    : basePath;

  const query = resolveQuery(
    parsedPath.query,
    next.query,
    router && router.options.parseQuery,
  );

  let hash = next.hash || parsedPath.hash;
  if (hash && hash.charAt(0) !== '#') {
    hash = `#${hash}`;
  }

  return {
    _normalized: true,
    path,
    query,
    hash,
  };
}

export default normalizeLocation;
