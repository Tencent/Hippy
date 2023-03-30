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

import { compile } from '../src';
import { getSsrRenderFunctionBody } from './utils';

/**
 * @author birdguo
 * @priority P0
 * @casetype unit
 */
describe('element.test.ts', () => {
  describe('tag should compile correct', () => {
    it('div should compile correct', () => {
      const { code } = compile('<div></div>');
      expect(getSsrRenderFunctionBody(code))
        .toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)');
    });
    it('button should compile correct', () => {
      const { code } = compile('<button></button>');
      expect(getSsrRenderFunctionBody(code))
        .toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"button","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)');
    });
    it('form should compile correct', () => {
      const { code } = compile('<form></form>');
      expect(getSsrRenderFunctionBody(code))
        .toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"form","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)');
    });
    it('img should compile correct', () => {
      const { code } = compile('<img />');
      expect(getSsrRenderFunctionBody(code))
        .toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"Image","tagName":"img","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)');
    });
    it('ul should compile correct', () => {
      const { code } = compile('<ul></ul>');
      expect(getSsrRenderFunctionBody(code))
        .toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"ListView","tagName":"ul","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)');
    });
    it('li should compile correct', () => {
      const { code } = compile('<li></li>');
      expect(getSsrRenderFunctionBody(code))
        .toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"ListViewItem","tagName":"li","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)');
    });
    it('span should compile correct', () => {
      const { code } = compile('<span></span>');
      expect(getSsrRenderFunctionBody(code))
        .toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"Text","tagName":"span","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)');
    });
    it('label should compile correct', () => {
      const { code } = compile('<label></label>');
      expect(getSsrRenderFunctionBody(code))
        .toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"Text","tagName":"label","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)');
    });
    it('p should compile correct', () => {
      const { code } = compile('<p></p>');
      expect(getSsrRenderFunctionBody(code))
        .toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"Text","tagName":"p","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)');
    });
    it('a should compile correct', () => {
      const { code } = compile('<a></a>');
      expect(getSsrRenderFunctionBody(code))
        .toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"Text","tagName":"a","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)');
    });
    it('input should compile correct', () => {
      const { code } = compile('<input />');
      expect(getSsrRenderFunctionBody(code))
        .toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"TextInput","tagName":"input","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)');
    });
    it('textarea should compile correct', () => {
      const { code } = compile('<textarea></textarea>');
      expect(getSsrRenderFunctionBody(code))
        .toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"TextInput","tagName":"textarea","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)');
    });
    it('iframe should compile correct', () => {
      const { code } = compile('<iframe></iframe>');
      expect(getSsrRenderFunctionBody(code))
        .toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"WebView","tagName":"iframe","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[]},`)');
    });
  });
  describe('nested tag should compile correct', () => {
    it('div with child should compile correct', () => {
      const { code } = compile('<div><div></div></div>');
      expect(getSsrRenderFunctionBody(code))
        .toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{"mergedProps":${JSON.stringify(_attrs)},},"children":[{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{},"children":[]},]},`)');
    });
  });
  describe('attrs should compile correct', () => {
    it('props and event should compile correct', () => {
      const { code } = compile('<div id="app" class="wrapper" @click="()=>{}" />');
      expect(getSsrRenderFunctionBody(code)).toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{"mergedProps":${JSON.stringify(_mergeProps({id:"app",class:"wrapper"},_attrs))},"onClick":true,},"children":[]},`)');
    });
    it('binding value should compile correct', () => {
      const { code } = compile('<div value="test" :data="show" :text="\'text\'"  />');
      expect(getSsrRenderFunctionBody(code)).toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{"mergedProps":${JSON.stringify(_mergeProps({value:"test",data:_ctx.show,text:\'text\'},_attrs))},},"children":[]},`)');
    });
    it('directive v-bind should compile correct', () => {
      const { code } = compile('<div v-bind="data" />');
      expect(getSsrRenderFunctionBody(code)).toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{"mergedProps":${JSON.stringify(_mergeProps(_ctx.data,_attrs))},},"children":[]},`)');
    });
    it('static value width dynamic value should compile correct', () => {
      const { code } = compile('<div style="color:red;" :style="b" />');
      expect(getSsrRenderFunctionBody(code)).toEqual('_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{"mergedProps":${JSON.stringify(_mergeProps({style:[{"color":"red"},_ctx.b]},_attrs))},},"children":[]},`)');
    });
    it('custom directive should compile correct', () => {
      const { code } = compile('<div v-report="data" />');
      expect(getSsrRenderFunctionBody(code)).toEqual('const _directive_report = _resolveDirective("report")  _push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{"mergedProps":${JSON.stringify(_mergeProps(_attrs,_ssrGetDirectiveProps(_ctx,_directive_report,_ctx.data)))},},"children":[]},`)');
    });
  });
});
