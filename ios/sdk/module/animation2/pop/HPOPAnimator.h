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

/**
 Copyright (c) 2014-present, Facebook, Inc.
 All rights reserved.
 
 This source code is licensed under the BSD-style license found in the
 LICENSE file in the root directory of this source tree. An additional grant
 of patent rights can be found in the PATENTS file in the same directory.
 */

#import <Foundation/Foundation.h>

@protocol HPOPAnimatorDelegate;

/**
 @abstract The animator class renders animations.
 */
@interface HPOPAnimator : NSObject

/**
 @abstract The shared animator instance.
 @discussion Consumers should generally use the shared instance in lieu of creating new instances.
 */
+ (instancetype)sharedAnimator;

#if !TARGET_OS_IPHONE
/**
 @abstract Allows to select display to bind. Returns nil if failed to create the display link.
 */
- (instancetype)initWithDisplayID:(CGDirectDisplayID)displayID;
#endif

/**
 @abstract The optional animator delegate.
 */
@property (weak, nonatomic) id<HPOPAnimatorDelegate> delegate;

/**
 @abstract Retrieves the nominal refresh period of a display link. Returns zero if unavailable.
 */
@property (readonly, nonatomic) CFTimeInterval refreshPeriod;

@end

/**
 @abstract The animator delegate.
 */
@protocol HPOPAnimatorDelegate <NSObject>

/**
 @abstract Called on each frame before animation application.
 */
- (void)animatorWillAnimate:(HPOPAnimator *)animator;

/**
 @abstract Called on each frame after animation application.
 */
- (void)animatorDidAnimate:(HPOPAnimator *)animator;

@end
