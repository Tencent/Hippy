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

import { getHippyNativeViewName } from '../src/native';

/**
 * native.ts unit test case
 */
describe('native.ts', () => {
  describe('getHippyNativeViewName should work correct', () => {
    it('should return "View" for "div", "button", and "form"', () => {
      expect(getHippyNativeViewName('div')).toBe('View');
      expect(getHippyNativeViewName('button')).toBe('View');
      expect(getHippyNativeViewName('form')).toBe('View');
    });

    it('should return "Image" for "img"', () => {
      expect(getHippyNativeViewName('img')).toBe('Image');
    });

    it('should return "ListView" for "ul"', () => {
      expect(getHippyNativeViewName('ul')).toBe('ListView');
    });

    it('should return "ListViewItem" for "li"', () => {
      expect(getHippyNativeViewName('li')).toBe('ListViewItem');
    });

    it('should return "Text" for "span", "label", "p", and "a"', () => {
      expect(getHippyNativeViewName('span')).toBe('Text');
      expect(getHippyNativeViewName('label')).toBe('Text');
      expect(getHippyNativeViewName('p')).toBe('Text');
      expect(getHippyNativeViewName('a')).toBe('Text');
    });

    it('should return "TextInput" for "input" and "textarea"', () => {
      expect(getHippyNativeViewName('input')).toBe('TextInput');
      expect(getHippyNativeViewName('textarea')).toBe('TextInput');
    });

    it('should return "WebView" for "iframe"', () => {
      expect(getHippyNativeViewName('iframe')).toBe('WebView');
    });

    it('should return "Swiper" for "swiper"', () => {
      expect(getHippyNativeViewName('hi-swiper')).toBe('ViewPager');
    });

    it('should return "SwiperSlide" for "swiper-slide"', () => {
      expect(getHippyNativeViewName('hi-swiper-slide')).toBe('ViewPagerItem');
    });

    it('should return "PullHeaderView" for "pull-header"', () => {
      expect(getHippyNativeViewName('hi-pull-header')).toBe('PullHeaderView');
    });

    it('should return "PullFooterView" for "pull-footer"', () => {
      expect(getHippyNativeViewName('hi-pull-footer')).toBe('PullFooterView');
    });

    it('should return "Modal" for "dialog"', () => {
      expect(getHippyNativeViewName('dialog')).toBe('Modal');
    });

    it('should return "RefreshWrapper" for "hi-ul-refresh-wrapper"', () => {
      expect(getHippyNativeViewName('hi-ul-refresh-wrapper')).toBe('RefreshWrapper');
    });

    it('should return "RefreshWrapperItemView" for "hi-refresh-wrapper-item"', () => {
      expect(getHippyNativeViewName('hi-refresh-wrapper-item')).toBe('RefreshWrapperItemView');
    });

    it('should return "WaterfallView" for "hi-waterfall"', () => {
      expect(getHippyNativeViewName('hi-waterfall')).toBe('WaterfallView');
    });

    it('should return "WaterfallItem" for "hi-waterfall-item"', () => {
      expect(getHippyNativeViewName('hi-waterfall-item')).toBe('WaterfallItem');
    });

    it('should return the input tag for unknown tags', () => {
      expect(getHippyNativeViewName('foo')).toBe('foo');
    });
  });
});
