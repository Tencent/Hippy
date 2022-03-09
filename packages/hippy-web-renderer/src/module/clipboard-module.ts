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

import { callbackToHippy } from '../common';
import { HippyWebModule } from '../base';

export class ClipboardModule extends HippyWebModule {
  public static moduleName = 'ClipboardModule';


  public destroy() {
  }

  public initialize() {
  }

  public getString(callBackId: number) {
    let data = '';
    if (!!(window?.navigator?.clipboard)) {
      window.navigator.clipboard.readText().then((text) => {
        data = text;
      }, () => {
        console.warn('get clipboard failed');
      })
        .finally(() => {
          callbackToHippy(callBackId, data, true, 'getString', ClipboardModule.moduleName);
        });
    }
  }

  public setString(callBackId: number, value: string) {
    if (!!(window?.navigator?.clipboard)) {
      window.navigator.clipboard.writeText(value).then(null, () => {
        console.warn('set clipboard failed');
      });
    }
    if (!!(document?.queryCommandSupported && document?.queryCommandSupported('copy'))) {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.style.position = 'fixed';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
      } catch {
        console.warn('set clipboard failed');
      } finally {
        document.body.removeChild(textarea);
      }
    }
  }
}
