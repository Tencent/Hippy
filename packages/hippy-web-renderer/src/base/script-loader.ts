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

export function scriptLoader(scripts: string[]) {
  return new Promise<void>((resolve) => {
    let count = scripts.length;

    function urlCallback() {
      return function () {
        count = count - 1;
        if (count < 1) {
          resolve();
        }
      };
    }

    function loadScript(url) {
      const s = document.createElement('script');
      s.setAttribute('src', url);
      s.onload = urlCallback();
      document.body.appendChild(s);
    }

    for (const script of scripts) {
      loadScript(script);
    }
  });
}
