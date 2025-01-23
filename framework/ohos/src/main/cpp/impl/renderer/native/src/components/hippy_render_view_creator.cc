/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#include "renderer/components/hippy_render_view_creator.h"
#include "renderer/components/div_view.h"
#include "renderer/components/image_view.h"
#include "renderer/components/list_item_view.h"
#include "renderer/components/list_view.h"
#include "renderer/components/modal_view.h"
#include "renderer/components/pager_item_view.h"
#include "renderer/components/pager_view.h"
#include "renderer/components/pull_footer_view.h"
#include "renderer/components/pull_header_view.h"
#include "renderer/components/refresh_wrapper_item_view.h"
#include "renderer/components/refresh_wrapper_view.h"
#include "renderer/components/rich_text_view.h"
#include "renderer/components/rich_text_span_view.h"
#include "renderer/components/rich_text_image_span_view.h"
#include "renderer/components/scroll_view.h"
#include "renderer/components/text_input_view.h"
#include "renderer/components/waterfall_item_view.h"
#include "renderer/components/waterfall_view.h"

namespace hippy {
inline namespace render {
inline namespace native {

std::shared_ptr<BaseView> HippyCreateRenderView(std::string &view_name, bool is_parent_text, std::shared_ptr<NativeRenderContext> &ctx) {
//  FOOTSTONE_DLOG(INFO)<<__FUNCTION__<<" view_name = "<<view_name;
  if (view_name == "View") {
    auto view = std::make_shared<DivView>(ctx);
    view->Init();
    return view;
  } else if (view_name == "Image") {
    if (is_parent_text) {
      auto view = std::make_shared<RichTextImageSpanView>(ctx);
      view->Init();
      return view;
    } else {
      auto view = std::make_shared<ImageView>(ctx);
      view->Init();
      return view;
    }
  } else if (view_name == "Text") {
    if (is_parent_text) {
      auto view = std::make_shared<RichTextSpanView>(ctx);
      view->Init();
      return view;
    } else {
      auto view = std::make_shared<RichTextView>(ctx);
      view->Init();
      return view;
    }
  } else if (view_name == "Modal") {
    auto view = std::make_shared<ModalView>(ctx);
    view->Init();
    return view;
  } else if (view_name == "ListView") {
    auto view = std::make_shared<ListView>(ctx);
    view->Init();
    return view;
  } else if (view_name == "ListViewItem") {
    auto view = std::make_shared<ListItemView>(ctx);
    view->Init();
    return view;
  } else if (view_name == "ScrollView") {
    auto view = std::make_shared<ScrollView>(ctx);
    view->Init();
    return view;
  } else if (view_name == "TextInput") {
    auto view = std::make_shared<TextInputView>(ctx);
    view->Init();
    return view;
  } else if (view_name == "ViewPager") {
    auto view = std::make_shared<PagerView>(ctx);
    view->Init();
    return view;
  } else if (view_name == "ViewPagerItem") {
    auto view = std::make_shared<PagerItemView>(ctx);
    view->Init();
    return view;
  } else if (view_name == "WaterfallView") {
    auto view = std::make_shared<WaterfallView>(ctx);
    view->Init();
    return view;
  } else if (view_name == "WaterfallItem") {
    auto view = std::make_shared<WaterfallItemView>(ctx);
    view->Init();
    return view;
  } else if (view_name == "RefreshWrapper") {
    auto view = std::make_shared<RefreshWrapperView>(ctx);
    view->Init();
    return view;
  } else if (view_name == "RefreshWrapperItemView") {
    auto view = std::make_shared<RefreshWrapperItemView>(ctx);
    view->Init();
    return view;
  } else if (view_name == "PullHeaderView") {
    auto view = std::make_shared<PullHeaderView>(ctx);
    view->Init();
    return view;
  } else if (view_name == "PullFooterView") {
    auto view = std::make_shared<PullFooterView>(ctx);
    view->Init();
    return view;
  }
  
  // no WebView, for no c-api for WebView, so use ts WebView
  
  return nullptr;
}

bool HippyIsLazyCreateView(const std::string &view_type) {
  if (view_type == "ViewPagerItem" || view_type == "ListViewItem") {
    return true;
  }
  return false;
}

} // namespace native
} // namespace render
} // namespace hippy
