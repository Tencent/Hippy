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

#import <Foundation/Foundation.h>
#import "NativeRenderViewEventType.h"

NS_ASSUME_NONNULL_BEGIN

typedef void(^OnTouchEventHandler)(CGPoint point,
                                   BOOL canCapture,
                                   BOOL canBubble,
                                   BOOL canBePreventedInCapture,
                                   BOOL canBePreventedInBubbling);

/**
 * Protocol indicates Views' touches event
 * This protocol only handls touches event, exclude Layout/Show/Dismiss event
 */
@protocol NativeRenderTouchesProtocol <NSObject>

/**
 * Add an event for a view
 * @param touchEvent event type
 * @param listener event handle block
 */
- (void)addViewEvent:(NativeRenderViewEventType)touchEvent eventListener:(OnTouchEventHandler)listener;

/**
 * Get event handle block with event type
 * @param eventType event type
 * @return event handle block for eventType
 */
- (OnTouchEventHandler)eventListenerForEventType:(NativeRenderViewEventType)eventType;

/**
 * Remove event handle block
 * @param touchEvent event type
 */
- (void)removeViewEvent:(NativeRenderViewEventType)touchEvent;

/**
 * Indicate if event can be prevented in capturing process
 * @param name event name in std::string type
 * @return YES if event can be prevented in capturing process
 */
- (BOOL)canBePreventedByInCapturing:(const char *)name;

/**
 * Indicate if event can be prevented in bubbling process
 * @param name event name in std::string type
 * @return YES if event can be prevented in bubbling process
 */
- (BOOL)canBePreventInBubbling:(const char *)name;

/**
 * Indicate if event can capture
 * @param name event name
 * @return YES if event can capture
 */
- (BOOL)canCapture:(const char *)name;

/**
 * Indicate if event can bubble
 * @param name event name
 * @return YES if event can bubble
 */
- (BOOL)canBubble:(const char *)name;

- (void)resetAllEvents;

@end

NS_ASSUME_NONNULL_END
