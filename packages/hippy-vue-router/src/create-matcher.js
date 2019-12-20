/* eslint-disable no-use-before-define */
/* eslint-disable no-shadow */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */

import { resolvePath } from './util/path';
import { assert, warn } from './util/warn';
import { createRoute } from './util/route';
import fillParams from './util/params';
import normalizeLocation from './util/location';
import createRouteMap from './create-route-map';

function createMatcher(routes, router) {
  const { pathList, pathMap, nameMap } = createRouteMap(routes);

  function addRoutes(rs) {
    createRouteMap(rs, pathList, pathMap, nameMap);
  }

  function match(raw, currentRoute, redirectedFrom) {
    const location = normalizeLocation(raw, currentRoute, false, router);
    const { name } = location;

    if (name) {
      const record = nameMap[name];
      if (process.env.NODE_ENV !== 'production') {
        warn(record, `Route with name '${name}' does not exist`);
      }
      if (!record) return _createRoute(null, location);
      const paramNames = record.regex.keys
        .filter(key => !key.optional)
        .map(key => key.name);

      if (typeof location.params !== 'object') {
        location.params = {};
      }

      if (currentRoute && typeof currentRoute.params === 'object') {
        Object.keys(currentRoute.params).forEach((key) => {
          if (!(key in location.params) && paramNames.indexOf(key) > -1) {
            location.params[key] = currentRoute.params[key];
          }
        });
      }

      if (record) {
        location.path = fillParams(record.path, location.params, `named route "${name}"`);
        return _createRoute(record, location, redirectedFrom);
      }
    } else if (location.path) {
      location.params = {};
      for (let i = 0; i < pathList.length; i += 1) {
        const path = pathList[i];
        const record = pathMap[path];
        if (matchRoute(record.regex, location.path, location.params)) {
          return _createRoute(record, location, redirectedFrom);
        }
      }
    }
    // no match
    return _createRoute(null, location);
  }

  function redirect(record, location) {
    const originalRedirect = record.redirect;
    let redirect = typeof originalRedirect === 'function'
      ? originalRedirect(createRoute(record, location, null, router))
      : originalRedirect;

    if (typeof redirect === 'string') {
      redirect = { path: redirect };
    }

    if (!redirect || typeof redirect !== 'object') {
      if (process.env.NODE_ENV !== 'production') {
        warn(
          false, `invalid redirect option: ${JSON.stringify(redirect)}`,
        );
      }
      return _createRoute(null, location);
    }

    const re = redirect;
    const { name, path } = re;
    let { query, hash, params } = location;
    query = Object.prototype.hasOwnProperty.call(re, 'query') ? re.query : query;
    hash = Object.prototype.hasOwnProperty.call(re, 'hash') ? re.hash : hash;
    params = Object.prototype.hasOwnProperty.call(re, 'params') ? re.params : params;

    if (name) {
      // resolved named direct
      const targetRecord = nameMap[name];
      if (process.env.NODE_ENV !== 'production') {
        assert(targetRecord, `redirect failed: named route "${name}" not found.`);
      }
      return match({
        _normalized: true,
        name,
        query,
        hash,
        params,
      }, undefined, location);
    } if (path) {
      // 1. resolve relative redirect
      const rawPath = resolveRecordPath(path, record);
      // 2. resolve params
      const resolvedPath = fillParams(rawPath, params, `redirect route with path "${rawPath}"`);
      // 3. rematch with existing query and hash
      return match({
        _normalized: true,
        path: resolvedPath,
        query,
        hash,
      }, undefined, location);
    }
    if (process.env.NODE_ENV !== 'production') {
      warn(false, `invalid redirect option: ${JSON.stringify(redirect)}`);
    }
    return _createRoute(null, location);
  }

  function alias(record, location, matchAs) {
    const aliasedPath = fillParams(matchAs, location.params, `aliased route with path "${matchAs}"`);
    const aliasedMatch = match({
      _normalized: true,
      path: aliasedPath,
    });
    if (aliasedMatch) {
      const { matched } = aliasedMatch;
      const aliasedRecord = matched[matched.length - 1];
      location.params = aliasedMatch.params;
      return _createRoute(aliasedRecord, location);
    }
    return _createRoute(null, location);
  }

  function _createRoute(record, location, redirectedFrom) {
    if (record && record.redirect) {
      return redirect(record, redirectedFrom || location);
    }
    if (record && record.matchAs) {
      return alias(record, location, record.matchAs);
    }
    return createRoute(record, location, redirectedFrom, router);
  }

  return {
    match,
    addRoutes,
  };
}

function matchRoute(regex, path, params) {
  const m = path.match(regex);

  if (!m) {
    return false;
  } if (!params) {
    return true;
  }

  for (let i = 1, len = m.length; i < len; i += 1) {
    const key = regex.keys[i - 1];
    const val = typeof m[i] === 'string' ? decodeURIComponent(m[i]) : m[i];
    if (key) {
      // Fix #1994: using * with props: true generates a param named 0
      params[key.name || 'pathMatch'] = val;
    }
  }

  return true;
}

function resolveRecordPath(path, record) {
  return resolvePath(path, record.parent ? record.parent.path : '/', true);
}

export default createMatcher;
