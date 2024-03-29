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

#ifndef HPViewEventProtocol_h
#define HPViewEventProtocol_h

#import <Foundation/Foundation.h>
#import "NativeRenderTouchesProtocol.h"

NS_ASSUME_NONNULL_BEGIN

@protocol HippyViewEventProtocol

@property (nonatomic, copy) OnTouchEventHandler onClick;
@property (nonatomic, copy) OnTouchEventHandler onLongClick;
@property (nonatomic, copy) OnTouchEventHandler onPressIn;
@property (nonatomic, copy) OnTouchEventHandler onPressOut;

@property (nonatomic, copy) OnTouchEventHandler onTouchDown;
@property (nonatomic, copy) OnTouchEventHandler onTouchMove;
@property (nonatomic, copy) OnTouchEventHandler onTouchEnd;
@property (nonatomic, copy) OnTouchEventHandler onTouchCancel;

//@property (nonatomic, copy) HippyDirectEventBlock onAttachedToWindow;
//@property (nonatomic, copy) HippyDirectEventBlock onDetachedFromWindow;

@property (nonatomic, assign) BOOL onInterceptTouchEvent;
@property (nonatomic, assign) BOOL onInterceptPullUpEvent;

@end

@protocol HippyViewTouchHandlerProtocol

- (BOOL)interceptTouchEvent;

@end

NS_ASSUME_NONNULL_END

#endif /* HPViewEventProtocol_h */

