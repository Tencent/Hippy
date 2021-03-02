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

#import "UIImageView+Hippy.h"
#import <objc/runtime.h>
#import "UIView+Hippy.h"
#define HippyEventMethod(name, value, type)                                                       \
    -(void)set##name : (type)value {                                                              \
        objc_setAssociatedObject(self, @selector(value), value, OBJC_ASSOCIATION_COPY_NONATOMIC); \
    }                                                                                             \
    -(type)value {                                                                                \
        return objc_getAssociatedObject(self, _cmd);                                              \
    }

// clang-format off
@implementation UIImageView (Hippy)

HippyEventMethod(OnClick, onClick, HippyDirectEventBlock)
HippyEventMethod(OnPressIn, onPressIn, HippyDirectEventBlock)
HippyEventMethod(OnPressOut, onPressOut, HippyDirectEventBlock)
HippyEventMethod(OnLongClick, onLongClick, HippyDirectEventBlock)

HippyEventMethod(OnTouchDown, onTouchDown, HippyDirectEventBlock)
HippyEventMethod(OnTouchMove, onTouchMove, HippyDirectEventBlock)
HippyEventMethod(OnTouchCancel, onTouchCancel, HippyDirectEventBlock)
HippyEventMethod(OnTouchEnd, onTouchEnd, HippyDirectEventBlock)
HippyEventMethod(OnAttachedToWindow, onAttachedToWindow, HippyDirectEventBlock)
HippyEventMethod(OnDetachedFromWindow, onDetachedFromWindow, HippyDirectEventBlock)

@end
// clang-format on
