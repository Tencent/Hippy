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
 * hippy-vue-next does not support these vue built-in tag now, just for test unit case
 */
describe('vue-built-in.test.ts', () => {
  describe('transition-group compile', () => {
    it('tag compile', () => {
      const { code } = compile('<transition-group><div v-for="i in list" /></transition-group>');
      expect(getSsrRenderFunctionBody(code)).toEqual('_push(`{"id":-1,"name":"comment","props":{"text":"["}},`)  _ssrRenderList(_ctx.list,(i) => {_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{},"children":[]},`)})  _push(`{"id":-1,"name":"comment","props":{"text":"]"}},`)');
    });
    it('static tag compile', () => {
      const { code } = compile('<transition-group tag="ul"><div v-for="i in list" /></transition-group>');
      expect(getSsrRenderFunctionBody(code)).toEqual('_push(`<ul${_ssrRenderAttrs(_attrs)}>`)  _ssrRenderList(_ctx.list,(i) => {_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{},"children":[]},`)})  _push(`</ul>`)');
    });
    it('dynamic tag compile', () => {
      const { code } = compile('<transition-group :tag="foo"><div v-for="i in list" /></transition-group>');
      expect(getSsrRenderFunctionBody(code)).toEqual('_push(`<${_ctx.foo}${_ssrRenderAttrs(_attrs)}>`)  _ssrRenderList(_ctx.list,(i) => {_push(`{"id":${_ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{},"children":[]},`)})  _push(`</${_ctx.foo}>`)');
    });
    it('props compile', () => {
      const { code } = compile('<transition-group tag="ul" class="red" id="ok"></transition-group>');
      expect(getSsrRenderFunctionBody(code)).toEqual('_push(`<ul${_ssrRenderAttrs(_mergeProps({class:"red",id:"ok"},_attrs))}></ul>`)');
    });
  });
  describe('suspense compile', () => {
    it('component compile', () => {
      const { code } = compile('<suspense><foo /></suspense>');
      expect(getSsrRenderFunctionBody(code)).toEqual('const _component_foo = _resolveComponent("foo")  _ssrRenderSuspense(_push,{default:() => {_push(_ssrRenderComponent(_component_foo,null,null,_parent))},_:1 /* STABLE */})');
    });
  });
  describe('teleport compile', () => {
    it('component compile', () => {
      const { code } = compile('<teleport :to="target"><foo /></teleport>');
      expect(getSsrRenderFunctionBody(code)).toEqual('const _component_foo = _resolveComponent("foo")  _ssrRenderTeleport(_push,(_push) => {_push(_ssrRenderComponent(_component_foo,null,null,_parent))},_ctx.target,false,_parent)');
    });
  });
});
