/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
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
