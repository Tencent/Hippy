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
import { createSSRApp } from 'vue';
import * as vueServerRender from '@vue/server-renderer';
import * as vueRuntimeCore from '@vue/runtime-core';
import { renderToHippyList, ssrGetUniqueId, getCurrentUniqueId } from '../src';
import { SSR_UNIQUE_ID_KEY } from '../src/renderer';

jest.spyOn(vueServerRender, 'renderToString').mockImplementation((app, options) => {
  if (options?.isError) {
    return Promise.resolve('');
  }
  const nodeString = '{"id":2,"name":"View","props":{},"children":['
    + '{"id":3,"name":"Text","props":{"text":"hello"},},'
    + '{"id":4,"name":"ViewPager","props":{"attributes":{"class":"wrapper"}},"children":['
    + '{"id":5,"name":"ViewPagerItem","props":{"attributes":{"id":"root-item"}}},],},'
    + '{"id":-1,"name":"comment","props":{},},'
    + '{"id":6,"name":"WebView","props":{}},'
    + '{"id":7,"name":"Modal","props":{}},'
    + '{"id":8,"name":"TextInput","props":{}},'
    + '{"id":9,"name":"ListView","props":{}},'
    + '],}';
  return Promise.resolve(nodeString);
});
let globalApp;
jest.spyOn(vueRuntimeCore, 'getCurrentInstance').mockImplementation(() => ({
  ...globalApp,
  appContext: globalApp._context,
}));

describe('renderer.ts', () => {
  describe('uniqueId logic test', () => {
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
    it('ssrGetUniqueId & getCurrentUniqueId should work correctly', () => {
      expect(getCurrentUniqueId(globalApp)).toEqual(1);
      expect(ssrGetUniqueId()).toEqual(2);
      expect(ssrGetUniqueId()).toEqual(3);
      expect(ssrGetUniqueId()).toEqual(4);
      expect(ssrGetUniqueId()).toEqual(5);
      expect(getCurrentUniqueId(globalApp)).toEqual(5);
      expect(ssrGetUniqueId()).toEqual(6);
      expect(ssrGetUniqueId()).toEqual(7);
      expect(ssrGetUniqueId()).toEqual(8);
      expect(ssrGetUniqueId()).toEqual(9);
      expect(ssrGetUniqueId()).toEqual(11);
      expect(getCurrentUniqueId(globalApp)).toEqual(11);
    });
  });
  describe('renderToHippyList should work correctly', () => {
    let ssrContext;
    beforeEach(() => {
      ssrContext = {
        rootContainer: 'root',
      };
    });
    it('render error', async () => {
      const app = createSSRApp({
        template: '',
      });
      const result = await renderToHippyList(app, {
        ...ssrContext,
        isError: true,
      });
      expect(result).toBeNull();
    });
    it('render node list', async () => {
      const app = createSSRApp({
        template: '',
      });
      const result = await renderToHippyList(app, ssrContext);
      const [
        rootNode,
        divNode,
        textNode,
        ulNode,
        liNode,
        webviewNode,
        modalNode,
        inputNode,
        listNode,
        commentNode,
      ] = result!;
      expect(rootNode.id).toEqual(1);
      expect(rootNode.pId).toEqual(0);
      expect(rootNode.props).toEqual({ style: { flex: 1 }, attributes: { id: 'root', class: '' } });
      expect(divNode.pId).toEqual(1);
      expect(divNode.props).toEqual({ attributes: { id: '', class: '' } });
      expect(textNode.pId).toEqual(2);
      expect(textNode.props).toEqual({ attributes: { id: '', class: '' }, text: 'hello' });
      expect(ulNode.pId).toEqual(2);
      expect(ulNode.index).toEqual(1);
      expect(ulNode.props).toEqual({ attributes: { id: '', class: 'wrapper' }, initialPage: undefined });
      expect(liNode.pId).toEqual(4);
      expect(liNode.props).toEqual({ attributes: { id: 'root-item', class: '' } });
      expect(commentNode.pId).toEqual(2);
      expect((commentNode.index)).toEqual(2);
      expect(webviewNode.pId).toEqual(2);
      expect(webviewNode.props).toEqual({ method: 'get', userAgent: '', attributes: { id: '', class: '' } });
      expect(inputNode.pId).toEqual(2);
      expect(inputNode.props.underlineColorAndroid).toEqual(0);
      expect(modalNode.pId).toEqual(2);
      expect(modalNode.props).toEqual({ collapsable: false, immersionStatusBar: true, transparent: true, attributes: { id: '', class: '' } });
      expect(listNode.pId).toEqual(2);
      expect(listNode.props.numberOfRows).toEqual(0);
    });
  });
});
