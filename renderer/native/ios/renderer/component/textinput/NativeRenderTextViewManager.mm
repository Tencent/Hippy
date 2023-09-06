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

#import "NativeRenderBaseTextInput.h"
#import "NativeRenderFont.h"
#import "NativeRenderImpl.h"
#import "NativeRenderObjectTextView.h"
#import "NativeRenderObjectView.h"
#import "NativeRenderTextField.h"
#import "NativeRenderTextView.h"
#import "NativeRenderTextViewManager.h"

@implementation NativeRenderTextViewManager

NATIVE_RENDER_EXPORT_VIEW(TextInput)

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

NATIVE_RENDER_COMPONENT_EXPORT_METHOD(focusTextInput:(nonnull NSNumber *)componentTag) {
    [self.renderImpl addUIBlock:^(__unused NativeRenderImpl *renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry){
         NativeRenderBaseTextInput *view = (NativeRenderBaseTextInput *)viewRegistry[componentTag];
         if (view == nil) return ;
         if (![view isKindOfClass:[NativeRenderBaseTextInput class]]) {
             HPLogError(@"Invalid view returned from registry, expecting NativeRenderBaseTextInput, got: %@", view);
         }
         [view focus];
     }];
}

NATIVE_RENDER_COMPONENT_EXPORT_METHOD(isFocused:(nonnull NSNumber *)componentTag callback:(RenderUIResponseSenderBlock)callback) {
    [self.renderImpl addUIBlock:^(__unused NativeRenderImpl *renderContext, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        NativeRenderBaseTextInput *view = (NativeRenderBaseTextInput *)viewRegistry[componentTag];
        if (view == nil) return ;
        if (![view isKindOfClass:[NativeRenderBaseTextInput class]]) {
            HPLogError(@"Invalid view returned from registry, expecting NativeRenderBaseTextInput, got: %@", view);
        }
        BOOL isFocused = [view isFirstResponder];
        callback([NSDictionary dictionaryWithObject:[NSNumber numberWithBool:isFocused] forKey:@"value"]);
    }];
}

NATIVE_RENDER_COMPONENT_EXPORT_METHOD(blurTextInput:(nonnull NSNumber *)componentTag) {
    [self.renderImpl addUIBlock:^(__unused NativeRenderImpl *renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry){
         NativeRenderBaseTextInput *view = (NativeRenderBaseTextInput *)viewRegistry[componentTag];
         if (view == nil) return ;
         if (![view isKindOfClass:[NativeRenderBaseTextInput class]]) {
             HPLogError(@"Invalid view returned from registry, expecting NativeRenderBaseTextInput, got: %@", view);
         }
         [view blur];
     }];
}

NATIVE_RENDER_COMPONENT_EXPORT_METHOD(clear:(nonnull NSNumber *)componentTag) {
    [self.renderImpl addUIBlock:^(__unused NativeRenderImpl *renderContext, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        NativeRenderBaseTextInput *view = (NativeRenderBaseTextInput *)viewRegistry[componentTag];
        if (view == nil) return ;
        if (![view isKindOfClass:[NativeRenderBaseTextInput class]]) {
            HPLogError(@"Invalid view returned from registry, expecting NativeRenderBaseTextInput, got: %@", view);
        }
        [view clearText];
    }];
}

NATIVE_RENDER_COMPONENT_EXPORT_METHOD(setValue:(nonnull NSNumber *)componentTag
                  text:(NSString *)text ) {
    [self.renderImpl addUIBlock:^(__unused NativeRenderImpl *renderContext, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        NativeRenderBaseTextInput *view = (NativeRenderBaseTextInput *)viewRegistry[componentTag];
        if (view == nil) return ;
        if (![view isKindOfClass:[NativeRenderBaseTextInput class]]) {
            HPLogError(@"Invalid view returned from registry, expecting NativeRenderBaseTextInput, got: %@", view);
        }
        [view setValue: text];
    }];
}

NATIVE_RENDER_COMPONENT_EXPORT_METHOD(getValue:(nonnull NSNumber *)componentTag
                  callback:(RenderUIResponseSenderBlock)callback ) {
    [self.renderImpl addUIBlock:^(__unused NativeRenderImpl *renderContext, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        NativeRenderBaseTextInput *view = (NativeRenderBaseTextInput *)viewRegistry[componentTag];
        NSString *stringValue = [view value];
        if (nil == stringValue) {
            stringValue = @"";
        }
        callback([NSDictionary dictionaryWithObject:stringValue forKey:@"text"]);
    }];
}

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
    NSNumber *componentTag = nativeRenderObjectView.componentTag;
    UIEdgeInsets padding = nativeRenderObjectView.paddingAsInsets;
    return ^(__unused NativeRenderImpl *renderContext, NSDictionary<NSNumber *, NativeRenderBaseTextInput *> *viewRegistry) {
        viewRegistry[componentTag].contentInset = padding;
    };
}
@end
