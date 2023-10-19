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

#ifndef NativeRenderDefines_h
#define NativeRenderDefines_h
#import "HippyDefines.h"

@class HippyUIManager, UIView, NSDictionary;


typedef void (^HippyViewManagerUIBlock)(HippyUIManager *uiManager, NSDictionary<NSNumber *, __kindof UIView *> *viewRegistry);
/**
 * Posted whenever a new root view is registered with NativeRenderUIManager. The userInfo property
 * will contain a NativeRenderUIManagerRootViewKey with the registered root view.
 */
HIPPY_EXTERN NSString *const NativeRenderUIManagerDidRegisterRootViewNotification;

/**
 * Key for the root view property in the above notifications
 */
HIPPY_EXTERN NSString *const NativeRenderUIManagerRootViewTagKey;

/**
 * Key for Render UIManager
 */
HIPPY_EXTERN NSString *const NativeRenderUIManagerKey;

/**
 * Posted whenever endBatch is called
 */
HIPPY_EXTERN NSString *const NativeRenderUIManagerDidEndBatchNotification;

#endif /* NativeRenderDefines_h */
