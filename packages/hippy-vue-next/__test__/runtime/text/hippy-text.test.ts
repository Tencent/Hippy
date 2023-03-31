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

import { HippyText } from '../../../src/runtime/text/hippy-text';
import { HippyElement } from '../../../src/runtime/element/hippy-element';

/**
 * hippy-text.ts unit test case
 */
describe('runtime/text/hippy-text.ts', () => {
  it('hippy text node should set correct attribute', () => {
    const textNode = new HippyText('hello');
    expect(textNode.text).toEqual('hello');
    expect(textNode.data).toEqual('hello');
    textNode.setText('world');
    expect(textNode.text).toEqual('world');
  });

  it('append text node will set parent node text value', () => {
    const elementNode = new HippyElement('div');
    const textNode = new HippyText('hello');
    const textNodeTwo = new HippyText('world');

    expect(textNode.text).toEqual('hello');
    expect(elementNode.attributes.text).toBeUndefined();

    elementNode.appendChild(textNode);
    expect(elementNode.attributes.text).toEqual('hello');
    elementNode.insertBefore(textNodeTwo, null);
    expect(elementNode.attributes.text).toEqual('world');
    elementNode.moveChild(textNode, textNodeTwo);
    expect(elementNode.attributes.text).toEqual('hello');
    elementNode.removeChild(textNode);
    expect(elementNode.attributes.text).toEqual('');
  });
});
