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

import { MiddleWare } from '@debug-server-next/middlewares';

/**
 * convert middleware array to one middleware
 */
export const composeMiddlewares = (middlewareList: MiddleWare[]): MiddleWare => {
  if (!Array.isArray(middlewareList)) throw new Error('middlewareList must by array');
  for (const fn of middlewareList) {
    if (typeof fn !== 'function') throw new Error('Middleware must by function');
  }

  return (context, next?) => {
    let lastMiddlewareIndex = -1;
    return dispatch(0);
    function dispatch(i: number) {
      if (i <= lastMiddlewareIndex) return Promise.reject(new Error('next() could not invoke multiple times'));
      lastMiddlewareIndex = i;
      let fn = middlewareList[i];
      if (i === middlewareList.length) fn = next;
      if (!fn) return Promise.resolve();
      try {
        return fn(context, dispatch.bind(null, i + 1));
      } catch (err) {
        return Promise.reject(err);
      }
    }
  };
};
