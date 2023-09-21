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
  const nodeString = '{"id":2,"name":"View","props":{"caret-color":"gray","underline-color-android":"gray","placeholder-text-color":"gray","break-strategy":"simple","onTouchStart":true,"onTouchstart":true,"onTouchMove":true,"onTouchend":true,"onTouchcancel":true},"children":['
    + '{"id":3,"name":"Text","props":{"text":"hello", "style": {"fontWeight":100}},},'
    + '{"id":4,"name":"ViewPager","props":{"attributes":{"class":"wrapper"},"onDropped":true,"onDragging":true,"onStateChanged":true},"children":['
    + '{"id":5,"name":"ViewPagerItem","props":{"attributes":{"id":"root-item"}}},],},'
    + '{"id":-1,"name":"comment","props":{},},'
    + '{"id":6,"name":"WebView","props":{"src":"https://hippyjs.org"}},'
    + '{"id":7,"name":"Modal","props":{}},'
    + '{"id":8,"name":"TextInput","props":{"onChange":true,"onSelect":true, "placeholder": 100, "maxlength": 5, "value": "123", "disabled": true, "type": "search"}},'
    + '{"id":9,"name":"ListView","props":{"onListReady":true,"onEndReached":true}},'
    + '],}';
  return Promise.resolve(nodeString);
});
let globalApp;
jest.spyOn(vueRuntimeCore, 'getCurrentInstance').mockImplementation(() => ({
  ...globalApp,
  appContext: globalApp._context,
}));

/**
 * renderer.ts unit test case
 */
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
    it('render root node', async () => {
      const app = createSSRApp({
        template: '',
      });
      const result = await renderToHippyList(app, {
        ...ssrContext,
        isError: true,
      });
      expect(result).toEqual([{ id: 1, index: 0, name: 'View', pId: 0, props: { attributes: { class: '', id: 'root' }, style: { flex: 1 } }, tagName: 'div' }]);
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
        swiperNode,
        swiperItemNode,
        webviewNode,
        modalNode,
        inputNode,
        ulNode,
        commentNode,
      ] = result!;
      expect(rootNode.id).toEqual(1);
      expect(rootNode.pId).toEqual(0);
      expect(rootNode.props).toEqual({ style: { flex: 1 }, attributes: { id: 'root', class: '' } });
      expect(divNode.pId).toEqual(1);
      expect(divNode.props).toEqual({ attributes: { id: '', class: '' }, caretColor: 'gray', underlineColorAndroid: 'gray', placeholderTextColor: 'gray', breakStrategy: 'simple', onTouchCancel: true, onTouchDown: true, onTouchEnd: true, onTouchMove: true });
      expect(textNode.pId).toEqual(2);
      expect(textNode.props).toEqual({ attributes: { id: '', class: '' }, text: 'hello', style: { fontWeight: '100' } });
      expect(swiperNode.pId).toEqual(2);
      expect(swiperNode.index).toEqual(1);
      expect(swiperNode.props).toEqual({ attributes: { id: '', class: 'wrapper' }, initialPage: undefined, onPageSelected: true, onPageScroll: true, onPageScrollStateChanged: true });
      expect(swiperItemNode.pId).toEqual(4);
      expect(swiperItemNode.props).toEqual({ attributes: { id: 'root-item', class: '' } });
      expect(commentNode.pId).toEqual(2);
      expect((commentNode.index)).toEqual(2);
      expect(webviewNode.pId).toEqual(2);
      expect(webviewNode.props).toEqual({ method: 'get', source: { uri: 'https://hippyjs.org' }, userAgent: '', attributes: { id: '', class: '' } });
      expect(inputNode.pId).toEqual(2);
      expect(inputNode.props).toEqual({
        attributes: { id: '', class: '' },
        underlineColorAndroid: 0,
        changeText: true,
        selectionChange: true,
        placeholder: '100',
        multiline: false,
        numberOfLines: 1,
        maxLength: 5,
        defaultValue: '123',
        editable: false,
        keyboardType: 'web-search',
      });
      expect(modalNode.pId).toEqual(2);
      expect(modalNode.props).toEqual({ collapsable: false, immersionStatusBar: true, transparent: true, attributes: { id: '', class: '' } });
      expect(ulNode.pId).toEqual(2);
      expect(ulNode.props).toEqual({ attributes: { id: '', class: '' }, numberOfRows: 0, initialListReady: true, onEndReached: true, onLoadMore: true });
    });
  });
});
