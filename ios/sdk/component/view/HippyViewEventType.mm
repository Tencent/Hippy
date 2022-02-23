/*!
 * iOS SDK
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
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#import "HippyViewEventType.h"
#include "dom/dom_listener.h"

HippyViewEventType viewEventTypeFromName(const std::string &name) {
    HippyViewEventType type = HippyViewEventTypeUnknown;
    if (hippy::kClickEvent == name) {
        type = HippyViewEventTypeClick;
    }
    else if (hippy::kLongClickEvent == name) {
        type = HippyViewEventTypeLongClick;
    }
    else if (hippy::kTouchStartEvent == name) {
        type = HippyViewEventTypeTouchStart;
    }
    else if (hippy::kTouchMoveEvent == name) {
        type = HippyViewEventTypeTouchMove;
    }
    else if (hippy::kTouchEndEvent == name) {
        type = HippyViewEventTypeTouchEnd;
    }
    else if (hippy::kTouchCancelEvent == name) {
        type = HippyViewEventTypeTouchCancel;
    }
    else if (hippy::kPressIn == name) {
        type = HippyViewEventTypePressIn;
    }
    else if (hippy::kPressOut == name) {
        type = HippyViewEventTypePressOut;
    }
    else if (hippy::kLayoutEvent == name) {
        type = HippyViewEventLayout;
    }
    else if (hippy::kShowEvent == name) {
        type = HippyViewEventTypeShow;
    }
    else if (hippy::kDismissEvent == name) {
        type = HippyViewEventTypeDismiss;
    }
    return type;
}
