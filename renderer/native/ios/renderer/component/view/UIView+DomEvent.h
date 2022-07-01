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

#import <UIKit/UIKit.h>
#import "NativeRenderComponentProtocol.h"
#import "NativeRenderTouchesView.h"
#include <string>

NS_ASSUME_NONNULL_BEGIN

/**
 * A catagory to handle NativeRenderTouchesProtocol
 * Empty implementation for [NativeRenderTouchesProtocol addViewEvent:eventListener:], [NativeRenderTouchesProtocol removeViewEvent]
 * Return NO for [NativeRenderTouchesProtocol canBePreventedByInCapturing:], [NativeRenderTouchesProtocol canBePreventedByInCapturing:]
 * Return NULL for [NativeRenderTouchesProtocol eventListenerForEventType:]
 */

@interface UIView(DomEvent)<NativeRenderTouchesProtocol>

/**
 * Add custom property event for view
 * @param name event name
 * @param callback event call back for event
 */
- (void)addPropertyEvent:(const std::string &)name eventCallback:(NativeRenderDirectEventBlock)callback;

/**
 * Remove status change event for view
 * @param name event name
 */
- (void)removePropertyEvent:(const std::string &)name;

/**
 * Notify view event has been added
 * @param name event name
 * @param callback event block
 *
 * @discussion The default implementation of this method is to trigger onDidMount event if it is onDidMount event
 */
- (void)didAddPropertyEvent:(const std::string &)name eventCallback:(NativeRenderDirectEventBlock)callback;

/**
 * Notify view event has been removed from view
 * @param name event name
 *
 * @discussion The default implementation of this method is to trigger onDidUnmount event if it is onDidUnmount event
 */
- (void)didRemovePropertyEvent:(const std::string &)name;

@end

NS_ASSUME_NONNULL_END
