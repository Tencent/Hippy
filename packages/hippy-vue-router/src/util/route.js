/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */

import { stringifyQuery } from './query';

const trailingSlashRE = /\/?$/;

function clone(value) {
  if (Array.isArray(value)) {
    return value.map(clone);
  }
  if (value && typeof value === 'object') {
    const res = {};
    Object.keys(value).forEach((key) => {
      res[key] = clone(value[key]);
    });
    return res;
  }
  return value;
}

function formatMatch(record) {
  const res = [];
  while (record) {
    res.unshift(record);
    record = record.parent;
  }
  return res;
}

function getFullPath({ path, query = {}, hash = '' }, _stringifyQuery) {
  const stringify = _stringifyQuery || stringifyQuery;
  return (path || '/') + stringify(query) + hash;
}

function isObjectEqual(a = {}, b = {}) {
  // handle null value #1566
  if (!a || !b) return a === b;
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) {
    return false;
  }
  return aKeys.every((key) => {
    const aVal = a[key];
    const bVal = b[key];
    // check nested equality
    if (typeof aVal === 'object' && typeof bVal === 'object') {
      return isObjectEqual(aVal, bVal);
    }
    return String(aVal) === String(bVal);
  });
}

export function createRoute(record, location, redirectedFrom, router) {
  let stringifyQueryStr;
  if (router) {
    ({ stringifyQuery: stringifyQueryStr } = router.options);
  }

  let query = location.query || {};
  try {
    query = clone(query);
  } catch (e) {
    // pass
  }

  const route = {
    name: location.name || (record && record.name),
    meta: (record && record.meta) || {},
    path: location.path || '/',
    hash: location.hash || '',
    query,
    params: location.params || {},
    fullPath: getFullPath(location, stringifyQueryStr),
    matched: record ? formatMatch(record) : [],
  };
  if (redirectedFrom) {
    route.redirectedFrom = getFullPath(redirectedFrom, stringifyQueryStr);
  }
  return Object.freeze(route);
}

function queryIncludes(current, target) {
  for (const key in target) {
    if (!(key in current)) {
      return false;
    }
  }
  return true;
}

// the starting route that represents the initial state
const START = createRoute(null, {
  path: '/',
});

function isSameRoute(a, b) {
  if (b === START) {
    return a === b;
  } if (!b) {
    return false;
  } if (a.path && b.path) {
    return (
      a.path.replace(trailingSlashRE, '') === b.path.replace(trailingSlashRE, '')
      && a.hash === b.hash
      && isObjectEqual(a.query, b.query)
    );
  } if (a.name && b.name) {
    return (
      a.name === b.name
      && a.hash === b.hash
      && isObjectEqual(a.query, b.query)
      && isObjectEqual(a.params, b.params)
    );
  }
  return false;
}

function isIncludedRoute(current, target) {
  return (
    current.path.replace(trailingSlashRE, '/').indexOf(
      target.path.replace(trailingSlashRE, '/'),
    ) === 0
    && (!target.hash || current.hash === target.hash)
    && queryIncludes(current.query, target.query)
  );
}

export {
  START,
  isSameRoute,
  isIncludedRoute,
};
