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

#import "MacroDefines.h"

typedef NS_ENUM(NSInteger, NativeRenderViewEventType) {
    //touche event
    NativeRenderViewEventTypeTouchStart,
    NativeRenderViewEventTypeTouchMove,
    NativeRenderViewEventTypeTouchEnd,
    NativeRenderViewEventTypeTouchCancel,
    
    NativeRenderViewEventTypePressIn,
    NativeRenderViewEventTypePressOut,
    
    NativeRenderViewEventLayout,
        
    //show event
    NativeRenderViewEventTypeShow,
    NativeRenderViewEventTypeDismiss,
    
    //click event
    NativeRenderViewEventTypeClick,
    NativeRenderViewEventTypeLongClick,
    
    NativeRenderViewEventTypeUnknown = -1,
};

HP_EXTERN NativeRenderViewEventType viewEventTypeFromName(const char * _Nullable name);

HP_EXTERN const char *_Nullable viewEventNameFromType(NativeRenderViewEventType eventType);
