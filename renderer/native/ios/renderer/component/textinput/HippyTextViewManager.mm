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
#import "HippyUIManager.h"
#import "HippyShadowTextView.h"
#import "HippyShadowView.h"
#import "HippyTextField.h"
#import "HippyTextView.h"
#import "HippyTextViewManager.h"
#import "HippyBridgeModule.h"
#import "HippyTextSelection.h"

@implementation HippyTextViewManager

HIPPY_EXPORT_MODULE(TextInput)

- (UIView *)view {
    NSNumber *multiline = self.props[@"multiline"];
    NSString *keyboardType = self.props[@"keyboardType"];
    if ([keyboardType isKindOfClass:[NSString class]] && [keyboardType isEqual:@"password"]) {
        multiline = @(NO);
    }
    HippyBaseTextInput *theView;
    if (multiline != nil && !multiline.boolValue) {
        theView = [[HippyTextField alloc] init];
    } else {
        theView = [[HippyTextView alloc] init];
    }
    return theView;
}

- (HippyShadowView *)shadowView {
    return [HippyShadowTextView new];
}

HIPPY_EXPORT_VIEW_PROPERTY(value, NSString)
HIPPY_EXPORT_VIEW_PROPERTY(onChangeText, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onKeyPress, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onBlur, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onFocus, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onKeyboardWillShow, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onKeyboardWillHide, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onKeyboardHeightChanged, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(defaultValue, NSString)
HIPPY_EXPORT_VIEW_PROPERTY(isNightMode, BOOL)

HIPPY_EXPORT_METHOD(focusTextInput:(nonnull NSNumber *)componentTag) {
    [self.bridge.uiManager addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry){
         HippyBaseTextInput *view = (HippyBaseTextInput *)viewRegistry[componentTag];
         if (view == nil) return ;
         if (![view isKindOfClass:[HippyBaseTextInput class]]) {
             HippyLogError(@"Invalid view returned from registry, expecting HippyBaseTextInput, got: %@", view);
         }
         [view focus];
     }];
}

HIPPY_EXPORT_METHOD(isFocused:(nonnull NSNumber *)componentTag callback:(HippyPromiseResolveBlock)callback) {
    [self.bridge.uiManager addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        HippyBaseTextInput *view = (HippyBaseTextInput *)viewRegistry[componentTag];
        if (view == nil) return ;
        if (![view isKindOfClass:[HippyBaseTextInput class]]) {
            HippyLogError(@"Invalid view returned from registry, expecting HippyBaseTextInput, got: %@", view);
        }
        BOOL isFocused = [view isFirstResponder];
        callback([NSDictionary dictionaryWithObject:[NSNumber numberWithBool:isFocused] forKey:@"value"]);
    }];
}

HIPPY_EXPORT_METHOD(blurTextInput:(nonnull NSNumber *)componentTag) {
    [self.bridge.uiManager addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry){
         HippyBaseTextInput *view = (HippyBaseTextInput *)viewRegistry[componentTag];
         if (view == nil) return ;
         if (![view isKindOfClass:[HippyBaseTextInput class]]) {
             HippyLogError(@"Invalid view returned from registry, expecting HippyBaseTextInput, got: %@", view);
         }
         [view blur];
     }];
}

HIPPY_EXPORT_METHOD(clear:(nonnull NSNumber *)componentTag) {
    [self.bridge.uiManager addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        HippyBaseTextInput *view = (HippyBaseTextInput *)viewRegistry[componentTag];
        if (view == nil) return ;
        if (![view isKindOfClass:[HippyBaseTextInput class]]) {
            HippyLogError(@"Invalid view returned from registry, expecting HippyBaseTextInput, got: %@", view);
        }
        [view clearText];
    }];
}

HIPPY_EXPORT_METHOD(setValue:(nonnull NSNumber *)componentTag
                        text:(NSString *)text ) {
    [self.bridge.uiManager addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        HippyBaseTextInput *view = (HippyBaseTextInput *)viewRegistry[componentTag];
        if (view == nil) return ;
        if (![view isKindOfClass:[HippyBaseTextInput class]]) {
            HippyLogError(@"Invalid view returned from registry, expecting HippyBaseTextInput, got: %@", view);
        }
        [view setValue: text];
    }];
}

