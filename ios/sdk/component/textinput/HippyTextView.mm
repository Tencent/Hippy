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

#import "HippyTextView.h"

#import "HippyConvert.h"
#import "HippyShadowText.h"
#import "HippyText.h"
#import "HippyUtils.h"
#import "HippyTextSelection.h"
#import "UIView+React.h"

@implementation HippyUITextView
{
  BOOL _jsRequestingFirstResponder;
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
  //return _jsRequestingFirstResponder;
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

@interface HippyTextView() <HippyUITextViewResponseDelegate>
@end

@implementation HippyTextView
{
  NSString *_placeholder;
  UITextView *_placeholderView;
  HippyText *_richTextView;
  NSAttributedString *_pendingAttributedText;
  UIScrollView *_scrollView;

  UITextRange *_previousSelectionRange;
  NSUInteger _previousTextLength;
  CGFloat _previousContentHeight;
  NSString *_predictedText;

  BOOL _blockTextShouldChange;
  BOOL _nativeUpdatesInFlight;
  NSInteger _nativeEventCount;

  CGSize _previousContentSize;
  BOOL _viewDidCompleteInitialLayout;
}

//当键盘出现或改变时调用
- (void)keyboardWillShow:(NSNotification *)aNotification
{
    [super keyboardWillShow:aNotification];
    //获取键盘的高度
    NSDictionary *userInfo = [aNotification userInfo];
    NSValue *aValue = [userInfo objectForKey:UIKeyboardFrameEndUserInfoKey];
    CGRect keyboardRect = [aValue CGRectValue];
    CGFloat keyboardHeight = keyboardRect.size.height;
    if (self.isFirstResponder && _onKeyboardWillShow) {
        _onKeyboardWillShow(
                            @{@"keyboardHeight":@(keyboardHeight)}
                            );
    }
    
}

- (instancetype)init
{
  if ((self = [super initWithFrame:CGRectZero])) {
//    _contentInset = UIEdgeInsetsZero;
    [self setContentInset:UIEdgeInsetsZero];
    _placeholderTextColor = [self defaultPlaceholderTextColor];
    _blurOnSubmit = NO;

    _textView = [[HippyUITextView alloc] initWithFrame:CGRectZero];
		_textView.responderDelegate = self;
    _textView.backgroundColor = [UIColor clearColor];
    _textView.textColor = [UIColor blackColor];
#if !TARGET_OS_TV
    _textView.scrollsToTop = NO;
#endif
    _textView.scrollEnabled = NO;
    _textView.delegate = self;

    _scrollView = [[UIScrollView alloc] initWithFrame:CGRectZero];
#if !TARGET_OS_TV
    _scrollView.scrollsToTop = NO;
#endif
    [_scrollView addSubview:_textView];

      
      [[NSNotificationCenter defaultCenter] addObserver:self
                                               selector:@selector(textFieldEditChanged:)
                                                   name:UITextViewTextDidChangeNotification
                                                 object:_textView];
      
    [self addSubview:_scrollView];
  }
  return self;
}

HIPPY_NOT_IMPLEMENTED(- (instancetype)initWithFrame:(CGRect)frame)
HIPPY_NOT_IMPLEMENTED(- (instancetype)initWithCoder:(NSCoder *)aDecoder)

- (void)insertHippySubview:(UIView *)subview atIndex:(NSInteger)index
{
  [super insertHippySubview:subview atIndex:index];
  if ([subview isKindOfClass:[HippyText class]]) {
    if (_richTextView) {
      HippyLogError(@"Tried to insert a second <Text> into <TextInput> - there can only be one.");
    }
    _richTextView = (HippyText *)subview;

    if (subview.backgroundColor) {
      NSMutableDictionary<NSString *, id> *attrs = [_textView.typingAttributes mutableCopy];
      attrs[NSBackgroundColorAttributeName] = subview.backgroundColor;
      _textView.typingAttributes = attrs;
    }

    [self performTextUpdate];
  }
}

- (void)removeHippySubview:(UIView *)subview
{
  [super removeHippySubview:subview];
  if (_richTextView == subview) {
    _richTextView = nil;
    [self performTextUpdate];
  }
}

- (void)didUpdateHippySubviews
{
  // Do nothing, as we don't allow non-text subviews
}

- (void)setMostRecentEventCount:(NSInteger)mostRecentEventCount
{
  _mostRecentEventCount = mostRecentEventCount;

  // Props are set after uiBlockToAmendWithShadowViewRegistry, which means that
  // at the time performTextUpdate is called, _mostRecentEventCount will be
  // behind _eventCount, with the result that performPendingTextUpdate will do
  // nothing. For that reason we call it again here after mostRecentEventCount
  // has been set.
  [self performPendingTextUpdate];
}

- (void)performTextUpdate
{
  if (_richTextView) {
    _pendingAttributedText = _richTextView.textStorage;
    [self performPendingTextUpdate];
  } else if (!self.text) {
    _textView.attributedText = nil;
  }
}

static NSAttributedString *removeHippyTagFromString(NSAttributedString *string)
{
  if (string.length == 0) {
    return string;
  } else {
    NSMutableAttributedString *mutableString = [[NSMutableAttributedString alloc] initWithAttributedString:string];
    [mutableString removeAttribute:HippyHippyTagAttributeName range:NSMakeRange(0, mutableString.length)];
    return mutableString;
  }
}

- (void)performPendingTextUpdate
{
  if (!_pendingAttributedText || _mostRecentEventCount < _nativeEventCount || _nativeUpdatesInFlight) {
    return;
  }

  // The underlying <Text> node that produces _pendingAttributedText has a hippy tag attribute on it that causes the
  // -isEqualToAttributedString: comparison below to spuriously fail. We don't want that comparison to fail unless it
  // needs to because when the comparison fails, we end up setting attributedText on the text view, which clears
  // autocomplete state for CKJ text input.
  //
  // TODO: Kill this after we finish passing all style/attribute info into JS.
  _pendingAttributedText = removeHippyTagFromString(_pendingAttributedText);

  if ([_textView.attributedText isEqualToAttributedString:_pendingAttributedText]) {
    _pendingAttributedText = nil; // Don't try again.
    return;
  }

  // When we update the attributed text, there might be pending autocorrections
  // that will get accepted by default. In order for this to not garble our text,
  // we temporarily block all textShouldChange events so they are not applied.
  _blockTextShouldChange = YES;

  UITextRange *selection = _textView.selectedTextRange;
  NSInteger oldTextLength = _textView.attributedText.length;

  _textView.attributedText = _pendingAttributedText;
  _predictedText = _pendingAttributedText.string;
  _pendingAttributedText = nil;

  if (selection.empty) {
    // maintain cursor position relative to the end of the old text
    NSInteger start = [_textView offsetFromPosition:_textView.beginningOfDocument toPosition:selection.start];
    NSInteger offsetFromEnd = oldTextLength - start;
    NSInteger newOffset = _textView.attributedText.length - offsetFromEnd;
    UITextPosition *position = [_textView positionFromPosition:_textView.beginningOfDocument offset:newOffset];
    _textView.selectedTextRange = [_textView textRangeFromPosition:position toPosition:position];
  }

  [_textView layoutIfNeeded];

  [self updatePlaceholderVisibility];

  _blockTextShouldChange = NO;
}

- (void)updateFrames
{
  // Adjust the insets so that they are as close as possible to single-line
  // HippyTextField defaults, using the system defaults of font size 17 and a
  // height of 31 points.
  //
  // We apply the left inset to the frame since a negative left text-container
  // inset mysteriously causes the text to be hidden until the text view is
  // first focused.
  UIEdgeInsets adjustedFrameInset = UIEdgeInsetsZero;
  adjustedFrameInset.left = [self contentInset].left - 5;

  UIEdgeInsets adjustedTextContainerInset = [self contentInset];
//  adjustedTextContainerInset.top += 5;
  adjustedTextContainerInset.left = 0;

  CGRect frame = UIEdgeInsetsInsetRect(self.bounds, adjustedFrameInset);
  _textView.frame = frame;
  _placeholderView.frame = frame;
  _scrollView.frame = frame;
  [self updateContentSize];

  _textView.textContainerInset = adjustedTextContainerInset;
  _placeholderView.textContainerInset = adjustedTextContainerInset;
}

- (void)updateContentSize
{
  CGSize size = (CGSize){_scrollView.frame.size.width, INFINITY};
  size.height = [_textView sizeThatFits:size].height;
  _scrollView.contentSize = size;
  _textView.frame = (CGRect){CGPointZero, size};

  if (_viewDidCompleteInitialLayout && _onContentSizeChange && !CGSizeEqualToSize(_previousContentSize, size)) {
    _previousContentSize = size;
    _onContentSizeChange(@{
      @"contentSize": @{
        @"height": @(size.height),
        @"width": @(size.width),
      },
      @"target": self.hippyTag,
    });
  }
}

- (void)updatePlaceholder
{
  [_placeholderView removeFromSuperview];
  _placeholderView = nil;

  if (_placeholder) {
    _placeholderView = [[UITextView alloc] initWithFrame:self.bounds];
    _placeholderView.userInteractionEnabled = NO;
    _placeholderView.backgroundColor = [UIColor clearColor];
    _placeholderView.scrollEnabled = NO;
#if !TARGET_OS_TV
    _placeholderView.editable = NO;
    _placeholderView.scrollsToTop = NO;
#endif
    _placeholderView.attributedText =
    [[NSAttributedString alloc] initWithString:_placeholder attributes:@{
      NSFontAttributeName : (_textView.font ? _textView.font : [self defaultPlaceholderFont]),
      NSForegroundColorAttributeName : _placeholderTextColor
    }];
    _placeholderView.textAlignment = _textView.textAlignment;

    [self insertSubview:_placeholderView belowSubview:_textView];
    [self updatePlaceholderVisibility];
  }
}

- (UIFont *)font
{
  return _textView.font;
}

- (void)setFont:(UIFont *)font
{
  _textView.font = font;
  [self updatePlaceholder];
}

- (void)setPlaceholder:(NSString *)placeholder
{
  _placeholder = placeholder;
  [self updatePlaceholder];
}

- (void)setPlaceholderTextColor:(UIColor *)placeholderTextColor
{
  if (placeholderTextColor) {
    _placeholderTextColor = placeholderTextColor;
  } else {
    _placeholderTextColor = [self defaultPlaceholderTextColor];
  }
  [self updatePlaceholder];
}

- (void)setContentInset:(UIEdgeInsets)contentInset
{
  [super setContentInset:contentInset];
//  _contentInset = contentInset;
  [self updateFrames];
}

- (void)textFieldEditChanged:(NSNotification *)obj {
    if (self.isFirstResponder && _maxLength) {
        UITextView *textField = (UITextView *)obj.object;
        NSInteger theMaxLength = self.maxLength.integerValue;
        NSString *toBeString = textField.text;
        NSString *lang = [textField.textInputMode primaryLanguage];
        if ([lang isEqualToString:@"zh-Hans"])// 简体中文输入
        {
            NSString *toBeString = textField.text;
            
            //获取高亮部分
            UITextRange *selectedRange = [textField markedTextRange];
            UITextPosition *position = [textField positionFromPosition:selectedRange.start offset:0];
            
            // 没有高亮选择的字，则对已输入的文字进行字数统计和限制
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
        // 中文输入法以外的直接对其统计限制即可，不考虑其他语种情况
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
    }
}

- (BOOL)textView:(HippyUITextView *)textView shouldChangeTextInRange:(NSRange)range replacementText:(NSString *)text
{
    if (_onKeyPress) {
        NSString *resultKey = text;
        if ([text isEqualToString:@" "]) {
            resultKey = @"space";
        } else if ([text isEqualToString:@""]) {
            resultKey = @"backspace";
        } else if ([text isEqualToString:@"\n"]) {
            resultKey = @"enter";
        }
        _onKeyPress(@{@"key":resultKey});
    }
    
  if (textView.textWasPasted) {
    textView.textWasPasted = NO;
  } else {
    if (_blurOnSubmit && [text isEqualToString:@"\n"]) {
      // TODO: the purpose of blurOnSubmit on HippyextField is to decide if the
      // field should lose focus when return is pressed or not. We're cheating a
      // bit here by using it on HippyextView to decide if return character should
      // submit the form, or be entered into the field.
      //
      // The reason this is cheating is because there's no way to specify that
      // you want the return key to be swallowed *and* have the field retain
      // focus (which was what blurOnSubmit was originally for). For the case
      // where _blurOnSubmit = YES, this is still the correct and expected
      // behavior though, so we'll leave the don't-blur-or-add-newline problem
      // to be solved another day.
      [self resignFirstResponder];
      if (_onBlur) {
        _onBlur(@{});
      }
      return NO;
    }
  }

  // So we need to track that there is a native update in flight just in case JS manages to come back around and update
  // things /before/ UITextView can update itself asynchronously.  If there is a native update in flight, we defer the
  // JS update when it comes in and apply the deferred update once textViewDidChange fires with the native update applied.
  if (_blockTextShouldChange) {
    return NO;
  }

  _nativeUpdatesInFlight = YES;

  if (range.location + range.length > _predictedText.length) {
    // _predictedText got out of sync in a bad way, so let's just force sync it.  Haven't been able to repro this, but
    // it's causing a real crash here: #6523822
    _predictedText = textView.text;
  }

  NSString *previousText = [_predictedText substringWithRange:range];
  if (_predictedText) {
    _predictedText = [_predictedText stringByReplacingCharactersInRange:range withString:text];
  } else {
    _predictedText = text;
  }

  if (_onTextInput) {
    _onTextInput(@{
      @"text": text,
      @"previousText": previousText ?: @"",
      @"range": @{
        @"start": @(range.location),
        @"end": @(range.location + range.length)
      },
      @"eventCount": @(_nativeEventCount),
    });
  }

  return YES;
}

- (void)textViewDidChangeSelection:(HippyUITextView *)textView
{
  if (_onSelectionChange &&
      textView.selectedTextRange != _previousSelectionRange &&
      ![textView.selectedTextRange isEqual:_previousSelectionRange]) {

    _previousSelectionRange = textView.selectedTextRange;

    UITextRange *selection = textView.selectedTextRange;
    NSInteger start = [textView offsetFromPosition:textView.beginningOfDocument toPosition:selection.start];
    NSInteger end = [textView offsetFromPosition:textView.beginningOfDocument toPosition:selection.end];
    _onSelectionChange(@{
      @"selection": @{
        @"start": @(start),
        @"end": @(end),
      },
    });

    if (_onChangeText) {
      _onChangeText(@{
                      @"text": self.text,
                      });
    }
  }
}

- (NSString *)text
{
  return _textView.text;
}

- (void)setSelection:(HippyTextSelection *)selection
{
  if (!selection) {
    return;
  }

  UITextRange *currentSelection = _textView.selectedTextRange;
  UITextPosition *start = [_textView positionFromPosition:_textView.beginningOfDocument offset:selection.start];
  UITextPosition *end = [_textView positionFromPosition:_textView.beginningOfDocument offset:selection.end];
  UITextRange *selectedTextRange = [_textView textRangeFromPosition:start toPosition:end];

  NSInteger eventLag = _nativeEventCount - _mostRecentEventCount;
  if (eventLag == 0 && ![currentSelection isEqual:selectedTextRange]) {
    _previousSelectionRange = selectedTextRange;
    _textView.selectedTextRange = selectedTextRange;
  } else if (eventLag > HippyTextUpdateLagWarningThreshold) {
      HippyLogWarn(@"Native TextInput(%@) is %ld events ahead of JS - try to make your JS faster.", self.text, (long)eventLag);
  }
}

- (void)setText:(NSString *)text
{
    double version = UIDevice.currentDevice.systemVersion.doubleValue;
    if (version >= 10.0 && version < 12.0) {
        text = [text stringByReplacingOccurrencesOfString:@"జ్ఞ‌ా" withString:@" "];
    }
    
  NSInteger eventLag = _nativeEventCount - _mostRecentEventCount;
  if (eventLag == 0 && ![text isEqualToString:_textView.text]) {
    UITextRange *selection = _textView.selectedTextRange;
    NSInteger oldTextLength = _textView.text.length;

    _predictedText = text;
    _textView.text = text;
    [self textViewDidChange:_textView];
    if (selection.empty) {
      // maintain cursor position relative to the end of the old text
      NSInteger start = [_textView offsetFromPosition:_textView.beginningOfDocument toPosition:selection.start];
      NSInteger offsetFromEnd = oldTextLength - start;
      NSInteger newOffset = text.length - offsetFromEnd;
      UITextPosition *position = [_textView positionFromPosition:_textView.beginningOfDocument offset:newOffset];
      _textView.selectedTextRange = [_textView textRangeFromPosition:position toPosition:position];
    }

    [self updatePlaceholderVisibility];
    [self updateContentSize]; //keep the text wrapping when the length of
    //the textline has been extended longer than the length of textinputView
  } else if (eventLag > HippyTextUpdateLagWarningThreshold) {
      HippyLogWarn(@"Native TextInput(%@) is %ld events ahead of JS - try to make your JS faster.", self.text, (long)eventLag);
  }
}

- (void) setTextColor:(UIColor *)textColor {
    _textView.textColor = textColor;
}

- (UIColor *) textColor {
    return _textView.textColor;
}

- (void)updatePlaceholderVisibility
{
  if (_textView.text.length > 0) {
    [_placeholderView setHidden:YES];
  } else {
    [_placeholderView setHidden:NO];
  }
}

- (void)setAutoCorrect:(BOOL)autoCorrect
{
  _textView.autocorrectionType = (autoCorrect ? UITextAutocorrectionTypeYes : UITextAutocorrectionTypeNo);
}

- (BOOL)autoCorrect
{
  return _textView.autocorrectionType == UITextAutocorrectionTypeYes;
}

- (BOOL)textViewShouldBeginEditing:(UITextView *)textView
{
  if (_selectTextOnFocus) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [textView selectAll:nil];
    });
  }
  return YES;
}

