/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

/* eslint-disable complexity */

/**
 * get hippy native view's name, map with html tag
 *
 * @param tag - html tag or Vue component name
 */
export function getHippyNativeViewName(tag: string): string {
  // Hippy built-in native view
  const NATIVE_COMPONENT_MAP = {
    View: 'View',
    Image: 'Image',
    ListView: 'ListView',
    ListViewItem: 'ListViewItem',
    Text: 'Text',
    TextInput: 'TextInput',
    WebView: 'WebView',
    VideoPlayer: 'VideoPlayer',
    // native inner view, just name different with View
    ScrollView: 'ScrollView',
    Swiper: 'ViewPager',
    SwiperSlide: 'ViewPagerItem',
    PullHeaderView: 'PullHeaderView',
    PullFooterView: 'PullFooterView',
    Dialog: 'Modal',
    UlRefreshWrapper: 'RefreshWrapper',
    UlRefresh: 'RefreshWrapperItemView',
    Waterfall: 'WaterfallView',
    WaterfallItem: 'WaterfallItem',
  };
  switch (tag) {
    case 'div':
    case 'button':
    case 'form':
      return NATIVE_COMPONENT_MAP.View;
    case 'img':
      return NATIVE_COMPONENT_MAP.Image;
    case 'ul':
      return NATIVE_COMPONENT_MAP.ListView;
    case 'li':
      return NATIVE_COMPONENT_MAP.ListViewItem;
    case 'span':
    case 'label':
    case 'p':
    case 'a':
      return NATIVE_COMPONENT_MAP.Text;
    case 'textarea':
    case 'input':
      return NATIVE_COMPONENT_MAP.TextInput;
    case 'iframe':
      return NATIVE_COMPONENT_MAP.WebView;
    case 'hi-swiper':
      return NATIVE_COMPONENT_MAP.Swiper;
    case 'hi-swiper-slide':
      return NATIVE_COMPONENT_MAP.SwiperSlide;
    case 'hi-pull-header':
      return NATIVE_COMPONENT_MAP.PullHeaderView;
    case 'hi-pull-footer':
      return NATIVE_COMPONENT_MAP.PullFooterView;
    case 'dialog':
      return NATIVE_COMPONENT_MAP.Dialog;
    case 'hi-ul-refresh-wrapper':
      return NATIVE_COMPONENT_MAP.UlRefreshWrapper;
    case 'hi-refresh-wrapper-item':
      return NATIVE_COMPONENT_MAP.UlRefresh;
    case 'hi-waterfall':
      return NATIVE_COMPONENT_MAP.Waterfall;
    case 'hi-waterfall-item':
      return NATIVE_COMPONENT_MAP.WaterfallItem;
    default:
      return tag;
  }
}

/**
 * parse vue tag/component name to real tag name
 *
 * @param compName
 */
export function getHippyTagName(compName: string): string {
  // do not have need parse tag name now
  return compName;
}
