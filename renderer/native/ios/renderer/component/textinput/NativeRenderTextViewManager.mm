/*!
 * iOS SDK
 *
 * Tencent is pleased to support the open source community by making
 * NativeRender available.
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

#import "NativeRenderTextViewManager.h"
#import "NativeRenderObjectView.h"
#import "NativeRenderTextView.h"
#import "NativeRenderTextField.h"
#import "NativeRenderBaseTextInput.h"
#import "NativeRenderObjectTextView.h"
#import "NativeRenderFont.h"
#import "NativeRenderContext.h"

@implementation NativeRenderTextViewManager

- (UIView *)view {
    NSNumber *mutiline = self.props[@"multiline"];
    NSString *keyboardType = self.props[@"keyboardType"];
    if ([keyboardType isKindOfClass:[NSString class]] && [keyboardType isEqual:@"password"]) {
        mutiline = @(NO);
    }
    NativeRenderBaseTextInput *theView;
    if (mutiline != nil && !mutiline.boolValue) {
        NativeRenderTextField *textField = [[NativeRenderTextField alloc] init];
        if (self.props[@"onKeyboardWillShow"]) {
            [[NSNotificationCenter defaultCenter] addObserver:textField selector:@selector(keyboardWillShow:) name:UIKeyboardWillShowNotification
                                                       object:nil];
        }
        theView = textField;
    } else {
        NativeRenderTextView *textView = [[NativeRenderTextView alloc] init];
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
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onChangeText, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onKeyPress, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onBlur, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onFocus, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onKeyboardWillShow, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(defaultValue, NSString)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(isNightMode, BOOL)

// clang-format off
NATIVE_RENDER_COMPONENT_EXPORT_METHOD(focusTextInput:(nonnull NSNumber *)hippyTag) {
    [self.renderContext addUIBlock:^(__unused id<NativeRenderContext> renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry){
         NativeRenderBaseTextInput *view = (NativeRenderBaseTextInput *)viewRegistry[hippyTag];
         if (view == nil) return ;
         if (![view isKindOfClass:[NativeRenderBaseTextInput class]]) {
             //NativeRenderLogError(@"Invalid view returned from registry, expecting NativeRenderBaseTextInput, got: %@", view);
         }
         [view focus];
     }];
}
// clang-format on

// clang-format off
NATIVE_RENDER_COMPONENT_EXPORT_METHOD(blurTextInput:(nonnull NSNumber *)hippyTag) {
    [self.renderContext addUIBlock:^(__unused id<NativeRenderContext> renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry){
         NativeRenderBaseTextInput *view = (NativeRenderBaseTextInput *)viewRegistry[hippyTag];
         if (view == nil) return ;
         if (![view isKindOfClass:[NativeRenderBaseTextInput class]]) {
             //NativeRenderLogError(@"Invalid view returned from registry, expecting NativeRenderBaseTextInput, got: %@", view);
         }
         [view blur];
     }];
}
// clang-format on

// clang-format off
NATIVE_RENDER_COMPONENT_EXPORT_METHOD(clear:(nonnull NSNumber *)hippyTag) {
    [self.renderContext addUIBlock:^(__unused id<NativeRenderContext> renderContext, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        NativeRenderBaseTextInput *view = (NativeRenderBaseTextInput *)viewRegistry[hippyTag];
        if (view == nil) return ;
        if (![view isKindOfClass:[NativeRenderBaseTextInput class]]) {
            //NativeRenderLogError(@"Invalid view returned from registry, expecting NativeRenderBaseTextInput, got: %@", view);
        }
        [view clearText];
    }];
}
// clang-format on

// clang-format off
NATIVE_RENDER_COMPONENT_EXPORT_METHOD(setValue:(nonnull NSNumber *)hippyTag
                  text:(NSString *)text ) {
    [self.renderContext addUIBlock:^(__unused id<NativeRenderContext> renderContext, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        NativeRenderBaseTextInput *view = (NativeRenderBaseTextInput *)viewRegistry[hippyTag];
        if (view == nil) return ;
        if (![view isKindOfClass:[NativeRenderBaseTextInput class]]) {
            //NativeRenderLogError(@"Invalid view returned from registry, expecting NativeRenderBaseTextInput, got: %@", view);
        }
        [view setValue: text];
    }];
}
// clang-format on

// clang-format off
NATIVE_RENDER_COMPONENT_EXPORT_METHOD(getValue:(nonnull NSNumber *)hippyTag
                  callback:(RenderUIResponseSenderBlock)callback ) {
    [self.renderContext addUIBlock:^(__unused id<NativeRenderContext> renderContext, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        NativeRenderBaseTextInput *view = (NativeRenderBaseTextInput *)viewRegistry[hippyTag];
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
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onContentSizeChange, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onSelectionChange, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onTextInput, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onEndEditing, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(placeholder, NSString)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(placeholderTextColor, UIColor)
NATIVE_RENDER_REMAP_VIEW_PROPERTY(returnKeyType, textView.returnKeyType, UIReturnKeyType)
NATIVE_RENDER_REMAP_VIEW_PROPERTY(secureTextEntry, textView.secureTextEntry, BOOL)
NATIVE_RENDER_REMAP_VIEW_PROPERTY(selectionColor, tintColor, UIColor)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(selectTextOnFocus, BOOL)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(selection, NativeRenderTextSelection)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(text, NSString)

NATIVE_RENDER_CUSTOM_RENDER_OBJECT_PROPERTY(fontSize, NSNumber, NativeRenderObjectTextView) {
    view.font = [NativeRenderFont updateFont:view.font withSize:json];
}

NATIVE_RENDER_CUSTOM_RENDER_OBJECT_PROPERTY(fontWeight, NSString, NativeRenderObjectTextView) {
    view.font = [NativeRenderFont updateFont:view.font withWeight:json];
}

NATIVE_RENDER_CUSTOM_RENDER_OBJECT_PROPERTY(fontStyle, NSString, NativeRenderObjectTextView) {
    view.font = [NativeRenderFont updateFont:view.font withStyle:json];  // defaults to normal
}

NATIVE_RENDER_CUSTOM_RENDER_OBJECT_PROPERTY(fontFamily, NSString, NativeRenderObjectTextView) {
    view.font = [NativeRenderFont updateFont:view.font withFamily:json];
}

NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(fontSize, NSNumber, NativeRenderBaseTextInput) {
    UIFont *theFont = [NativeRenderFont updateFont:view.font withSize:json ?: @(defaultView.font.pointSize)];
    view.font = theFont;
}
NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(fontWeight, NSString, __unused NativeRenderBaseTextInput) {
    UIFont *theFont = [NativeRenderFont updateFont:view.font withWeight:json];  // defaults to normal
    view.font = theFont;
}
NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(fontStyle, NSString, __unused NativeRenderBaseTextInput) {
    UIFont *theFont = [NativeRenderFont updateFont:view.font withStyle:json];
    view.font = theFont;  // defaults to normal
}
NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(fontFamily, NSString, NativeRenderBaseTextInput) {
    view.font = [NativeRenderFont updateFont:view.font withFamily:json ?: defaultView.font.familyName];
}

- (NativeRenderRenderUIBlock)uiBlockToAmendWithNativeRenderObjectView:(NativeRenderObjectView *)nativeRenderObjectView {
    NSNumber *hippyTag = nativeRenderObjectView.hippyTag;
    UIEdgeInsets padding = nativeRenderObjectView.paddingAsInsets;
    return ^(__unused id<NativeRenderContext> renderContext, NSDictionary<NSNumber *, NativeRenderBaseTextInput *> *viewRegistry) {
        viewRegistry[hippyTag].contentInset = padding;
    };
}
@end
