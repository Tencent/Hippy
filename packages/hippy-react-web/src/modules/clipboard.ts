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

import { canUseClipboard, canUseDOM, canUseCopyCommand, warn } from '../utils';

const Clipboard = {
  getString() {
    return new Promise((resolve) => {
      if (canUseClipboard) {
        window.navigator.clipboard.readText().then((text) => {
          resolve(text);
        }, () => {
          warn('Clipboard getString is unsupported');
          resolve('');
        });
      } else {
        warn('Clipboard getString is unsupported');
        resolve('');
      }
    });
  },
  setString(text: string): Promise<void> {
    const setStringNotSupportWarn = () => {
      warn('Clipboard setString is unsupported');
    };
    return new Promise((resolve) => {
      if (canUseClipboard) {
        window.navigator.clipboard.writeText(text).then(() => {
          resolve();
        }, () => {
          setStringNotSupportWarn();
          resolve();
        });
      } else if (canUseDOM && canUseCopyCommand) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          resolve();
        } catch {
          setStringNotSupportWarn();
          resolve();
        } finally {
          document.body.removeChild(textarea);
        }
      } else {
        setStringNotSupportWarn();
        resolve();
      }
    });
  },
};

export default Clipboard;
