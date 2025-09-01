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

NS_ASSUME_NONNULL_BEGIN

#pragma mark - HippyUITextViewResponseDelegate

/// Delegate protocol for HippyUITextView focus state changes
@protocol HippyUITextViewResponseDelegate <NSObject>

@required
/// Called when text view becomes first responder
- (void)textview_becomeFirstResponder;

/// Called when text view resigns first responder
- (void)textview_resignFirstResponder;

@end

#pragma mark - HippyUITextView

/// Extended UITextView with Hippy-specific functionality
@interface HippyUITextView : UITextView

/// Whether the text view can be edited (iOS18 compatibility)
@property (nonatomic, assign) BOOL canEdit;

/// Indicates whether text was pasted in the current operation
@property (nonatomic, assign) BOOL textWasPasted;

/// Delegate for focus state changes
@property (nonatomic, weak, nullable) id<HippyUITextViewResponseDelegate> responderDelegate;

@end

#pragma mark - HippyTextView

/// Multi-line text input component for Hippy framework
@interface HippyTextView : HippyBaseTextInput <UITextViewDelegate> {
@protected
    HippyUITextView *_textView;
}

#pragma mark - Text Content Properties

/// Current text content
@property (nonatomic, copy, nullable) NSString *text;

/// Alternative text property for compatibility
@property (nonatomic, copy, nullable) NSString *value;

/// Initial text content
@property (nonatomic, strong, nullable) NSString *defaultValue;

#pragma mark - Behavior Control Properties

/// Enable/disable auto-correction
@property (nonatomic, assign) BOOL autoCorrect;

/// Whether to blur when submit/return is pressed
@property (nonatomic, assign) BOOL blurOnSubmit;

/// Whether to clear text when gaining focus
@property (nonatomic, assign) BOOL clearTextOnFocus;

/// Whether to select all text when gaining focus
@property (nonatomic, assign) BOOL selectTextOnFocus;

/// Maximum allowed text length
@property (nonatomic, strong, nullable) NSNumber *maxLength;

/// Event count for synchronization with JS
@property (nonatomic, assign) NSInteger mostRecentEventCount;

#pragma mark - Style Properties

/// Text font
@property (nonatomic, strong, nullable) UIFont *font;

/// Text color
@property (nonatomic, strong, nullable) UIColor *textColor;

/// Placeholder text color when no content is present
@property (nonatomic, strong, nullable) UIColor *placeholderTextColor;

#pragma mark - Paragraph Style Properties

/// Fixed line height for all lines
@property (nonatomic, strong, nullable) NSNumber *lineHeight;

/// Additional spacing between lines
@property (nonatomic, strong, nullable) NSNumber *lineSpacing;

/// Line height multiplier
@property (nonatomic, strong, nullable) NSNumber *lineHeightMultiple;

#pragma mark - Event Callbacks

/// Keyboard key press events
@property (nonatomic, copy, nullable) HippyDirectEventBlock onKeyPress;

/// Content size change events
@property (nonatomic, copy, nullable) HippyDirectEventBlock onContentSizeChange;

/// Text selection change events
@property (nonatomic, copy, nullable) HippyDirectEventBlock onSelectionChange;

/// Text input events
@property (nonatomic, copy, nullable) HippyDirectEventBlock onTextInput;

/// Editing end events
@property (nonatomic, copy, nullable) HippyDirectEventBlock onEndEditing;

/// Text content change events
@property (nonatomic, copy, nullable) HippyDirectEventBlock onChangeText;

/// Focus lost events
@property (nonatomic, copy, nullable) HippyDirectEventBlock onBlur;

/// Focus gained events
@property (nonatomic, copy, nullable) HippyDirectEventBlock onFocus;

#pragma mark - Public Methods

/// Update frame layout for text view and its subviews
- (void)updateFrames;

/// Perform pending text updates from rich text components
- (void)performTextUpdate;

@end

NS_ASSUME_NONNULL_END
