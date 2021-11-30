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

import Native from '../runtime/native';
import ElementNode from './element-node';

/**
 * Input and Textarea Element
 */
class InputNode extends ElementNode {
  /**
   * Get text input value
   */
  getValue() {
    return new Promise(resolve => Native.callUIFunction(this, 'getValue', r => resolve(r.text)));
  }

  /**
   * Set text input value
   */
  setValue(value) {
    Native.callUIFunction(this, 'setValue', [value]);
  }


  /**
   * Focus
   */
  focus() {
    Native.callUIFunction(this, 'focusTextInput', []);
  }

  /**
   * Blur
   */
  blur() {
    Native.callUIFunction(this, 'blurTextInput', []);
  }

  /**
   * Clear
   */
  clear() {
    Native.callUIFunction(this, 'clear', []);
  }

  /**
   * Show input method selection dialog.
   */
  showInputMethod() {
    Native.callUIFunction(this, 'showInputMethod', []);
  }

  /**
   * hideInputMethod
   */
  hideInputMethod() {
    Native.callUIFunction(this, 'hideInputMethod', []);
  }
}

export default InputNode;
