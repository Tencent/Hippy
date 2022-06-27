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

#pragma once

#include <any>
#include <functional>

#include "dom/dom_argument.h"
#include "dom/dom_event.h"

namespace hippy {
inline namespace dom {

constexpr char kClickEvent[] = "click";
constexpr char kLongClickEvent[] = "longclick";
constexpr char kTouchStartEvent[] = "touchstart";
constexpr char kTouchMoveEvent[] = "touchmove";
constexpr char kTouchEndEvent[] = "touchend";
constexpr char kPressIn[] = "pressin";
constexpr char kPressOut[] = "pressout";
constexpr char kTouchCancelEvent[] = "touchcancel";
constexpr char kLayoutEvent[] = "layout";
constexpr char kShowEvent[] = "show";
constexpr char kDismissEvent[] = "dismiss";

using EventCallback = std::function<void(const std::shared_ptr<DomEvent>&)>;
using RenderCallback = std::function<void(const std::shared_ptr<DomArgument>&)>;
using CallFunctionCallback = std::function<void(std::shared_ptr<DomArgument>)>;

struct TouchEventInfo {
  float x;
  float y;
};

struct LayoutResult {
  float left = 0;
  float top = 0;
  float width = 0;
  float height = 0;
  float marginLeft = 0;
  float marginTop = 0;
  float marginRight = 0;
  float marginBottom = 0;
  float paddingLeft = 0;
  float paddingTop = 0;
  float paddingRight = 0;
  float paddingBottom = 0;
};

enum class LayoutDiffMapKey { x, y, w, h };

uint64_t FetchListenerId();
}  // namespace dom
}  // namespace hippy
