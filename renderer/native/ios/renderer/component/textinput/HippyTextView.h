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
#import "HippyBaseTextInput.h"
#import "UIView+Hippy.h"

@protocol NativeRenderUITextViewResponseDelegate <NSObject>
@required
- (void)textview_becomeFirstResponder;
- (void)textview_resignFirstResponder;
@end

@interface NativeRenderUITextView : UITextView
@property (nonatomic, assign) BOOL textWasPasted;
@property (nonatomic, weak) id<NativeRenderUITextViewResponseDelegate> responderDelegate;
@end

@interface HippyTextView : HippyBaseTextInput <UITextViewDelegate> {
@protected
    NativeRenderUITextView *_textView;
}

@property (nonatomic, assign) BOOL autoCorrect;
@property (nonatomic, assign) BOOL blurOnSubmit;
@property (nonatomic, assign) BOOL clearTextOnFocus;
@property (nonatomic, assign) BOOL selectTextOnFocus;
@property (nonatomic, copy) NSString *text;
@property (nonatomic, strong) UIColor *placeholderTextColor;
@property (nonatomic, strong) UIFont *font;
@property (nonatomic, assign) NSInteger mostRecentEventCount;
@property (nonatomic, strong) NSNumber *maxLength;
@property (nonatomic, copy) HippyDirectEventBlock onKeyPress;
@property (nonatomic, copy) HippyDirectEventBlock onContentSizeChange;
@property (nonatomic, copy) HippyDirectEventBlock onSelectionChange;
@property (nonatomic, copy) HippyDirectEventBlock onTextInput;
@property (nonatomic, copy) HippyDirectEventBlock onEndEditing;

- (void)performTextUpdate;

@property (nonatomic, copy) NSString *value;
@property (nonatomic, strong) NSString *defaultValue;
@property (nonatomic, strong) UIColor *textColor;

/// ParagraphStyles - lineHeight
@property (nonatomic, strong) NSNumber *lineHeight;
/// ParagraphStyles - lineSpacing
@property (nonatomic, strong) NSNumber *lineSpacing;
/// ParagraphStyles - lineHeightMultiple
@property (nonatomic, strong) NSNumber *lineHeightMultiple;

@property (nonatomic, copy) HippyDirectEventBlock onChangeText;
@property (nonatomic, copy) HippyDirectEventBlock onBlur;
@property (nonatomic, copy) HippyDirectEventBlock onFocus;
@property (nonatomic, copy) HippyDirectEventBlock onKeyboardWillShow;
@property (nonatomic, copy) HippyDirectEventBlock onKeyboardWillHide;

- (void)updateFrames;
@end
