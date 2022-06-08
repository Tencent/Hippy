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

/* eslint-disable no-nested-ternary */
/* eslint-disable no-param-reassign */

/* eslint-disable-next-line import/no-extraneous-dependencies */
import Regexp from 'path-to-regexp';
import { cleanPath } from './util/path';
import { assert, warn } from './util/warn';

function compileRouteRegex(path, pathToRegexpOptions) {
  const regex = Regexp(path, [], pathToRegexpOptions);
  if (process.env.NODE_ENV !== 'production') {
    const keys = Object.create(null);
    regex.keys.forEach((key) => {
      warn(!keys[key.name], `Duplicate param keys in route with path: "${path}"`);
      keys[key.name] = true;
    });
  }
  return regex;
}

function normalizePath(path, parent, strict) {
  if (!strict) path = path.replace(/\/$/, '');
  if (path[0] === '/') return path;
  // eslint-disable-next-line eqeqeq
  if (parent == null) return path;
  return cleanPath(`${parent.path}/${path}`);
}

// #lizard forgives
function addRouteRecord(
  pathList,
  pathMap,
  nameMap,
  route,
  parent,
  matchAs,
) {
  const { path, name } = route;
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line eqeqeq
    assert(path != null, '"path" is required in a route configuration.');
    assert(
      typeof route.component !== 'string',
      `route config "component" for path: ${String(path || name)} cannot be a `
      + 'string id. Use an actual component instead.',
    );
  }

  const pathToRegexpOptions = route.pathToRegexpOptions || {};
  const normalizedPath = normalizePath(
    path,
    parent,
    pathToRegexpOptions.strict,
  );

  if (typeof route.caseSensitive === 'boolean') {
    pathToRegexpOptions.sensitive = route.caseSensitive;
  }

  const record = {
    path: normalizedPath,
    regex: compileRouteRegex(normalizedPath, pathToRegexpOptions),
    components: route.components || { default: route.component },
    instances: {},
    name,
    parent,
    matchAs,
    redirect: route.redirect,
    beforeEnter: route.beforeEnter,
    meta: route.meta || {},
    // eslint-disable-next-line eqeqeq
    props: route.props == null
      ? {}
      : route.components
        ? route.props
        : { default: route.props },
  };

  if (route.children) {
    // Warn if route is named, does not redirect and has a default child route.
    // If users navigate to this route by name, the default child will
    // not be rendered (GH Issue #629)
    if (process.env.NODE_ENV !== 'production') {
      if (route.name && !route.redirect && route.children.some(child => /^\/?$/.test(child.path))) {
        warn(
          false,
          `Named Route '${route.name}' has a default child route. `
          + `When navigating to this named route (:to="{name: '${route.name}'"), `
          + 'the default child route will not be rendered. Remove the name from '
          + 'this route and use the name of the default child route for named '
          + 'links instead.',
        );
      }
    }
    route.children.forEach((child) => {
      const childMatchAs = matchAs
        ? cleanPath(`${matchAs}/${child.path}`)
        : undefined;
      addRouteRecord(pathList, pathMap, nameMap, child, record, childMatchAs);
    });
  }

  if (route.alias !== undefined) {
    const aliases = Array.isArray(route.alias)
      ? route.alias
      : [route.alias];

    aliases.forEach((alias) => {
      const aliasRoute = {
        path: alias,
        children: route.children,
      };
      addRouteRecord(
        pathList,
        pathMap,
        nameMap,
        aliasRoute,
        parent,
        record.path || '/', // matchAs
      );
    });
  }

  if (!pathMap[record.path]) {
    pathList.push(record.path);
    pathMap[record.path] = record;
  }

  if (name) {
    if (!nameMap[name]) {
      nameMap[name] = record;
    } else if (process.env.NODE_ENV !== 'production' && !matchAs) {
      warn(
        false,
        'Duplicate named routes definition: '
        + `{ name: "${name}", path: "${record.path}" }`,
      );
    }
  }
}

function createRouteMap(routes, oldPathList, oldPathMap, oldNameMap) {
  // the path list is used to control path matching priority
  const pathList = oldPathList || [];
  // $flow-disable-line
  const pathMap = oldPathMap || Object.create(null);
  // $flow-disable-line
  const nameMap = oldNameMap || Object.create(null);
  routes.forEach((route) => {
    addRouteRecord(pathList, pathMap, nameMap, route);
  });
  // ensure wildcard routes are always at the end
  for (let i = 0, l = pathList.length; i < l; i += 1) {
    if (pathList[i] === '*') {
      pathList.push(pathList.splice(i, 1)[0]);
      l -= 1;
      i += 1;
    }
  }
  return {
    pathList,
    pathMap,
    nameMap,
  };
}

export default createRouteMap;
