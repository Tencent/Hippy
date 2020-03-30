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

#import "HippyTextField.h"

#import "HippyConvert.h"
#import "HippyUtils.h"
#import "HippyTextSelection.h"
#import "UIView+Hippy.h"

@implementation HippyUITextField
{
  BOOL _jsRequestingFirstResponder;
}

- (void)setKeyboardType:(UIKeyboardType)keyboardType {
    NSString *tempPwdStr = self.text;
    self.text = @"";
  if (keyboardType == UIKeyboardTypeTwitter) {
    self.secureTextEntry = true;
  } else {
    self.secureTextEntry = false;
    [super setKeyboardType:keyboardType];
  }
    self.text = tempPwdStr;
}

- (void)setEditable:(BOOL)editable
{
  _editable = editable;
  [self setEnabled:editable];
}

- (void)paste:(id)sender
{
  _textWasPasted = YES;
  [super paste:sender];
}

- (void)hippyWillMakeFirstResponder
{
  _jsRequestingFirstResponder = YES;
}

- (BOOL)canBecomeFirstResponder
{
  return YES;
}

- (BOOL)becomeFirstResponder
{
  if (_responderDelegate && [_responderDelegate respondsToSelector: @selector(textview_becomeFirstResponder)]) {
    [_responderDelegate textview_becomeFirstResponder];
  }
  
  return [super becomeFirstResponder];
}

- (BOOL)resignFirstResponder
{
  if (_responderDelegate && [_responderDelegate respondsToSelector: @selector(textview_resignFirstResponder)]) {
    [_responderDelegate textview_resignFirstResponder];
  }
  return [super resignFirstResponder];
}

- (void)textview_becomeFirstResponder
{
  if (_onFocus){
    _onFocus(@{});
  }
}

- (void)textview_resignFirstResponder
{
  if (_onBlur) {
    _onBlur(@{});
  }
}


- (void)hippyDidMakeFirstResponder
{
  _jsRequestingFirstResponder = YES;
}

- (void)didMoveToWindow
{
  if (_jsRequestingFirstResponder) {
    [self becomeFirstResponder];
    [self hippyDidMakeFirstResponder];
  }
}

