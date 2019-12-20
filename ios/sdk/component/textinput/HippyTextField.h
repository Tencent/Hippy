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

#import "HippyView.h"
#import "HippyComponent.h"
#import "HippyBaseTextInput.h"

@class HippyEventDispatcher;

@protocol HippyUITextFieldResponseDelegate <NSObject>
@required
- (void)textview_becomeFirstResponder;
- (void)textview_resignFirstResponder;
@end

@interface HippyUITextField : UITextField
@property (nonatomic, assign) BOOL textWasPasted;
@property (nonatomic, weak) id <HippyUITextFieldResponseDelegate> responderDelegate;

@property (nonatomic, copy) HippyDirectEventBlock onBlur;
@property (nonatomic, copy) HippyDirectEventBlock onFocus;
@property (nonatomic, assign) BOOL editable;
@end

@interface HippyTextField : HippyBaseTextInput<UITextFieldDelegate>
@property (nonatomic, copy) HippyDirectEventBlock onKeyPress;
@property (nonatomic, assign) BOOL autoCorrect;
//@property (nonatomic, assign) UIEdgeInsets contentInset;
@property (nonatomic, strong) UIColor *placeholderTextColor;
@property (nonatomic, strong) NSString *placeholder;
@property (nonatomic, strong) NSNumber *maxLength;
@property (nonatomic, assign) BOOL textWasPasted;

@property (nonatomic, copy) HippyDirectEventBlock onSelectionChange;

- (void)textFieldDidChange;

@property (nonatomic, copy) HippyDirectEventBlock onChangeText;

//focus/blur
- (void)focus;
- (void)blur;
- (void)keyboardWillShow:(NSNotification *)aNotification;

@property (nonatomic, copy) HippyDirectEventBlock onBlur;
@property (nonatomic, copy) HippyDirectEventBlock onFocus;
@property (nonatomic, copy) HippyDirectEventBlock onEndEditing;
@property (nonatomic, copy) HippyDirectEventBlock onKeyboardWillShow;

@property (nonatomic, copy)   NSString* value;
@property (nonatomic, strong) NSNumber* fontSize;
@property (nonatomic, strong) NSString* defaultValue;
@property (nonatomic, copy) NSString *text;
@property (nonatomic, strong) UIColor *textColor;
- (void)clearText;
@end
