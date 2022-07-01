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

#import <UIKit/UIKit.h>
#import "NativeRenderConvert.h"
#import "NativeRenderContext.h"

@class NativeRenderObjectView;

@interface NativeRenderViewManager : NSObject

@property(nonatomic, weak)id<NativeRenderContext> renderContext;

/**
 * This method instantiates a native view to be managed by the module. Override
 * this to return a custom view instance, which may be preconfigured with default
 * properties, subviews, etc. This method will be called many times, and should
 * return a fresh instance each time. The view module MUST NOT cache the returned
 * view and return the same instance for subsequent calls.
 */
- (UIView *)view;

/**
 * This method instantiates a shadow view to be managed by the module. If omitted,
 * an ordinary NativeRenderObjectView instance will be created, which is typically fine for
 * most view types. As with the -view method, the -renderObject method should return
 * a fresh instance each time it is called.
 */
- (NativeRenderObjectView *)nativeRenderObjectView;

/**
 * Called to notify manager that layout has finished, in case any calculated
 * properties need to be copied over from shadow view to view.
 */
- (NativeRenderRenderUIBlock)uiBlockToAmendWithNativeRenderObjectView:(NativeRenderObjectView *)renderObject;

/**
 * Called after view hierarchy manipulation has finished, and all shadow props
 * have been set, but before layout has been performed. Useful for performing
 * custom layout logic or tasks that involve walking the view hierarchy.
 * To be deprecated, hopefully.
 */
- (NativeRenderRenderUIBlock)uiBlockToAmendWithRenderObjectRegistry:(NSDictionary<NSNumber *, NativeRenderObjectView *> *)renderObjectRegistry;

/**
 * This handles the simple case, where JS and native property names match.
 */
#define NATIVE_RENDER_EXPORT_VIEW_PROPERTY(name, type)  \
    +(NSArray<NSString *> *)propConfig_##name {         \
        return @[@ #type];                              \
    }

/**
 * This macro maps a named property to an arbitrary key path in the view.
 */
#define NATIVE_RENDER_REMAP_VIEW_PROPERTY(name, keyPath, type)  \
    +(NSArray<NSString *> *)propConfig_##name {                 \
        return @[@ #type, @ #keyPath];                          \
    }

/**
 * This macro can be used when you need to provide custom logic for setting
 * view properties. The macro should be followed by a method body, which can
 * refer to "json", "view" and "defaultView" to implement the required logic.
 */
#define NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(name, type, viewClass) \
    NATIVE_RENDER_REMAP_VIEW_PROPERTY(name, __custom__, type)     \
    -(void)set_##name : (id)json forView : (viewClass *)view withDefaultView : (viewClass *)defaultView

/**
 * This macro is used to map properties to the shadow view, instead of the view.
 */
#define NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(name, type) \
    +(NSArray<NSString *> *)propConfigRenderObject_##name {     \
        return @[@ #type];                                      \
    }

/**
 * This macro maps a named property to an arbitrary key path in the shadow view.
 */
#define NATIVE_RENDER_REMAP_RENDER_OBJECT_PROPERTY(name, keyPath, type) \
    +(NSArray<NSString *> *)propConfigRenderObject_##name {             \
        return @[@ #type, @ #keyPath];                                  \
    }

/**
 * This macro can be used when you need to provide custom logic for setting
 * shadow view properties. The macro should be followed by a method body, which can
 * refer to "json" and "view".
 */
#define NATIVE_RENDER_CUSTOM_RENDER_OBJECT_PROPERTY(name, type, viewClass) \
    NATIVE_RENDER_REMAP_RENDER_OBJECT_PROPERTY(name, __custom__, type)     \
    -(void)set_##name : (id)json forRenderObject : (viewClass *)view

#define NATIVE_RENDER_COMPONENT_EXPORT_METHOD(method_name) NATIVE_RENDER_COMPONENT_REMAP_METHOD(, method_name)

#define NATIVE_RENDER_COMPONENT_REMAP_METHOD(js_name, method_name)                      \
    +(NSArray<NSString *> *)NATIVE_RENDER_CONCAT(__render_export__,                     \
        NATIVE_RENDER_CONCAT(js_name, NATIVE_RENDER_CONCAT(__LINE__, __COUNTER__))) {   \
        return @[@#js_name, @#method_name];                                             \
    }                                                                                   \
    -(void)method_name

typedef void (^RenderUIResponseSenderBlock)(id response);

@end

@interface NativeRenderViewManager (InitProps)
@property (nonatomic, strong) NSDictionary *props;
@end
