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

import { getHippyTagName } from '../src/native';

/**
 * native.ts unit test case
 */
describe('native.ts', () => {
  it('should return "View" for "div", "button", and "form"', () => {
    expect(getHippyTagName('div')).toBe('View');
    expect(getHippyTagName('button')).toBe('View');
    expect(getHippyTagName('form')).toBe('View');
  });

  it('should return "Image" for "img"', () => {
    expect(getHippyTagName('img')).toBe('Image');
  });

  it('should return "ListView" for "ul"', () => {
    expect(getHippyTagName('ul')).toBe('ListView');
  });

  it('should return "ListViewItem" for "li"', () => {
    expect(getHippyTagName('li')).toBe('ListViewItem');
  });

  it('should return "Text" for "span", "label", "p", and "a"', () => {
    expect(getHippyTagName('span')).toBe('Text');
    expect(getHippyTagName('label')).toBe('Text');
    expect(getHippyTagName('p')).toBe('Text');
    expect(getHippyTagName('a')).toBe('Text');
  });

  it('should return "TextInput" for "input" and "textarea"', () => {
    expect(getHippyTagName('input')).toBe('TextInput');
    expect(getHippyTagName('textarea')).toBe('TextInput');
  });

  it('should return "WebView" for "iframe"', () => {
    expect(getHippyTagName('iframe')).toBe('WebView');
  });

  it('should return "Swiper" for "swiper"', () => {
    expect(getHippyTagName('swiper')).toBe('ViewPager');
  });

  it('should return "SwiperSlide" for "swiper-slide"', () => {
    expect(getHippyTagName('swiper-slide')).toBe('ViewPagerItem');
  });

  it('should return "PullHeaderView" for "pull-header"', () => {
    expect(getHippyTagName('pull-header')).toBe('PullHeaderView');
  });

  it('should return "PullFooterView" for "pull-footer"', () => {
    expect(getHippyTagName('pull-footer')).toBe('PullFooterView');
  });

  it('should return the input tag for unknown tags', () => {
    expect(getHippyTagName('foo')).toBe('foo');
  });
});
