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

#import "NativeRenderBaseTextInput.h"
#import "HippyFont.h"
#import "HippyUIManager.h"
#import "NativeRenderObjectTextView.h"
#import "HippyShadowView.h"
#import "NativeRenderTextField.h"
#import "NativeRenderTextView.h"
#import "NativeRenderTextViewManager.h"
#import "HippyBridgeModule.h"
#import "NativeRenderTextSelection.h"

@implementation NativeRenderTextViewManager

HIPPY_EXPORT_MODULE(TextInput)

- (UIView *)view {
    NSNumber *multiline = self.props[@"multiline"];
    NSString *keyboardType = self.props[@"keyboardType"];
    if ([keyboardType isKindOfClass:[NSString class]] && [keyboardType isEqual:@"password"]) {
        multiline = @(NO);
    }
    NativeRenderBaseTextInput *theView;
    if (multiline != nil && !multiline.boolValue) {
        theView = [[NativeRenderTextField alloc] init];
    } else {
        theView = [[NativeRenderTextView alloc] init];
    }
    if (self.props[@"onKeyboardWillShow"]) {
        [[NSNotificationCenter defaultCenter] addObserver:theView
                                                 selector:@selector(keyboardWillShow:)
                                                     name:UIKeyboardWillShowNotification
                                                   object:nil];
    }
    if (self.props[@"onKeyboardWillHide"]) {
        [[NSNotificationCenter defaultCenter] addObserver:theView
                                                 selector:@selector(keyboardWillHide:)
                                                     name:UIKeyboardWillHideNotification
                                                   object:nil];
    }
    return theView;
}

- (HippyShadowView *)hippyShadowView {
    return [NativeRenderObjectTextView new];
}

HIPPY_EXPORT_VIEW_PROPERTY(value, NSString)
HIPPY_EXPORT_VIEW_PROPERTY(onChangeText, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onKeyPress, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onBlur, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onFocus, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onKeyboardWillShow, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(defaultValue, NSString)
HIPPY_EXPORT_VIEW_PROPERTY(isNightMode, BOOL)

HIPPY_EXPORT_METHOD(focusTextInput:(nonnull NSNumber *)componentTag) {
    [self.bridge.uiManager addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry){
         NativeRenderBaseTextInput *view = (NativeRenderBaseTextInput *)viewRegistry[componentTag];
         if (view == nil) return ;
         if (![view isKindOfClass:[NativeRenderBaseTextInput class]]) {
             HippyLogError(@"Invalid view returned from registry, expecting NativeRenderBaseTextInput, got: %@", view);
         }
         [view focus];
     }];
}

HIPPY_EXPORT_METHOD(isFocused:(nonnull NSNumber *)componentTag callback:(HippyPromiseResolveBlock)callback) {
    [self.bridge.uiManager addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        NativeRenderBaseTextInput *view = (NativeRenderBaseTextInput *)viewRegistry[componentTag];
        if (view == nil) return ;
        if (![view isKindOfClass:[NativeRenderBaseTextInput class]]) {
            HippyLogError(@"Invalid view returned from registry, expecting NativeRenderBaseTextInput, got: %@", view);
        }
        BOOL isFocused = [view isFirstResponder];
        callback([NSDictionary dictionaryWithObject:[NSNumber numberWithBool:isFocused] forKey:@"value"]);
    }];
}

HIPPY_EXPORT_METHOD(blurTextInput:(nonnull NSNumber *)componentTag) {
    [self.bridge.uiManager addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry){
         NativeRenderBaseTextInput *view = (NativeRenderBaseTextInput *)viewRegistry[componentTag];
         if (view == nil) return ;
         if (![view isKindOfClass:[NativeRenderBaseTextInput class]]) {
             HippyLogError(@"Invalid view returned from registry, expecting NativeRenderBaseTextInput, got: %@", view);
         }
         [view blur];
     }];
}

