/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2022 THL A29 Limited, a Tencent company.
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

import { HippyListElement } from '../../../src/runtime/element/hippy-list-element';
import { Native } from '../../../src/runtime/native/index';

/**
 * hippy-list-element.ts unit test case
 */
describe('runtime/element/hippy-list-element', () => {
  it('should invoke callUIFunction when call scrollToIndex method.', () => {
    const callUIFunctionSpy = jest.spyOn(Native, 'callUIFunction');
    const hippyListElement = new HippyListElement('ul');
    hippyListElement.scrollToIndex(0, 0);
    expect(callUIFunctionSpy).toHaveBeenCalled();
  });

  it('should invoke callUIFunction when call scrollToPosition method.', () => {
    const callUIFunctionSpy = jest.spyOn(Native, 'callUIFunction');
    const hippyListElement = new HippyListElement('ul');
    hippyListElement.scrollToPosition();
    expect(callUIFunctionSpy).toHaveBeenCalled();
  });
});
