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

#import "HippyBaseTextInput.h"
#import "HippyFont.h"

static NSString *const kKeyboardHeightKey = @"keyboardHeight";

@implementation HippyBaseTextInput

- (void)focus {
    // base method, should be override
}
- (void)blur {
    // base method, should be override
}
- (void)clearText {
    // base method, should be override
}

- (void)keyboardWillShow:(NSNotification *)aNotification {
    // base method, should be override
    NSDictionary *userInfo = [aNotification userInfo];
    NSValue *aValue = [userInfo objectForKey:UIKeyboardFrameEndUserInfoKey];
    CGRect keyboardRect = [aValue CGRectValue];
    CGFloat keyboardHeight = keyboardRect.size.height;
    if (self.isFirstResponder && self.onKeyboardWillShow) {
        self.onKeyboardWillShow(@{ kKeyboardHeightKey : @(keyboardHeight) });
    }
}

- (void)keyboardWillHide:(NSNotification *)aNotification {
    // base method, should be override
    if (self.onKeyboardWillHide) {
        self.onKeyboardWillHide(@{});
    }
}

- (void)keyboardHeightChanged:(NSNotification *)aNotification {
    // base method, should be override
    NSDictionary *userInfo = [aNotification userInfo];
    NSValue *aValue = [userInfo objectForKey:UIKeyboardFrameEndUserInfoKey];
    CGRect keyboardRect = [aValue CGRectValue];
    CGFloat keyboardHeight = keyboardRect.size.height;
    if (self.isFirstResponder && self.onKeyboardHeightChanged) {
        self.onKeyboardHeightChanged(@{ kKeyboardHeightKey : @(keyboardHeight) });
    }
}

- (void)setOnKeyboardWillShow:(HippyDirectEventBlock)onKeyboardWillShow {
    if (_onKeyboardWillShow != onKeyboardWillShow) {
        _onKeyboardWillShow = [onKeyboardWillShow copy];
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(keyboardWillShow:)
                                                     name:UIKeyboardWillShowNotification
                                                   object:nil];
    }
}

- (void)setOnKeyboardWillHide:(HippyDirectEventBlock)onKeyboardWillHide {
    if (_onKeyboardWillHide != onKeyboardWillHide) {
        _onKeyboardWillHide = [onKeyboardWillHide copy];
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(keyboardWillHide:)
                                                     name:UIKeyboardWillHideNotification
                                                   object:nil];
    }
}

- (void)setOnKeyboardHeightChanged:(HippyDirectEventBlock)onKeyboardHeightChanged {
    if (_onKeyboardHeightChanged != onKeyboardHeightChanged) {
        _onKeyboardHeightChanged = [onKeyboardHeightChanged copy];
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(keyboardHeightChanged:)
                                                     name:UIKeyboardWillChangeFrameNotification
                                                   object:nil];
    }
}


#pragma mark - Hippy Update Callback

- (void)hippyBridgeDidFinishTransaction {
    // Use this opportunity to update font if needed.
    [self layoutIfNeeded];
}

- (void)layoutSubviews {
    [super layoutSubviews];
    [self rebuildAndUpdateFont];
}


#pragma mark - Font Related

- (void)setFontSize:(NSNumber *)fontSize {
    _fontSize = fontSize;
    [self setNeedsLayout];
}

- (void)setFontStyle:(NSString *)fontStyle {
    _fontStyle = fontStyle;
    [self setNeedsLayout];
}

- (void)setFontWeight:(NSString *)fontWeight {
    _fontWeight = fontWeight;
    [self setNeedsLayout];
}

- (void)setFontFamily:(NSString *)fontFamily {
    _fontFamily = fontFamily;
    [self setNeedsLayout];
}

- (void)rebuildAndUpdateFont {
    // Convert fontName to fontFamily if needed
    CGFloat scaleMultiplier = 1.0; // scale not supported
    NSString *familyName = [HippyFont familyNameWithCSSNameMatching:self.fontFamily];
    UIFont *font = [HippyFont updateFont:self.font
                              withFamily:familyName
                                    size:self.fontSize
                                  weight:self.fontWeight
                                   style:self.fontStyle
                                 variant:nil
                         scaleMultiplier:scaleMultiplier];
    if (self.font != font) {
        self.font = font;
    }
}

@end
