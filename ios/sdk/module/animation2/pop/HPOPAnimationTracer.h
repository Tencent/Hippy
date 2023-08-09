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

@class HPOPAnimation;

/**
 @abstract Tracer of animation events to facilitate unit testing & debugging.
 */
@interface HPOPAnimationTracer : NSObject

/**
 @abstract Start recording events.
 */
- (void)start;

/**
 @abstract Stop recording events.
 */
- (void)stop;

/**
 @abstract Resets any recoded events. Continues recording events if already started.
 */
- (void)reset;

/**
 @abstract Property representing all recorded events.
 @discussion Events are returned in order of occurrence.
 */
@property (nonatomic, assign, readonly) NSArray *allEvents;

/**
 @abstract Property representing all recorded write events for convenience.
 @discussion Events are returned in order of occurrence.
 */
@property (nonatomic, assign, readonly) NSArray *writeEvents;

/**
 @abstract Queries for events of specified type.
 @param type The type of event to return.
 @returns An array of events of specified type in order of occurrence.
 */
- (NSArray *)eventsWithType:(POPAnimationEventType)type;

/**
 @abstract Property indicating whether tracer should automatically log events and reset collection on animation completion.
 */
@property (nonatomic, assign) BOOL shouldLogAndResetOnCompletion;

@end

#else
@interface HPOPAnimationTracer : NSObject
@end
#endif /* HPOP_CODE_TRIM */
