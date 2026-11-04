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

import { patchProp } from '../../src/patch-prop';
import { nodeOps } from '../../src/node-ops';

describe('modules/style', () => {
  it('keeps v-show display writes updating native after inline style patches', () => {
    const element = nodeOps.createElement('div');
    const updateNative = jest.spyOn(element, 'updateNativeNode');
    const initialStyle = { width: 100 };
    patchProp(element, 'style', null, initialStyle);

    // Inline styles used to replace the display accessor, so v-show could
    // change the JS value without notifying native and leave a visible badge.
    updateNative.mockClear();
    element.style.display = 'none';
    expect(updateNative).toHaveBeenCalledTimes(1);

    const nextStyle = { backgroundColor: 'red' };
    patchProp(element, 'style', initialStyle, nextStyle);
    expect(element.style.display).toBe('none');
    expect(element.style.width).toBeUndefined();
    patchProp(element, 'style', nextStyle, null);
    expect(element.style.display).toBe('none');
    expect(element.style.backgroundColor).toBeUndefined();

    updateNative.mockClear();
    element.style.display = 'flex';
    expect(updateNative).toHaveBeenCalledTimes(1);
    updateNative.mockClear();
    element.style.display = 'none';
    expect(updateNative).toHaveBeenCalledTimes(1);
    updateNative.mockRestore();
  });

  it('resets removed inline display without losing subsequent native updates', () => {
    const element = nodeOps.createElement('div');
    const prevStyle = { display: 'none', width: 100 };
    patchProp(element, 'style', null, prevStyle);
    patchProp(element, 'style', prevStyle, { height: 50 });
    expect(element.style.display).toBeUndefined();
    expect(element.style.width).toBeUndefined();
    expect(element.style.height).toBe(50);

    const updateNative = jest.spyOn(element, 'updateNativeNode');
    element.style.display = 'none';
    expect(updateNative).toHaveBeenCalledTimes(1);
    updateNative.mockRestore();
  });

  it('clears normalized styles when replacing inline styles', () => {
    const element = nodeOps.createElement('div');
    const prevStyle = {
      backgroundImage: 'linear-gradient(to right, #ffffff, #000000)',
      boxShadowOpacity: 0.5,
      textShadowOffsetX: 20,
      textShadowOffsetY: 30,
    };
    patchProp(element, 'style', null, prevStyle);
    expect(element.style.linearGradient).toBeDefined();
    expect(element.style.shadowOpacity).toBe(0.5);
    expect(element.style.textShadowOffset).toEqual({ width: 20, height: 30 });

    // Source keys can map to different native keys or share a native object.
    // Replacing styles must not leave a gradient, shadow, or old offset behind.
    patchProp(element, 'style', prevStyle, { textShadowOffsetY: 10 });
    expect(element.style.linearGradient).toBeUndefined();
    expect(element.style.shadowOpacity).toBeUndefined();
    expect(element.style.textShadowOffset).toEqual({ height: 10 });
  });
});
