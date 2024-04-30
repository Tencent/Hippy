/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

export const getGlobal = (): typeof globalThis => {
  let win;
  if (typeof window !== 'undefined') {
    win = window;
  } else if (typeof global !== 'undefined') {
    win = global;
  } else if (typeof self !== 'undefined') {
    win = self;
  } else {
    win = {} as any;
  }
  return win;
};

export function isIos() {
  return /.*?(iPad|iPhone|iPod).*/.test(getGlobal().navigator.userAgent);
}
export function iOSVersion() {
  const versions = getGlobal().navigator.userAgent.toLowerCase().
    match(/cpu iphone os (.*?) like mac os/);
  if (versions && versions.length > 1) {
    try {
      const iOSV = versions[1].split('_');
      if (!isNaN(Number(iOSV[0]))) {
        return parseInt(iOSV[0], 10);
      }
    } catch (e) {
      console.error(e);
    }
  }
  return null;
}

export default getGlobal();