- (void)textViewDidBeginEditing:(__unused UITextView *)textView
{
  if (_clearTextOnFocus) {
    _textView.text = @"";
    [self updatePlaceholderVisibility];
  }
}

static BOOL findMismatch(NSString *first, NSString *second, NSRange *firstRange, NSRange *secondRange)
{
  NSInteger firstMismatch = -1;
  for (NSUInteger ii = 0; ii < MAX(first.length, second.length); ii++) {
    if (ii >= first.length || ii >= second.length || [first characterAtIndex:ii] != [second characterAtIndex:ii]) {
      firstMismatch = ii;
      break;
    }
  }

  if (firstMismatch == -1) {
    return NO;
  }

  NSUInteger ii = second.length;
  NSUInteger lastMismatch = first.length;
  while (ii > firstMismatch && lastMismatch > firstMismatch) {
    if ([first characterAtIndex:(lastMismatch - 1)] != [second characterAtIndex:(ii - 1)]) {
      break;
    }
    ii--;
    lastMismatch--;
  }

  *firstRange = NSMakeRange(firstMismatch, lastMismatch - firstMismatch);
  *secondRange = NSMakeRange(firstMismatch, ii - firstMismatch);
  return YES;
}

- (void)textViewDidChange:(UITextView *)textView
{
  [self updatePlaceholderVisibility];
  [self updateContentSize];

  // Detect when textView updates happend that didn't invoke `shouldChangeTextInRange`
  // (e.g. typing simplified chinese in pinyin will insert and remove spaces without
  // calling shouldChangeTextInRange).  This will cause JS to get out of sync so we
  // update the mismatched range.
  NSRange currentRange;
  NSRange predictionRange;
  if (findMismatch(textView.text, _predictedText, &currentRange, &predictionRange)) {
    NSString *replacement = [textView.text substringWithRange:currentRange];
    [self textView:textView shouldChangeTextInRange:predictionRange replacementText:replacement];
    // JS will assume the selection changed based on the location of our shouldChangeTextInRange, so reset it.
    [self textViewDidChangeSelection:textView];
    _predictedText = textView.text;
  }

  _nativeUpdatesInFlight = NO;
//  _nativeEventCount++;

  if (!self.hippyTag || !_onChangeText) {
    return;
  }

  // When the context size increases, iOS updates the contentSize twice; once
  // with a lower height, then again with the correct height. To prevent a
  // spurious event from being sent, we track the previous, and only send the
  // update event if it matches our expectation that greater text length
  // should result in increased height. This assumption is, of course, not
  // necessarily true because shorter text might include more linebreaks, but
  // in practice this works well enough.
  NSUInteger textLength = textView.text.length;
  CGFloat contentHeight = textView.contentSize.height;
  if (textLength >= _previousTextLength) {
    contentHeight = MAX(contentHeight, _previousContentHeight);
  }
  _previousTextLength = textLength;
  _previousContentHeight = contentHeight;
  _onChangeText(@{
    @"text": self.text,
    @"contentSize": @{
      @"height": @(contentHeight),
      @"width": @(textView.contentSize.width)
    },
    @"target": self.hippyTag,
    @"eventCount": @(_nativeEventCount),
  });
}

