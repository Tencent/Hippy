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

/**
 * Defines a View that wants to support auto insets adjustment
 */
@protocol HippyAutoInsetsProtocol

@property (nonatomic, assign, readwrite) UIEdgeInsets contentInset;
@property (nonatomic, assign, readwrite) BOOL automaticallyAdjustContentInsets;

/**
 * Automatically adjusted content inset depends on view controller's top and bottom
 * layout guides so if you've changed one of them (e.g. after rotation or manually) you should call this method
 * to recalculate and refresh content inset.
 * To handle case with changing navigation bar height call this method from viewDidLayoutSubviews:
 * of your view controller.
 */
- (void)refreshContentInset;

@end
