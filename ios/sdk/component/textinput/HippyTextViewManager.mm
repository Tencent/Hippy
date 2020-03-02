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

#import "HippyTextViewManager.h"

#import "HippyBridge.h"
#import "HippyConvert.h"
#import "HippyShadowView.h"
#import "HippyTextView.h"
#import "HippyTextField.h"
#import "HippyBaseTextInput.h"
#import "HippyShadowTextView.h"
#import "HippyFont.h"


@implementation HippyTextViewManager

HIPPY_EXPORT_MODULE(TextInput)

- (UIView *)view
{
    //todo: 最佳实践？
    NSNumber *mutiline = self.props[@"multiline"];
    HippyBaseTextInput *theView;
    if (mutiline != nil && !mutiline.boolValue) {
        HippyTextField *textField = [[HippyTextField alloc] init];
        if (self.props[@"onKeyboardWillShow"]) {
            [[NSNotificationCenter defaultCenter] addObserver:textField
                                                     selector:@selector(keyboardWillShow:)
                                                         name:UIKeyboardWillShowNotification
                                                       object:nil];
        }
        theView = textField;
    } else {
        HippyTextView *textView = [[HippyTextView alloc] init];
        if (self.props[@"onKeyboardWillShow"]) {
            [[NSNotificationCenter defaultCenter] addObserver:textView
                                                     selector:@selector(keyboardWillShow:)
                                                         name:UIKeyboardWillShowNotification
                                                       object:nil];
        }
        theView = textView;
    }

    return theView;
}


- (HippyShadowView *) shadowView {
    return [HippyShadowTextView new];
}


HIPPY_EXPORT_VIEW_PROPERTY(value, NSString)
HIPPY_EXPORT_VIEW_PROPERTY(onChangeText, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onKeyPress, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onBlur, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onFocus, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onKeyboardWillShow, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(defaultValue, NSString)
HIPPY_EXPORT_VIEW_PROPERTY(isNightMode, BOOL)


HIPPY_EXPORT_METHOD(focusTextInput:(nonnull NSNumber *)hippyTag)
{
    [self.bridge.uiManager addUIBlock:
     ^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry){
         HippyBaseTextInput *view = (HippyBaseTextInput *)viewRegistry[hippyTag];
         if (view == nil) return ;
         if (![view isKindOfClass:[HippyBaseTextInput class]]) {
             HippyLogError(@"Invalid view returned from registry, expecting HippyBaseTextInput, got: %@", view);
         }
         [view focus];
     }];
}

HIPPY_EXPORT_METHOD(blurTextInput:(nonnull NSNumber *)hippyTag)
{
    [self.bridge.uiManager addUIBlock:
     ^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry){
         HippyBaseTextInput *view = (HippyBaseTextInput *)viewRegistry[hippyTag];
         if (view == nil) return ;
         if (![view isKindOfClass:[HippyBaseTextInput class]]) {
             HippyLogError(@"Invalid view returned from registry, expecting HippyBaseTextInput, got: %@", view);
         }
         [view blur];
     }];
}


HIPPY_EXPORT_METHOD(clear:(nonnull NSNumber *)hippyTag) {
    [self.bridge.uiManager addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        HippyBaseTextInput *view = (HippyBaseTextInput *)viewRegistry[hippyTag];
        if (view == nil) return ;
        if (![view isKindOfClass:[HippyBaseTextInput class]]) {
            HippyLogError(@"Invalid view returned from registry, expecting HippyBaseTextInput, got: %@", view);
        }
        [view clearText];
    }];
}

HIPPY_EXPORT_METHOD(setValue:(nonnull NSNumber *)hippyTag
                  text:(NSString *)text ) {
    [self.bridge.uiManager addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        HippyBaseTextInput *view = (HippyBaseTextInput *)viewRegistry[hippyTag];
        if (view == nil) return ;
        if (![view isKindOfClass:[HippyBaseTextInput class]]) {
            HippyLogError(@"Invalid view returned from registry, expecting HippyBaseTextInput, got: %@", view);
        }
        [view setValue: text];
    }];
}

HIPPY_EXPORT_METHOD(getValue:(nonnull NSNumber *)hippyTag
                  callback:(HippyResponseSenderBlock)callback ) {
    [self.bridge.uiManager addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        HippyBaseTextInput *view = (HippyBaseTextInput *)viewRegistry[hippyTag];
        if (view == nil) return ;
        if (![view isKindOfClass:[HippyBaseTextInput class]]) {
            HippyLogError(@"Invalid view returned from registry, expecting HippyBaseTextInput, got: %@", view);
        }
        NSString *stringValue = [view value];
        if (nil == stringValue) {
            stringValue = @"";
        }
        NSArray *callBack = [NSArray arrayWithObject:[NSDictionary dictionaryWithObject:stringValue forKey:@"text"]];
        callback(callBack);
    }];
}

