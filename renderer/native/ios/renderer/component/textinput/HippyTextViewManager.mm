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
#import "NativeRenderObjectView.h"
#import "HippyTextView.h"
#import "HippyTextField.h"
#import "HippyBaseTextInput.h"
#import "NativeRenderObjectTextView.h"
#import "HippyFont.h"
#import "HippyRenderContext.h"

@implementation HippyTextViewManager

- (UIView *)view {
    NSNumber *mutiline = self.props[@"multiline"];
    NSString *keyboardType = self.props[@"keyboardType"];
    if ([keyboardType isKindOfClass:[NSString class]] && [keyboardType isEqual:@"password"]) {
        mutiline = @(NO);
    }
    HippyBaseTextInput *theView;
    if (mutiline != nil && !mutiline.boolValue) {
        HippyTextField *textField = [[HippyTextField alloc] init];
        if (self.props[@"onKeyboardWillShow"]) {
            [[NSNotificationCenter defaultCenter] addObserver:textField selector:@selector(keyboardWillShow:) name:UIKeyboardWillShowNotification
                                                       object:nil];
        }
        theView = textField;
    } else {
        HippyTextView *textView = [[HippyTextView alloc] init];
        if (self.props[@"onKeyboardWillShow"]) {
            [[NSNotificationCenter defaultCenter] addObserver:textView selector:@selector(keyboardWillShow:) name:UIKeyboardWillShowNotification
                                                       object:nil];
        }
        theView = textView;
    }

    return theView;
}

- (NativeRenderObjectView *)nativeRenderObjectView {
    return [NativeRenderObjectTextView new];
}

NATIVE_RENDER_EXPORT_VIEW_PROPERTY(value, NSString)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onChangeText, HippyDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onKeyPress, HippyDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onBlur, HippyDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onFocus, HippyDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onKeyboardWillShow, HippyDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(defaultValue, NSString)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(isNightMode, BOOL)

// clang-format off
NATIVE_RENDER_COMPONENT_EXPORT_METHOD(focusTextInput:(nonnull NSNumber *)hippyTag) {
    [self.renderContext addUIBlock:^(__unused id<HippyRenderContext> renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry){
         HippyBaseTextInput *view = (HippyBaseTextInput *)viewRegistry[hippyTag];
         if (view == nil) return ;
         if (![view isKindOfClass:[HippyBaseTextInput class]]) {
             //HippyLogError(@"Invalid view returned from registry, expecting HippyBaseTextInput, got: %@", view);
         }
         [view focus];
     }];
}
// clang-format on

// clang-format off
NATIVE_RENDER_COMPONENT_EXPORT_METHOD(blurTextInput:(nonnull NSNumber *)hippyTag) {
    [self.renderContext addUIBlock:^(__unused id<HippyRenderContext> renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry){
         HippyBaseTextInput *view = (HippyBaseTextInput *)viewRegistry[hippyTag];
         if (view == nil) return ;
         if (![view isKindOfClass:[HippyBaseTextInput class]]) {
             //HippyLogError(@"Invalid view returned from registry, expecting HippyBaseTextInput, got: %@", view);
         }
         [view blur];
     }];
}
// clang-format on

// clang-format off
NATIVE_RENDER_COMPONENT_EXPORT_METHOD(clear:(nonnull NSNumber *)hippyTag) {
    [self.renderContext addUIBlock:^(__unused id<HippyRenderContext> renderContext, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        HippyBaseTextInput *view = (HippyBaseTextInput *)viewRegistry[hippyTag];
        if (view == nil) return ;
        if (![view isKindOfClass:[HippyBaseTextInput class]]) {
            //HippyLogError(@"Invalid view returned from registry, expecting HippyBaseTextInput, got: %@", view);
        }
        [view clearText];
    }];
}
// clang-format on

// clang-format off
NATIVE_RENDER_COMPONENT_EXPORT_METHOD(setValue:(nonnull NSNumber *)hippyTag
                  text:(NSString *)text ) {
    [self.renderContext addUIBlock:^(__unused id<HippyRenderContext> renderContext, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        HippyBaseTextInput *view = (HippyBaseTextInput *)viewRegistry[hippyTag];
        if (view == nil) return ;
        if (![view isKindOfClass:[HippyBaseTextInput class]]) {
            //HippyLogError(@"Invalid view returned from registry, expecting HippyBaseTextInput, got: %@", view);
        }
        [view setValue: text];
    }];
}
// clang-format on

