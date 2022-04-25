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

import { throttle as lodashThrottle } from 'lodash';

export const throttle = (
  fn: Function,
  wait: number,
  option = {
    leading: true,
    trailing: false,
  },
) => {
  const throttled = lodashThrottle(
    async (...args) => {
      const AsyncFunction = (async () => {}).constructor;
      if (fn instanceof AsyncFunction) {
        await fn(...args);
      } else {
        fn(...args);
      }

      return Date.now();
    },
    wait,
    option,
  );

  let prevTs;
  let currTs;
  let isThrottled;
  const thunk = (...args) => {
    currTs = throttled(...args);
    isThrottled = prevTs === currTs;
    prevTs = currTs;
  };

  return {
    throttledFn: thunk,
    isThrottled: () => isThrottled,
  };
};
