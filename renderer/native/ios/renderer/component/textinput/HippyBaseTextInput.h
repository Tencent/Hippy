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

#import "HippyView.h"

@interface HippyBaseTextInput : HippyView

/// Font property - FontSize
@property (nonatomic, strong) NSNumber *fontSize;
/// Font property - FontWeight
@property (nonatomic, strong) NSString *fontWeight;
/// Font property - FontStyle
@property (nonatomic, strong) NSString *fontStyle;
/// Font property - FontFamily
@property (nonatomic, strong) NSString *fontFamily;

/// Multiplier of fontSize,
/// Can be used to adapt the system's dynamic font Settings
@property (nonatomic, assign) CGFloat fontSizeMultiplier;

@property (nonatomic, strong) UIFont *font;
@property (nonatomic, assign) UIEdgeInsets contentInset;
@property (nonatomic, copy) NSString *value;

/// Keyboard will show event
@property (nonatomic, copy) HippyDirectEventBlock onKeyboardWillShow;
/// Keyboard will hide event
@property (nonatomic, copy) HippyDirectEventBlock onKeyboardWillHide;
/// Keyboard height change event
@property (nonatomic, copy) HippyDirectEventBlock onKeyboardHeightChanged;

- (void)focus;
- (void)blur;
- (void)clearText;

@end
