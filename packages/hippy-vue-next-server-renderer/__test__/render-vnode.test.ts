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
import { h, defineComponent, createSSRApp } from 'vue';
import * as vueRuntimeCore from '@vue/runtime-core';
import { renderComponentVNode, SSRBuffer } from '../src/render-vnode';
import { SSR_UNIQUE_ID_KEY } from '../src/renderer';
import { getObjectNodeList } from '../src/util';

let globalApp;
jest.spyOn(vueRuntimeCore, 'getCurrentInstance').mockImplementation(() => ({
  ...globalApp,
  appContext: globalApp._context,
}));

/**
 * @author birdguo
 * @priority P0
 * @casetype unit
 */
describe('render-vnode.ts', () => {
  beforeAll(() => {
    const startUniqueId = 1;
    const uniqueIdContext = { ssrUniqueId: startUniqueId };
    globalApp = createSSRApp({
      template: '<div></div>',
    });
    // An additional context needs to be provided here because ssrContext is mounted after
    // the render function is called, but ssrGetUniqueId will be called in the render function
    globalApp.provide(SSR_UNIQUE_ID_KEY, uniqueIdContext);
  });
  describe('renderComponentVNode should work correctly', () => {
    it('render div tag', async () => {
      // root component
      const rootComp = defineComponent({
        render: () => h('div', {
          id: 'app',
          class: 'wrapper',
          onClick: () => {},
        }),
      });
      // create vnode
      const rootVNode = h(rootComp);
      // render component vnode
      const nodeString = renderComponentVNode(rootVNode) as SSRBuffer;
      let ssrNodeTree = null;
      if (nodeString?.length) {
        ssrNodeTree = getObjectNodeList(nodeString[0] as string);
      }
      expect(ssrNodeTree).toEqual({ id: 2, index: 0, name: 'View', tagName: 'div', props: { id: 'app', class: 'wrapper', onClick: true } });
    });
  });
});