HIPPY_EXPORT_METHOD(clear:(nonnull NSNumber *)componentTag) {
    [self.bridge.uiManager addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        NativeRenderBaseTextInput *view = (NativeRenderBaseTextInput *)viewRegistry[componentTag];
        if (view == nil) return ;
        if (![view isKindOfClass:[NativeRenderBaseTextInput class]]) {
            HippyLogError(@"Invalid view returned from registry, expecting NativeRenderBaseTextInput, got: %@", view);
        }
        [view clearText];
    }];
}

HIPPY_EXPORT_METHOD(setValue:(nonnull NSNumber *)componentTag
                  text:(NSString *)text ) {
    [self.bridge.uiManager addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        NativeRenderBaseTextInput *view = (NativeRenderBaseTextInput *)viewRegistry[componentTag];
        if (view == nil) return ;
        if (![view isKindOfClass:[NativeRenderBaseTextInput class]]) {
            HippyLogError(@"Invalid view returned from registry, expecting NativeRenderBaseTextInput, got: %@", view);
        }
        [view setValue: text];
    }];
}

HIPPY_EXPORT_METHOD(getValue:(nonnull NSNumber *)componentTag
                  callback:(HippyPromiseResolveBlock)callback ) {
    [self.bridge.uiManager addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        NativeRenderBaseTextInput *view = (NativeRenderBaseTextInput *)viewRegistry[componentTag];
        NSString *stringValue = [view value];
        if (nil == stringValue) {
            stringValue = @"";
        }
        callback([NSDictionary dictionaryWithObject:stringValue forKey:@"text"]);
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
HIPPY_EXPORT_VIEW_PROPERTY(selection, NativeRenderTextSelection)
HIPPY_EXPORT_VIEW_PROPERTY(text, NSString)

HIPPY_CUSTOM_SHADOW_PROPERTY(fontSize, NSNumber, NativeRenderObjectTextView) {
    view.font = [HippyFont updateFont:view.font withSize:json];
}

HIPPY_CUSTOM_SHADOW_PROPERTY(fontWeight, NSString, NativeRenderObjectTextView) {
    view.font = [HippyFont updateFont:view.font withWeight:json];
}

HIPPY_CUSTOM_SHADOW_PROPERTY(fontStyle, NSString, NativeRenderObjectTextView) {
    view.font = [HippyFont updateFont:view.font withStyle:json];  // defaults to normal
}

HIPPY_CUSTOM_SHADOW_PROPERTY(fontFamily, NSString, NativeRenderObjectTextView) {
    view.font = [HippyFont updateFont:view.font withFamily:json];
}

HIPPY_CUSTOM_VIEW_PROPERTY(fontSize, NSNumber, NativeRenderBaseTextInput) {
    UIFont *theFont = [HippyFont updateFont:view.font withSize:json ?: @(defaultView.font.pointSize)];
    view.font = theFont;
}
HIPPY_CUSTOM_VIEW_PROPERTY(fontWeight, NSString, __unused NativeRenderBaseTextInput) {
    UIFont *theFont = [HippyFont updateFont:view.font withWeight:json];  // defaults to normal
    view.font = theFont;
}
HIPPY_CUSTOM_VIEW_PROPERTY(fontStyle, NSString, __unused NativeRenderBaseTextInput) {
    UIFont *theFont = [HippyFont updateFont:view.font withStyle:json];
    view.font = theFont;  // defaults to normal
}
HIPPY_CUSTOM_VIEW_PROPERTY(fontFamily, NSString, NativeRenderBaseTextInput) {
    view.font = [HippyFont updateFont:view.font withFamily:json ?: defaultView.font.familyName];
}

- (HippyViewManagerUIBlock)uiBlockToAmendWithShadowView:(HippyShadowView *)hippyShadowView {
    NSNumber *componentTag = hippyShadowView.hippyTag;
    UIEdgeInsets padding = hippyShadowView.paddingAsInsets;
    return ^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, NativeRenderBaseTextInput *> *viewRegistry) {
        viewRegistry[componentTag].contentInset = padding;
    };
}
@end
