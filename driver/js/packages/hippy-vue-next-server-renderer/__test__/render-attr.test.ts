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
import { ssrRenderStyle, ssrGetDirectiveProps } from '../src';

/**
 * render-attr.ts unit test case
 */
describe('render-attr.ts', () => {
  describe('ssrRenderStyle should work correctly', () => {
    it('render empty style', () => {
      expect(ssrRenderStyle(undefined)).toEqual('{}');
    });
    it('render string style', () => {
      expect(ssrRenderStyle('sfdsfsdfsf')).toEqual('{}');
    });
    it('render object style', () => {
      expect(ssrRenderStyle({ flex: 1, display: 'flex' })).toEqual('{"flex":1,"display":"flex"}');
    });
    it('render array object style', () => {
      expect(ssrRenderStyle([{ flex: 1, display: 'flex' }])).toEqual('{"flex":1,"display":"flex"}');
    });
    it('render array string style', () => {
      expect(ssrRenderStyle(['flex:1;display:flex'])).toEqual('{"flex":"1","display":"flex"}');
    });
    it('render invalid type style', () => {
      expect(ssrRenderStyle(12345)).toEqual('{}');
    });
  });
  describe('ssrGetDirectiveProps should work correctly', () => {
    it('no props rendered in ssr', () => {
      expect(ssrGetDirectiveProps()).toEqual({});
    });
  });
});
