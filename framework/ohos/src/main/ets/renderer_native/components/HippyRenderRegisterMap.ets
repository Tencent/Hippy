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
import { NativeRenderContext } from '../NativeRenderContext'
import HippyRenderBaseView from './base/HippyRenderBaseView'
import { HRImageView } from './image/HRImageView'
import { HRListItemView } from './list/HRListItemView'
import { HRListView } from './list/HRListView'
import { HRModalView } from './modal/HRModalView'
import { HRRichTextView } from './richtext/HRRichTextView'
import { HRScrollView } from './scroller/HRScrollView'
import { HRTextInputView } from './textinput/HRTextInputView'
import { HRWebView } from './web/HRWebView'
import { HRViewPagerView } from './pager/HRViewPager'
import { HRViewPagerItemView } from './pager/HRViewPagerItem'
import { HRWaterfallView } from './waterfall/HRWaterfallView'
import { HRWaterfallItemView } from './waterfall/HRWaterfallItemView'
import { HRRefreshWrapperView } from './refreshwrapper/HRRefreshWrapper'
import { HRRefreshWrapperItemView } from './refreshwrapper/HRRefreshWrapperItem'
import { HRPullHeaderView } from './pullheader/HRPullHeader'
import { HRPullFooterView } from './pullfooter/HRPullFooter'
import { HRDivView } from './view/HRDivView'

export type HRRenderViewCreator = (ctx: NativeRenderContext) => HippyRenderBaseView

export function hippyRenderViewCreatorRegisterMap(): Map<string, HRRenderViewCreator> {
  let registerMap: Map<string, HRRenderViewCreator> = new Map()
  registerMap.set("View", (ctx): HippyRenderBaseView => new HRDivView(ctx))
  registerMap.set("Image", (ctx): HippyRenderBaseView => new HRImageView(ctx))
  registerMap.set("Text", (ctx): HippyRenderBaseView => new HRRichTextView(ctx))
  registerMap.set("Modal", (ctx): HippyRenderBaseView => new HRModalView(ctx))
  registerMap.set("ListView", (ctx): HippyRenderBaseView => new HRListView(ctx))
  registerMap.set("ListViewItem", (ctx): HippyRenderBaseView => new HRListItemView(ctx))
  registerMap.set("ScrollView", (ctx): HippyRenderBaseView => new HRScrollView(ctx))
  registerMap.set("TextInput", (ctx): HippyRenderBaseView => new HRTextInputView(ctx))
  registerMap.set("WebView", (ctx): HippyRenderBaseView => new HRWebView(ctx))
  registerMap.set("ViewPager", (ctx): HippyRenderBaseView => new HRViewPagerView(ctx))
  registerMap.set("ViewPagerItem", (ctx): HippyRenderBaseView => new HRViewPagerItemView(ctx))
  registerMap.set("WaterfallView", (ctx): HippyRenderBaseView => new HRWaterfallView(ctx))
  registerMap.set("WaterfallItem", (ctx): HippyRenderBaseView => new HRWaterfallItemView(ctx))
  registerMap.set("RefreshWrapper", (ctx): HippyRenderBaseView => new HRRefreshWrapperView(ctx))
  registerMap.set("RefreshWrapperItemView", (ctx): HippyRenderBaseView => new HRRefreshWrapperItemView(ctx))
  registerMap.set("PullHeaderView", (ctx): HippyRenderBaseView => new HRPullHeaderView(ctx))
  registerMap.set("PullFooterView", (ctx): HippyRenderBaseView => new HRPullFooterView(ctx))

  return registerMap
}