HIPPY_EXPORT_METHOD(getValue:(nonnull NSNumber *)componentTag
                    callback:(HippyPromiseResolveBlock)callback ) {
    [self.bridge.uiManager addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        HippyBaseTextInput *view = (HippyBaseTextInput *)viewRegistry[componentTag];
        NSString *stringValue = [view value];
        if (nil == stringValue) {
            stringValue = @"";
        }
        callback([NSDictionary dictionaryWithObject:stringValue forKey:@"text"]);
    }];
}

HIPPY_EXPORT_SHADOW_PROPERTY(text, NSString)
HIPPY_EXPORT_SHADOW_PROPERTY(placeholder, NSString)
HIPPY_EXPORT_SHADOW_PROPERTY(lineHeight, NSNumber)
HIPPY_EXPORT_SHADOW_PROPERTY(lineSpacing, NSNumber)
HIPPY_EXPORT_SHADOW_PROPERTY(lineHeightMultiple, NSNumber)

HIPPY_EXPORT_SHADOW_PROPERTY(fontSize, NSNumber)
HIPPY_EXPORT_SHADOW_PROPERTY(fontWeight, NSString)
HIPPY_EXPORT_SHADOW_PROPERTY(fontStyle, NSString)
HIPPY_EXPORT_SHADOW_PROPERTY(fontFamily, NSString)
HIPPY_EXPORT_SHADOW_PROPERTY(fontUrl, NSString)

HIPPY_EXPORT_VIEW_PROPERTY(lineHeight, NSNumber)
HIPPY_EXPORT_VIEW_PROPERTY(lineSpacing, NSNumber)
HIPPY_EXPORT_VIEW_PROPERTY(lineHeightMultiple, NSNumber)
HIPPY_REMAP_VIEW_PROPERTY(autoCapitalize, textView.autocapitalizationType, UITextAutocapitalizationType)
HIPPY_EXPORT_VIEW_PROPERTY(autoCorrect, BOOL)
HIPPY_EXPORT_VIEW_PROPERTY(blurOnSubmit, BOOL)
HIPPY_EXPORT_VIEW_PROPERTY(clearTextOnFocus, BOOL)
HIPPY_REMAP_VIEW_PROPERTY(color, textView.textColor, UIColor)
HIPPY_REMAP_VIEW_PROPERTY(textAlign, textView.textAlignment, NSTextAlignment)
HIPPY_REMAP_VIEW_PROPERTY(editable, textView.canEdit, BOOL)
HIPPY_REMAP_VIEW_PROPERTY(enablesReturnKeyAutomatically, textView.enablesReturnKeyAutomatically, BOOL)
HIPPY_REMAP_VIEW_PROPERTY(keyboardType, textView.keyboardType, UIKeyboardType)
HIPPY_REMAP_VIEW_PROPERTY(keyboardAppearance, textView.keyboardAppearance, UIKeyboardAppearance)
HIPPY_EXPORT_VIEW_PROPERTY(maxLength, NSNumber)
HIPPY_EXPORT_VIEW_PROPERTY(onContentSizeChange, HippyDirectEventBlock)
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
HIPPY_REMAP_VIEW_PROPERTY(caretColor, textView.caretColor, UIColor)

HIPPY_EXPORT_VIEW_PROPERTY(fontSize, NSNumber)
HIPPY_EXPORT_VIEW_PROPERTY(fontWeight, NSString)
HIPPY_EXPORT_VIEW_PROPERTY(fontStyle, NSString)
HIPPY_EXPORT_VIEW_PROPERTY(fontFamily, NSString)
HIPPY_EXPORT_VIEW_PROPERTY(fontUrl, NSString)

- (HippyViewManagerUIBlock)uiBlockToAmendWithShadowView:(HippyShadowView *)hippyShadowView {
    NSNumber *componentTag = hippyShadowView.hippyTag;
    UIEdgeInsets padding = hippyShadowView.paddingAsInsets;
    return ^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, HippyBaseTextInput *> *viewRegistry) {
        viewRegistry[componentTag].contentInset = padding;
    };
}

@end
