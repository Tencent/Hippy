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
import type { NeedToTyped } from '../../types';
import { Native } from '../native';

import { HippyElement } from './hippy-element';

/**
 * Hippy input element, such as input, textarea
 *
 * @public
 */
export class HippyInputElement extends HippyElement {
  /**
   * set text content of input element
   *
   * @param text - text content
   * @param options - options
   */
  public setText(text: string, options: NeedToTyped = {}): void {
    if (this.tagName === 'textarea') {
      // for textarea, set the value attribute
      this.setAttribute('value', text, { notToNative: !!options.notToNative });
    } else {
      // for other input element, set the text attribute
      this.setAttribute('text', text, { notToNative: !!options.notToNative });
    }
  }

  /**
   * get value of input element
   */
  public async getValue(): Promise<string> {
    return new Promise(resolve => Native.callUIFunction(this, 'getValue', (r: { text: string }) => resolve(r.text)));
  }

  /**
   * set value of input element
   */
  public setValue(value: string): void {
    Native.callUIFunction(this, 'setValue', [value]);
  }

  /**
   * get the focus
   */
  public focus(): void {
    Native.callUIFunction(this, 'focusTextInput', []);
  }

  /**
   * make the element lose focus
   */
  public blur(): void {
    Native.callUIFunction(this, 'blurTextInput', []);
  }

  /**
   * clear content
   */
  public clear(): void {
    Native.callUIFunction(this, 'clear', []);
  }

  /**
   * get text input focus status
   */
  public async isFocused(): Promise<boolean> {
    return new Promise(resolve => Native.callUIFunction(this, 'isFocused', r => resolve(r.value)));
  }
}