// clang-format off
NATIVE_RENDER_COMPONENT_EXPORT_METHOD(getValue:(nonnull NSNumber *)hippyTag
                  callback:(RenderUIResponseSenderBlock)callback ) {
    [self.renderContext addUIBlock:^(__unused id<HippyRenderContext> renderContext, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        HippyBaseTextInput *view = (HippyBaseTextInput *)viewRegistry[hippyTag];
        NSString *stringValue = [view value];
        if (nil == stringValue) {
            stringValue = @"";
        }
        callback([NSDictionary dictionaryWithObject:stringValue forKey:@"text"]);
    }];
}
// clang-format on

NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(text, NSString)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(placeholder, NSString)

NATIVE_RENDER_REMAP_VIEW_PROPERTY(autoCapitalize, textView.autocapitalizationType, UITextAutocapitalizationType)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(autoCorrect, BOOL)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(blurOnSubmit, BOOL)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(clearTextOnFocus, BOOL)
NATIVE_RENDER_REMAP_VIEW_PROPERTY(color, textView.textColor, UIColor)
NATIVE_RENDER_REMAP_VIEW_PROPERTY(textAlign, textView.textAlignment, NSTextAlignment)
NATIVE_RENDER_REMAP_VIEW_PROPERTY(editable, textView.editable, BOOL)
NATIVE_RENDER_REMAP_VIEW_PROPERTY(enablesReturnKeyAutomatically, textView.enablesReturnKeyAutomatically, BOOL)
NATIVE_RENDER_REMAP_VIEW_PROPERTY(keyboardType, textView.keyboardType, UIKeyboardType)
NATIVE_RENDER_REMAP_VIEW_PROPERTY(keyboardAppearance, textView.keyboardAppearance, UIKeyboardAppearance)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(maxLength, NSNumber)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onContentSizeChange, HippyDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onSelectionChange, HippyDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onTextInput, HippyDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onEndEditing, HippyDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(placeholder, NSString)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(placeholderTextColor, UIColor)
NATIVE_RENDER_REMAP_VIEW_PROPERTY(returnKeyType, textView.returnKeyType, UIReturnKeyType)
NATIVE_RENDER_REMAP_VIEW_PROPERTY(secureTextEntry, textView.secureTextEntry, BOOL)
NATIVE_RENDER_REMAP_VIEW_PROPERTY(selectionColor, tintColor, UIColor)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(selectTextOnFocus, BOOL)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(selection, HippyTextSelection)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(text, NSString)

NATIVE_RENDER_CUSTOM_RENDER_OBJECT_PROPERTY(fontSize, NSNumber, NativeRenderObjectTextView) {
    view.font = [HippyFont updateFont:view.font withSize:json];
}

NATIVE_RENDER_CUSTOM_RENDER_OBJECT_PROPERTY(fontWeight, NSString, NativeRenderObjectTextView) {
    view.font = [HippyFont updateFont:view.font withWeight:json];
}

NATIVE_RENDER_CUSTOM_RENDER_OBJECT_PROPERTY(fontStyle, NSString, NativeRenderObjectTextView) {
    view.font = [HippyFont updateFont:view.font withStyle:json];  // defaults to normal
}

NATIVE_RENDER_CUSTOM_RENDER_OBJECT_PROPERTY(fontFamily, NSString, NativeRenderObjectTextView) {
    view.font = [HippyFont updateFont:view.font withFamily:json];
}

NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(fontSize, NSNumber, HippyBaseTextInput) {
    UIFont *theFont = [HippyFont updateFont:view.font withSize:json ?: @(defaultView.font.pointSize)];
    view.font = theFont;
}
NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(fontWeight, NSString, __unused HippyBaseTextInput) {
    UIFont *theFont = [HippyFont updateFont:view.font withWeight:json];  // defaults to normal
    view.font = theFont;
}
NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(fontStyle, NSString, __unused HippyBaseTextInput) {
    UIFont *theFont = [HippyFont updateFont:view.font withStyle:json];
    view.font = theFont;  // defaults to normal
}
NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(fontFamily, NSString, HippyBaseTextInput) {
    view.font = [HippyFont updateFont:view.font withFamily:json ?: defaultView.font.familyName];
}

- (HippyRenderUIBlock)uiBlockToAmendWithNativeRenderObjectView:(NativeRenderObjectView *)nativeRenderObjectView {
    NSNumber *hippyTag = nativeRenderObjectView.hippyTag;
    UIEdgeInsets padding = nativeRenderObjectView.paddingAsInsets;
    return ^(__unused id<HippyRenderContext> renderContext, NSDictionary<NSNumber *, HippyBaseTextInput *> *viewRegistry) {
        viewRegistry[hippyTag].contentInset = padding;
    };
}
@end
