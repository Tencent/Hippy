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
#import "HippyBaseTextInput.h"
#import "UIView+React.h"

@class HippyEventDispatcher;

@protocol HippyUITextViewResponseDelegate <NSObject>
@required
- (void)textview_becomeFirstResponder;
- (void)textview_resignFirstResponder;
@end

@interface HippyUITextView : UITextView
@property (nonatomic, assign) BOOL textWasPasted;
@property (nonatomic, weak) id <HippyUITextViewResponseDelegate> responderDelegate;
@end

@interface HippyTextView : HippyBaseTextInput <UITextViewDelegate> {
@protected
      HippyUITextView *_textView;
}

@property (nonatomic, assign) BOOL autoCorrect;
@property (nonatomic, assign) BOOL blurOnSubmit;
@property (nonatomic, assign) BOOL clearTextOnFocus;
@property (nonatomic, assign) BOOL selectTextOnFocus;
//@property (nonatomic, assign) UIEdgeInsets contentInset;
@property (nonatomic, assign) BOOL automaticallyAdjustContentInsets;
@property (nonatomic, copy) NSString *text;
@property (nonatomic, strong) UIColor *placeholderTextColor;
@property (nonatomic, strong) UIFont *font;
@property (nonatomic, assign) NSInteger mostRecentEventCount;
@property (nonatomic, strong) NSNumber *maxLength;
@property (nonatomic, copy) HippyDirectEventBlock onKeyPress;

//@property (nonatomic, copy) HippyDirectEventBlock onChange;
@property (nonatomic, copy) HippyDirectEventBlock onContentSizeChange;
@property (nonatomic, copy) HippyDirectEventBlock onSelectionChange;
@property (nonatomic, copy) HippyDirectEventBlock onTextInput;
@property (nonatomic, copy) HippyDirectEventBlock onEndEditing;

- (void)performTextUpdate;

@property (nonatomic, copy)   NSString* value;
@property (nonatomic, strong) NSNumber* fontSize;
@property (nonatomic, strong) NSString* defaultValue;
@property (nonatomic, strong) UIColor *textColor;
@property (nonatomic, copy) HippyDirectEventBlock onChangeText;
@property (nonatomic, copy) HippyDirectEventBlock onBlur;
@property (nonatomic, copy) HippyDirectEventBlock onFocus;
@property (nonatomic, copy) HippyDirectEventBlock onKeyboardWillShow;

- (void)focus;
- (void)blur;
- (void)keyboardWillShow:(NSNotification *)aNotification;
- (void)clearText;
- (void)updateFrames;
@end
