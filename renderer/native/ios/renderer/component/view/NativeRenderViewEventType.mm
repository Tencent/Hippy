/*!
 * iOS SDK
 *
 * Tencent is pleased to support the open source community by making
 * NativeRender available.
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

#import "NativeRenderViewEventType.h"

#include "dom/dom_listener.h"

NativeRenderViewEventType viewEventTypeFromName(const char * _Nullable name) {
    if (!name) {
        return NativeRenderViewEventTypeUnknown;
    }
    NativeRenderViewEventType type = NativeRenderViewEventTypeUnknown;
    if (0 == strcmp(hippy::kClickEvent, name)) {
        type = NativeRenderViewEventTypeClick;
    }
    else if (0 == strcmp(hippy::kLongClickEvent, name)) {
        type = NativeRenderViewEventTypeLongClick;
    }
    else if (0 == strcmp(hippy::kTouchStartEvent, name)) {
        type = NativeRenderViewEventTypeTouchStart;
    }
    else if (0 == strcmp(hippy::kTouchMoveEvent, name)) {
        type = NativeRenderViewEventTypeTouchMove;
    }
    else if (0 == strcmp(hippy::kTouchEndEvent, name)) {
        type = NativeRenderViewEventTypeTouchEnd;
    }
    else if (0 == strcmp(hippy::kTouchCancelEvent, name)) {
        type = NativeRenderViewEventTypeTouchCancel;
    }
    else if (0 == strcmp(hippy::kPressIn, name)) {
        type = NativeRenderViewEventTypePressIn;
    }
    else if (0 == strcmp(hippy::kPressOut, name)) {
        type = NativeRenderViewEventTypePressOut;
    }
    else if (0 == strcmp(hippy::kLayoutEvent, name)) {
        type = NativeRenderViewEventLayout;
    }
    else if (0 == strcmp(hippy::kShowEvent, name)) {
        type = NativeRenderViewEventTypeShow;
    }
    else if (0 == strcmp(hippy::kDismissEvent, name)) {
        type = NativeRenderViewEventTypeDismiss;
    }
    return type;
}

const char * _Nullable viewEventNameFromType(NativeRenderViewEventType eventType) {
    const char *name = nullptr;
    switch (eventType) {
        case NativeRenderViewEventTypeTouchStart:
            name = hippy::kTouchStartEvent;
            break;
        case NativeRenderViewEventTypeTouchMove:
            name = hippy::kTouchMoveEvent;
            break;
        case NativeRenderViewEventTypeTouchEnd:
            name = hippy::kTouchEndEvent;
            break;
        case NativeRenderViewEventTypeTouchCancel:
            name = hippy::kTouchCancelEvent;
            break;
        case NativeRenderViewEventTypePressIn:
            name = hippy::kPressIn;
            break;
        case NativeRenderViewEventTypePressOut:
            name = hippy::kPressOut;
            break;
        case NativeRenderViewEventLayout:
            name = hippy::kLayoutEvent;
            break;
        case NativeRenderViewEventTypeShow:
            name = hippy::kShowEvent;
            break;
        case NativeRenderViewEventTypeDismiss:
            name = hippy::kDismissEvent;
            break;
        case NativeRenderViewEventTypeClick:
            name = hippy::kClickEvent;
            break;
        case NativeRenderViewEventTypeLongClick:
            name = hippy::kLongClickEvent;
            break;
        default:
            break;
    }
    return name;
}
