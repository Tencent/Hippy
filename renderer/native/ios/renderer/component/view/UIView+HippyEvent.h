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

#import <UIKit/UIKit.h>
#import "HippyComponent.h"
#import "HippyTouchesView.h"
#include <string>

NS_ASSUME_NONNULL_BEGIN

/**
 * A catagory to handle HippyTouchesProtocol
 * Empty implementation for [HippyTouchesProtocol addViewEvent:eventListener:], [HippyTouchesProtocol removeViewEvent]
 * Return NO for [HippyTouchesProtocol canBePreventedByInCapturing:], [HippyTouchesProtocol canBePreventedByInCapturing:]
 * Return NULL for [HippyTouchesProtocol eventListenerForEventType:]
 */

@interface UIView(HippyEvent)<HippyTouchesProtocol>

/**
 * add status change event for view
 * @param name event name
 * @param callback event call back for event
 */
- (void)addStatusChangeEvent:(const std::string &)name eventCallback:(HippyDirectEventBlock)callback;

/**
 * remove status change event for view
 * @param name event name
 */
- (void)removeStatusChangeEvent:(const std::string &)name;

/**
 * notify view event has been added
 * @param name event name
 * @param callback event block
 *
 * @discussion The default implementation of this method is to trigger onDidMount event if it is onDidMount event
 */
- (void)didAddStatusChangeEvent:(const std::string &)name eventCallback:(HippyDirectEventBlock)callback;

/**
 * notify view event has been removed from view
 * @param name event name
 *
 * @discussion The default implementation of this method is to trigger onDidUnmount event if it is onDidUnmount event
 */
- (void)didRemoveStatusChangeEvent:(const std::string &)name;

@end

NS_ASSUME_NONNULL_END
