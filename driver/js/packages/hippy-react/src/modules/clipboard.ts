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

import { Bridge } from '../global';

/**
 * The the string contents from clipboard
 */
function getString(): Promise<string> {
  return Bridge.callNativeWithPromise('ClipboardModule', 'getString');
}

/**
 * Set the string content to clipboard
 *
 * @param {string} text - The string content that will set into clipboard.
 */
function setString(text: string): void {
  Bridge.callNative('ClipboardModule', 'setString', text);
}

export {
  getString,
  setString,
};