HIPPY_EXPORT_SHADOW_PROPERTY(text, NSString)
HIPPY_EXPORT_SHADOW_PROPERTY(placeholder, NSString)

HIPPY_REMAP_VIEW_PROPERTY(autoCapitalize, textView.autocapitalizationType, UITextAutocapitalizationType)
HIPPY_EXPORT_VIEW_PROPERTY(autoCorrect, BOOL)
HIPPY_EXPORT_VIEW_PROPERTY(blurOnSubmit, BOOL)
HIPPY_EXPORT_VIEW_PROPERTY(clearTextOnFocus, BOOL)
HIPPY_REMAP_VIEW_PROPERTY(color, textView.textColor, UIColor)
HIPPY_REMAP_VIEW_PROPERTY(textAlign, textView.textAlignment, NSTextAlignment)
HIPPY_REMAP_VIEW_PROPERTY(editable, textView.editable, BOOL)
HIPPY_REMAP_VIEW_PROPERTY(enablesReturnKeyAutomatically, textView.enablesReturnKeyAutomatically, BOOL)
HIPPY_REMAP_VIEW_PROPERTY(keyboardType, textView.keyboardType, UIKeyboardType)
HIPPY_REMAP_VIEW_PROPERTY(keyboardAppearance, textView.keyboardAppearance, UIKeyboardAppearance)
HIPPY_EXPORT_VIEW_PROPERTY(maxLength, NSNumber)
HIPPY_EXPORT_VIEW_PROPERTY(onChange, HippyBubblingEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onContentSizeChange, HippyBubblingEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onSelectionChange, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onTextInput, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onEndEditing, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(placeholder, NSString)
HIPPY_EXPORT_VIEW_PROPERTY(placeholderTextColor, UIColor)
HIPPY_REMAP_VIEW_PROPERTY(returnKeyType, textView.returnKeyType, UIReturnKeyType)
HIPPY_REMAP_VIEW_PROPERTY(secureTextEntry, textView.secureTextEntry, BOOL)
HIPPY_REMAP_VIEW_PROPERTY(selectionColor, tintColor, UIColor)
HIPPY_EXPORT_VIEW_PROPERTY(selectTextOnFocus, BOOL)
HIPPY_EXPORT_VIEW_PROPERTY(selection, HippyTextSelection)
HIPPY_EXPORT_VIEW_PROPERTY(text, NSString)


HIPPY_CUSTOM_SHADOW_PROPERTY(fontSize, NSNumber, HippyShadowTextView) {
    view.font = [HippyFont updateFont:view.font withSize:json];
}

HIPPY_CUSTOM_SHADOW_PROPERTY(fontWeight, NSString, HippyShadowTextView) {
    view.font = [HippyFont updateFont:view.font withWeight:json];
}

HIPPY_CUSTOM_SHADOW_PROPERTY(fontStyle, NSString, HippyShadowTextView)
{
    view.font = [HippyFont updateFont:view.font withStyle:json]; // defaults to normal
}

HIPPY_CUSTOM_SHADOW_PROPERTY(fontFamily, NSString, HippyShadowTextView)
{
    view.font = [HippyFont updateFont:view.font withFamily:json];
}



HIPPY_CUSTOM_VIEW_PROPERTY(fontSize, NSNumber, HippyBaseTextInput)
{
    UIFont *theFont = [HippyFont updateFont:view.font withSize:json ?: @(defaultView.font.pointSize)];
    view.font = theFont;
}
HIPPY_CUSTOM_VIEW_PROPERTY(fontWeight, NSString, __unused HippyBaseTextInput)
{
    UIFont *theFont = [HippyFont updateFont:view.font withWeight:json]; // defaults to normal
    view.font = theFont;
}
HIPPY_CUSTOM_VIEW_PROPERTY(fontStyle, NSString, __unused HippyBaseTextInput)
{
    UIFont *theFont = [HippyFont updateFont:view.font withStyle:json];
    view.font = theFont; // defaults to normal
}
HIPPY_CUSTOM_VIEW_PROPERTY(fontFamily, NSString, HippyBaseTextInput)
{
    view.font = [HippyFont updateFont:view.font withFamily:json ?: defaultView.font.familyName];
}

- (HippyViewManagerUIBlock)uiBlockToAmendWithShadowView:(HippyShadowView *)shadowView
{
    NSNumber *hippyTag = shadowView.hippyTag;
    UIEdgeInsets padding = shadowView.paddingAsInsets;
    return ^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, HippyBaseTextInput *> *viewRegistry) {
        viewRegistry[hippyTag].contentInset = padding;
    };
}
@end