- (void)textViewDidEndEditing:(__unused UITextView *)textView
{
  if (_onEndEditing) {
    _onEndEditing(@{
        @"text": textView.text,
    });
  }
}

- (BOOL)isFirstResponder
{
  return [_textView isFirstResponder];
}

- (BOOL)canBecomeFirstResponder
{
  return [_textView canBecomeFirstResponder];
}

- (void)hippyWillMakeFirstResponder
{
  [_textView hippyWillMakeFirstResponder];
}

- (void)hippyDidMakeFirstResponder
{
  [_textView hippyDidMakeFirstResponder];
}

- (void)layoutSubviews
{
  [super layoutSubviews];

  // Start sending content size updates only after the view has been laid out
  // otherwise we send multiple events with bad dimensions on initial render.
  _viewDidCompleteInitialLayout = YES;

  [self updateFrames];
}

- (UIFont *)defaultPlaceholderFont
{
  return [UIFont systemFontOfSize:17];
}

- (UIColor *)defaultPlaceholderTextColor
{
  return [UIColor colorWithRed:0.0/255.0 green:0.0/255.0 blue:0.098/255.0 alpha:0.22];
}



/*
从hippy对齐过来的方法
 */

- (NSString *)value
{
  return _textView.text;
}


- (void)setValue:(NSString *)value
{
  [self setText:value];
}

- (void)setFontSize:(NSNumber *)fontSize{
  _fontSize = fontSize;

  if ([fontSize floatValue] > 0) {
    [self setFont:[UIFont systemFontOfSize:[fontSize floatValue]]];
  }
}


- (void)setDefaultValue:(NSString *)defaultValue{
  if (defaultValue) {
    [self setText:defaultValue];

    _defaultValue = defaultValue;
  }
}

- (void)focus{
  [self becomeFirstResponder];
}

- (void)blur{
  [self resignFirstResponder];
}

- (void)clearText
{
	[self setText:@""];
}

- (BOOL)becomeFirstResponder
{
  [self setTextViewKeyboardAppearance];
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
  _nativeEventCount = 0;
  [super resignFirstResponder];
  return [_textView resignFirstResponder];
}

- (void)setTextViewKeyboardAppearance{

  if (_textView) {
    _textView.keyboardAppearance = UIKeyboardAppearanceDefault;
  }
}


@end
