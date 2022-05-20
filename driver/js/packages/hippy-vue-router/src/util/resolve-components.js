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

/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */

import { getVue } from '@vue/util/index';
import { once } from 'shared/util';
import { warn, isError } from './warn';

const hasSymbol = typeof Symbol === 'function'
  && typeof Symbol.toStringTag === 'symbol';

function isESModule(obj) {
  return obj.__esModule || (hasSymbol && obj[Symbol.toStringTag] === 'Module');
}

function flatten(arr) {
  return Array.prototype.concat.apply([], arr);
}

function flatMapComponents(matched, fn) {
  return flatten(matched.map(m => Object.keys(m.components).map(key => fn(
    m.components[key],
    m.instances[key],
    m, key,
  ))));
}

function resolveAsyncComponents(matched) {
  return (to, from, next) => {
    let hasAsync = false;
    let pending = 0;
    let error = null;

    flatMapComponents(matched, (def, _, match, key) => {
      // if it's a function and doesn't have cid attached,
      // assume it's an async component resolve function.
      // we are not using Vue's default async resolving mechanism because
      // we want to halt the navigation until the incoming component has been
      // resolved.
      if (typeof def === 'function' && def.cid === undefined) {
        hasAsync = true;
        pending += 1;

        const resolve = once((resolvedDef) => {
          const Vue = getVue();
          if (isESModule(resolvedDef)) {
            resolvedDef = resolvedDef.default;
          }
          // save resolved on async factory in case it's used elsewhere
          def.resolved = typeof resolvedDef === 'function'
            ? resolvedDef
            : Vue.extend(resolvedDef);
          match.components[key] = resolvedDef;
          pending -= 1;
          if (pending <= 0) {
            next();
          }
        });

        const reject = once((reason) => {
          const msg = `Failed to resolve async component ${key}: ${reason}`;
          if (process.env.NODE_ENV !== 'production') {
            warn(false, msg);
          }
          if (!error) {
            error = isError(reason)
              ? reason
              : new Error(msg);
            next(error);
          }
        });

        let res;
        try {
          res = def(resolve, reject);
        } catch (e) {
          reject(e);
        }
        if (res) {
          if (typeof res.then === 'function') {
            res.then(resolve, reject);
          } else {
            // new syntax in Vue 2.3
            const comp = res.component;
            if (comp && typeof comp.then === 'function') {
              comp.then(resolve, reject);
            }
          }
        }
      }
    });

    if (!hasAsync) next();
  };
}

export {
  flatten,
  flatMapComponents,
  resolveAsyncComponents,
};
