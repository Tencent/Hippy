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
#import "HPOPDefines.h"
#if HPOP_CODE_TRIM

#import "HPOPAnimationEvent.h"

@interface HPOPAnimationEvent ()

/**
 @abstract Default initializer.
 */
- (instancetype)initWithType:(POPAnimationEventType)type time:(CFTimeInterval)time;

/**
 @abstract Readwrite redefinition of public property.
 */
@property (readwrite, nonatomic, copy) NSString *animationDescription;

@end

@interface HPOPAnimationValueEvent ()

/**
 @abstract Default initializer.
 */
- (instancetype)initWithType:(POPAnimationEventType)type time:(CFTimeInterval)time value:(id)value;

/**
 @abstract Readwrite redefinition of public property.
 */
@property (readwrite, nonatomic, strong) id velocity;

@end

#endif /* HPOP_CODE_TRIM */
