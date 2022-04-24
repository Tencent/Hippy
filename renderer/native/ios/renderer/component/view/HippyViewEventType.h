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

#include <string>
#import "HippyDefines.h"

typedef NS_ENUM(NSInteger, HippyViewEventType) {
    //touche event
    HippyViewEventTypeTouchStart,
    HippyViewEventTypeTouchMove,
    HippyViewEventTypeTouchEnd,
    HippyViewEventTypeTouchCancel,
    
    HippyViewEventTypePressIn,
    HippyViewEventTypePressOut,
    
    HippyViewEventLayout,
        
    //show event
    HippyViewEventTypeShow,
    HippyViewEventTypeDismiss,
    
    //click event
    HippyViewEventTypeClick,
    HippyViewEventTypeLongClick,
    
    HippyViewEventTypeUnknown = -1,
};

HIPPY_EXTERN HippyViewEventType viewEventTypeFromName(const std::string &name);
