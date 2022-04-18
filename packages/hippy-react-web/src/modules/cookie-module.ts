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

import { canUseDOM } from '../utils';

/**
 * Get cookies from url
 *
 * @param {string} url - Specific url for cookie
 */
function getCookies(): Promise<string> {
  if (canUseDOM && document.cookie) {
    return Promise.resolve(document.cookie);
  }
  return Promise.resolve('');
}

/**
 * Set cookie to url
 *
 * @param {string} url - Specific url for cookie.
 * @param {string} keyValue - Cookie key and value string, split with `:`.
 * @param {Date|string} [expires] - UTC Date string or Date object for cookie expire.
 */
function setCookie(url: string, keyValue: string, expires: string | Date): void {
  const cookieList = keyValue.split(';');
  cookieList.forEach((cookie) => {
    let expireStr = '';
    if (typeof expires === 'string') {
      expireStr = expires;
    }
    if (expires instanceof Date) {
      expireStr = expires.toUTCString();
    }
    if (canUseDOM && document.cookie) {
      document.cookie = `${cookie}; expires=${expireStr};domain=${url}`;
    }
  });
}

export {
  getCookies,
  setCookie,
};
