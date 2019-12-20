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

#import <Foundation/Foundation.h>

@class CADisplayLink;

/**
 * Interface containing the information about the last screen refresh.
 */
@interface HippyFrameUpdate : NSObject

/**
 * Timestamp for the actual screen refresh
 */
@property (nonatomic, readonly) NSTimeInterval timestamp;

/**
 * Time since the last frame update ( >= 16.6ms )
 */
@property (nonatomic, readonly) NSTimeInterval deltaTime;

- (instancetype)initWithDisplayLink:(CADisplayLink *)displayLink NS_DESIGNATED_INITIALIZER;

@end

/**
 * Protocol that must be implemented for subscribing to display refreshes (DisplayLink updates)
 */
@protocol HippyFrameUpdateObserver <NSObject>

/**
 * Method called on every screen refresh (if paused != YES)
 */
- (void)didUpdateFrame:(HippyFrameUpdate *)update;

/**
 * Synthesize and set to true to pause the calls to -[didUpdateFrame:]
 */
@property (nonatomic, readonly, getter=isPaused) BOOL paused;

/**
 * Callback for pause/resume observer.
 * Observer should call it when paused property is changed.
 */
@property (nonatomic, copy) dispatch_block_t pauseCallback;

@end
