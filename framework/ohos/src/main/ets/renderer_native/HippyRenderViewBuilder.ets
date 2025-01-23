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
import HippyRenderBaseView from './components/base/HippyRenderBaseView';
import { HRImage, HRImageView } from './components/image/HRImageView';
import { HRList } from './components/list/HRList';
import { HRListItem, HRListItemView } from './components/list/HRListItemView';
import { HRListView } from './components/list/HRListView';
import { HRModal, HRModalView } from './components/modal/HRModalView';
import { HRViewPager, HRViewPagerView } from './components/pager/HRViewPager';
import { HRViewPagerItem, HRViewPagerItemView } from './components/pager/HRViewPagerItem';
import { HRPullFooter, HRPullFooterView } from './components/pullfooter/HRPullFooter';
import { HRPullHeader, HRPullHeaderView } from './components/pullheader/HRPullHeader';
import { HRRefreshWrapper,
  HRRefreshWrapperView } from './components/refreshwrapper/HRRefreshWrapper';
import { HRRefreshWrapperItem,
  HRRefreshWrapperItemView } from './components/refreshwrapper/HRRefreshWrapperItem';
import { HRRichText, HRRichTextView } from './components/richtext/HRRichTextView';
import { HRScroll, HRScrollView } from './components/scroller/HRScrollView';
import { HRTextInput, HRTextInputView } from './components/textinput/HRTextInputView';
import { HRDiv, HRDivView } from './components/view/HRDivView';
import { HRWaterfall } from './components/waterfall/HRWaterfall';
import { HRWaterfallItem, HRWaterfallItemView } from './components/waterfall/HRWaterfallItemView';
import { HRWaterfallView } from './components/waterfall/HRWaterfallView';
import { HRWeb, HRWebView } from './components/web/HRWebView';

export type WrappedHippyCustomRenderViewBuilder = WrappedBuilder<[HippyRenderBaseView]>

export type HRComponent = HRDivView | HRScroll | HRModal | null

@Builder
export function buildHippyRenderView($$: HippyRenderBaseView, parentComponent: HRComponent) {
  if ($$ instanceof HRDivView) {
    HRDiv({
      renderView: $$ as HRDivView,
      children: $$.children,
    })
  } else if ($$ instanceof HRScrollView) {
    HRScroll({
      renderView: $$ as HRScrollView,
      children: $$.children,
    })
  } else if ($$ instanceof HRRichTextView) {
    HRRichText({
      renderView: $$ as HRRichTextView,
    })
  } else if ($$ instanceof HRImageView) {
    HRImage({ renderView: $$ as HRImageView })
  } else if ($$ instanceof HRModalView) {
    HRModal({
      renderView: $$ as HRModalView,
      children: $$.children,
    })
  } else if ($$ instanceof HRListView) {
    HRList({
      renderView: $$ as HRListView,
      children: $$.children,
    })
  } else if ($$ instanceof HRListItemView) {
    HRListItem({
      renderView: $$ as HRListItemView,
      children: $$.children,
    }).reuseId($$.type)
  } else if ($$ instanceof HRTextInputView) {
    HRTextInput({
      renderView: $$ as HRTextInputView,
      children: $$.children,
    })
  } else if ($$ instanceof HRWebView) {
    HRWeb({
      renderView: $$ as HRWebView,
      children: $$.children,
    })
  } else if ($$ instanceof HRViewPagerView) {
    HRViewPager({
      renderView: $$ as HRViewPagerView,
      children: $$.children,
    })
  } else if ($$ instanceof HRViewPagerItemView) {
    HRViewPagerItem({
      renderView: $$ as HRViewPagerItemView,
      children: $$.children,
    })
  } else if ($$ instanceof HRWaterfallItemView) {
    HRWaterfallItem({
      renderView: $$ as HRWaterfallItemView,
      children: $$.children,
    }).reuseId($$.type)
  } else if ($$ instanceof HRWaterfallView) {
    HRWaterfall({
      renderView: $$ as HRWaterfallView,
      children: $$.children,
    })
  } else if ($$ instanceof HRRefreshWrapperView) {
    HRRefreshWrapper({
      renderView: $$ as HRRefreshWrapperView,
      children: $$.children,
    })
  } else if ($$ instanceof HRRefreshWrapperItemView) {
    HRRefreshWrapperItem({
      renderView: $$ as HRRefreshWrapperItemView,
      children: $$.children,
    })
  } else if ($$ instanceof HRPullHeaderView) {
    HRPullHeader({
      renderView: $$ as HRPullHeaderView,
      children: $$.children,
    })
  } else if ($$ instanceof HRPullFooterView) {
    HRPullFooter({
      renderView: $$ as HRPullFooterView,
      children: $$.children,
    })
  } else {
    if ($$.ctx.wrappedCustomRenderViewBuilder) {
      $$.ctx.wrappedCustomRenderViewBuilder.builder($$)
    }
  }
}