- (void)dealloc
{
  _responderDelegate = nil;
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

@end


@interface HippyTextField() <HippyUITextFieldResponseDelegate>
@end


@implementation HippyTextField
{
    UITextRange *_previousSelectionRange;
    HippyUITextField *_textView;
}

- (void)keyboardWillShow:(NSNotification *)aNotification
{
    [super keyboardWillShow:aNotification];
    NSDictionary *userInfo = [aNotification userInfo];
    NSValue *aValue = [userInfo objectForKey:UIKeyboardFrameEndUserInfoKey];
    CGRect keyboardRect = [aValue CGRectValue];
    CGFloat keyboardHeight = keyboardRect.size.height;
    if (_textView.isFirstResponder && _onKeyboardWillShow) {
        _onKeyboardWillShow(
                            @{@"keyboardHeight":@(keyboardHeight)}
                            );
    }
}

- (instancetype)init
{
  if ((self = [super initWithFrame:CGRectZero])) {
    [self setContentInset:UIEdgeInsetsZero];
    _textView = [[HippyUITextField alloc] initWithFrame:CGRectZero];
    _textView.responderDelegate = self;
    _textView.backgroundColor = [UIColor clearColor];
    _textView.textColor = [UIColor blackColor];
    _textView.delegate = self;
    [_textView addObserver:self forKeyPath:@"selectedTextRange" options:0 context:nil];
    [_textView addTarget:self action:@selector(textFieldDidChange) forControlEvents:UIControlEventEditingChanged];
    [_textView addTarget:self action:@selector(textFieldBeginEditing) forControlEvents:UIControlEventEditingDidBegin];
    [_textView addTarget:self action:@selector(textFieldSubmitEditing) forControlEvents:UIControlEventEditingDidEndOnExit];
    [self addSubview:_textView];
  }
  return self;
}

- (void)dealloc
{
    [_textView removeObserver:self forKeyPath:@"selectedTextRange"];
}

HIPPY_NOT_IMPLEMENTED(- (instancetype)initWithFrame:(CGRect)frame)
HIPPY_NOT_IMPLEMENTED(- (instancetype)initWithCoder:(NSCoder *)aDecoder)

// This method is overridden for `onKeyPress`. The manager
// will not send a keyPress for text that was pasted.
- (void)paste:(id)sender
{
    _textWasPasted = YES;
    [_textView paste:sender];
}

- (CGRect)textRectForBounds:(CGRect)bounds
{
    CGRect rect = [_textView textRectForBounds:bounds];
    return UIEdgeInsetsInsetRect(rect, self.contentInset);
}

- (CGRect)editingRectForBounds:(CGRect)bounds
{
    return [_textView textRectForBounds:bounds];
}

- (void)setAutoCorrect:(BOOL)autoCorrect
{
    _textView.autocorrectionType = (autoCorrect ? UITextAutocorrectionTypeYes : UITextAutocorrectionTypeNo);
}

- (BOOL)autoCorrect
{
    return _textView.autocorrectionType == UITextAutocorrectionTypeYes;
}

- (void)textFieldDidChange
{
    UITextRange *selectedRange = [_textView markedTextRange];
    NSString * newText = [_textView textInRange:selectedRange];
    /**获取中文输入法下高亮部分并直接返回不做_onChangeText */
    if (newText.length > 0) {
        return;
    }
    // selectedTextRange observer isn't triggered when you type even though the
    // cursor position moves, so we send event again here.
    
    if (!self.hippyTag || !_onChangeText) {
        return;
    }
    
    NSInteger theMaxLength = self.maxLength.integerValue;
    if (theMaxLength == 0) {
        theMaxLength = INT_MAX;
    }
    UITextField *textField = _textView;
    NSString *toBeString = textField.text;
    NSString *lang = [textField.textInputMode primaryLanguage];
    if ([lang isEqualToString:@"zh-Hans"])// 简体中文输入
    {
        NSString *toBeString = textField.text;
        
        UITextRange *selectedRange = [textField markedTextRange];
        UITextPosition *position = [textField positionFromPosition:selectedRange.start offset:0];
        
        if (!position)
        {
            if (toBeString.length > theMaxLength)
            {
                NSRange rangeIndex = [toBeString rangeOfComposedCharacterSequenceAtIndex:theMaxLength];
                if (rangeIndex.length == 1)
                {
                    textField.text = [toBeString substringToIndex:theMaxLength];
                }
                else
                {
                    NSRange rangeRange = [toBeString rangeOfComposedCharacterSequencesForRange:NSMakeRange(0, theMaxLength)];
                    textField.text = [toBeString substringWithRange:rangeRange];
                }
            }
        }
    }
    else
    {
        if (toBeString.length > theMaxLength)
        {
            NSRange rangeIndex = [toBeString rangeOfComposedCharacterSequenceAtIndex:theMaxLength];
            if (rangeIndex.length == 1)
            {
                textField.text = [toBeString substringToIndex:theMaxLength];
            }
            else
            {
                NSRange rangeRange = [toBeString rangeOfComposedCharacterSequencesForRange:NSMakeRange(0, theMaxLength)];
                textField.text = [toBeString substringWithRange:rangeRange];
            }
        }
    }
    
    
    
    _onChangeText(@{
                    @"text": _textView.text,
                    });
    
    [self sendSelectionEvent];
}


- (void)textFieldSubmitEditing
{
}

- (BOOL)textFieldShouldReturn:(UITextField *)textField {
  if (_onEndEditing) {
    _onEndEditing(@{
        @"text": textField.text,
    });
  }
    if (_onKeyPress) {
        _onKeyPress(@{
                        @"key": @"enter",
                        });
    }
  return YES;
}

#pragma mark - Notification Method

- (void)textFieldBeginEditing
{
    dispatch_async(dispatch_get_main_queue(), ^{
        [self sendSelectionEvent];
    });
}

- (void)observeValueForKeyPath:(NSString *)keyPath
                      ofObject:(__unused HippyTextField *)textField
                        change:(__unused NSDictionary *)change
                       context:(__unused void *)context
{
    if ([keyPath isEqualToString:@"selectedTextRange"]) {
        [self sendSelectionEvent];
    }
}

//defaultValue
- (void)setDefaultValue:(NSString *)defaultValue
{
    if (defaultValue && 0 == [self text].length) {
        [_textView setText:defaultValue];
    }
    _defaultValue = defaultValue;
}

//focus/blur
- (void)focus{
    [_textView becomeFirstResponder];
}

- (void)blur{
    [_textView resignFirstResponder];
}

- (BOOL)becomeFirstResponder
{
  return [_textView becomeFirstResponder];
}

- (void)textview_becomeFirstResponder
{
  if (_onFocus){
    _onFocus(@{});
  }
}

- (void)textview_resignFirstResponder
{
  if (_onBlur) {
    _onBlur(@{});
  }
}


- (BOOL)resignFirstResponder
{
  [super resignFirstResponder];
  return [_textView resignFirstResponder];
}

- (void)updateFrames
{
  _textView.frame = self.bounds;
}

- (void)layoutSubviews
{
  [super layoutSubviews];
  
  // Start sending content size updates only after the view has been laid out
  // otherwise we send multiple events with bad dimensions on initial render.
//  _viewDidCompleteInitialLayout = YES;
  
  [self updateFrames];
}

- (void)setContentInset:(UIEdgeInsets)contentInset
{
  [super setContentInset:contentInset];
  [self updateFrames];
}

- (void)setPlaceholder:(NSString *)placeholder
{
  if (_placeholderTextColor) {
    _placeholder = placeholder;
    _textView.attributedPlaceholder = [[NSAttributedString alloc] initWithString:placeholder attributes:@{NSForegroundColorAttributeName: _placeholderTextColor}];
  } else {
    _textView.placeholder = placeholder;
  }
  
}
- (void)setText:(NSString *)text
{
    double version = UIDevice.currentDevice.systemVersion.doubleValue;
    if (version >= 10.0 && version < 12.0) {
        text = [text stringByReplacingOccurrencesOfString:@"జ్ఞ‌ా" withString:@" "];
    }
    
  _textView.text = text;
    _text = text;
}

- (void)setPlaceholderTextColor:(UIColor *)placeholderTextColor
{
  _placeholderTextColor = placeholderTextColor;
  if (_placeholder) {
      _textView.attributedPlaceholder = [[NSAttributedString alloc] initWithString:_placeholder attributes:@{NSForegroundColorAttributeName: placeholderTextColor}];
  }
}

- (void)setFontSize:(NSNumber *)fontSize
{
  _fontSize = fontSize;
  if ([fontSize floatValue] > 0) {
    [_textView setFont:[UIFont systemFontOfSize:[fontSize floatValue]]];
  }

}

- (void)setValue:(NSString *)value
{
  [_textView setText:value];
}

- (NSString *)value {
    return _textView.text;
}

- (void)setFont:(UIFont *)font
{
  _textView.font = font;
}

- (void) setTextColor:(UIColor *)textColor {
    _textView.textColor = textColor;
}

- (UIColor *) textColor {
    return _textView.textColor;
}

- (UIFont *)font
{
  return _textView.font;
}

- (void)sendSelectionEvent
{
  if (_onSelectionChange &&
      _textView.selectedTextRange != _previousSelectionRange &&
      ![_textView.selectedTextRange isEqual:_previousSelectionRange]) {
    
    _previousSelectionRange = _textView.selectedTextRange;
    
    UITextRange *selection = _textView.selectedTextRange;
    NSInteger start = [_textView offsetFromPosition:[_textView beginningOfDocument] toPosition:selection.start];
    NSInteger end = [_textView offsetFromPosition:[_textView beginningOfDocument] toPosition:selection.end];
    _onSelectionChange(@{
                         @"selection": @{
                             @"start": @(start),
                             @"end": @(end),
                             },
                         });
  }
}


- (void)clearText
{
  [_textView setText:@""];
}

- (BOOL)textField:(UITextField *)textField shouldChangeCharactersInRange:(NSRange)range replacementString:(NSString *)string {
    if (_onKeyPress) {
        NSString *resultKey = string;
        if ([string isEqualToString:@" "]) {
            resultKey = @"space";
        } else if ([string isEqualToString:@""]) {
            resultKey = @"backspace";
        } else if ([string isEqualToString:@"\n"]) {
            resultKey = @"enter";//理论上这里没有enter，不过加一个总没错
        }
        _onKeyPress(@{@"key":resultKey});
    }
    NSString *toBeString = [textField.text stringByReplacingCharactersInRange:range withString:string];
    if (textField.isSecureTextEntry) {
        textField.text = toBeString;
        return NO;
    }
    return YES;
}

@end
