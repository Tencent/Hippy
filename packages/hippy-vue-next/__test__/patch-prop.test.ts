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

/**
 * patch-prop  Vue custom renderer patch prop unit case
 */
import { patchProp } from '../src/patch-prop';
import { nodeOps } from '../src/node-ops';

/**
 * @author birdguo
 * @priority P0
 * @casetype unit
 */
describe('patch-prop.ts', () => {
  it('patch class prop', () => {
    const element = nodeOps.createElement('div');
    patchProp(element, 'class', '', 'wrapper', false, undefined, null);
    expect(element.classList).toEqual(new Set().add('wrapper'));
    patchProp(element, 'class', 'wrapper', '', false, undefined, null);
    expect(element.classList).toEqual(new Set());
    patchProp(element, 'class', '', 'header', false, undefined, null);
    expect(element.classList).toEqual(new Set().add('header'));
    patchProp(element, 'class', '', null, false, undefined, null);
    expect(element.classList).toEqual(new Set());
  });

  it('patch style prop', () => {
    const element = nodeOps.createElement('div');
    expect(element.style).toEqual({ display: undefined });
    patchProp(element, 'style', {}, { width: '100px', height: 200 }, false, undefined, null);
    expect(element.style).toEqual({
      width: 100,
      height: 200,
      display: undefined,
    });
    patchProp(element, 'style', {}, { width: undefined, height: undefined }, false, undefined, null);
    expect(element.style).toEqual({
      display: undefined,
    });
  });

  it('patch event prop', () => {
    const element = nodeOps.createElement('div');
    const noop = () => {};
    patchProp(element, 'onClick', null, noop, false, undefined, null);
    let listeners = element.getEventListenerList();
    expect(listeners?.click?.[0].callback).toBeDefined();
    patchProp(element, 'onClick', null, null, false, undefined, null);
    listeners = element.getEventListenerList();
    expect(listeners?.click).toBeUndefined();
  });

  it('patch attribute prop', () => {
    const element = nodeOps.createElement('div');
    patchProp(element, 'source', '', 'inner', false, undefined, null);
    expect(element.attributes.source).toEqual('inner');
    patchProp(element, 'source', 'inner', '', false, undefined, null);
    expect(element.attributes.source).toEqual('');
    patchProp(element, 'source', 'inner', undefined, false, undefined, null);
    expect(element.attributes.source).toBeUndefined();
  });
});
