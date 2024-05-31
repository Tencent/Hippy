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

#import <UIKit/UIKit.h>
#import "HippyConvert.h"
#import "HippyBridgeModule.h"

@class HippyBridge;
@class HippyShadowView;
@class HippyUIManager;


typedef void (^HippyViewManagerUIBlock)(HippyUIManager *uiManager,
                                        NSDictionary<NSNumber *, __kindof UIView *> *viewRegistry);


@interface HippyViewManager : NSObject <HippyBridgeModule>

/**
 * The bridge can be used to access both the HippyUIIManager and the HippyEventDispatcher,
 * allowing the manager (or the views that it manages) to manipulate the view
 * hierarchy and send events back to the JS context.
 */
@property (nonatomic, weak) HippyBridge *bridge;

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
 * an ordinary HippyShadowView instance will be created, which is typically fine for
 * most view types. As with the -view method, the -renderObject method should return
 * a fresh instance each time it is called.
 */
- (HippyShadowView *)shadowView;

/**
 * Called to notify manager that layout has finished, in case any calculated
 * properties need to be copied over from shadow view to view.
 */
- (HippyViewManagerUIBlock)uiBlockToAmendWithShadowView:(HippyShadowView *)shadowView;

/**
 * Called after view hierarchy manipulation has finished, and all shadow props
 * have been set, but before layout has been performed. Useful for performing
 * custom layout logic or tasks that involve walking the view hierarchy.
 * To be deprecated, hopefully.
 */
- (HippyViewManagerUIBlock)uiBlockToAmendWithShadowViewRegistry:(NSDictionary<NSNumber *, HippyShadowView *> *)shadowViewRegistry;

/**
 * This handles the simple case, where JS and native property names match.
 */
#define HIPPY_EXPORT_VIEW_PROPERTY(name, type)  \
    typedef type HIPPY_CONCAT(HippyTypeExistCheck, __COUNTER__);     \
    +(NSArray<NSString *> *)propConfig_##name { \
        return @[@ #type];                      \
    }

/**
 * This macro maps a named property to an arbitrary key path in the view.
 */
#define HIPPY_REMAP_VIEW_PROPERTY(name, keyPath, type) \
    typedef type HippyTypeExistCheck##type;            \
    +(NSArray<NSString *> *)propConfig_##name {        \
        return @[@ #type, @ #keyPath];                 \
    }

/**
 * This macro can be used when you need to provide custom logic for setting
 * view properties. The macro should be followed by a method body, which can
 * refer to "json", "view" and "defaultView" to implement the required logic.
 */
#define HIPPY_CUSTOM_VIEW_PROPERTY(name, type, viewClass) \
    HIPPY_REMAP_VIEW_PROPERTY(name, __custom__, type)     \
    -(void)set_##name : (id)json forView : (viewClass *)view withDefaultView : (viewClass *)defaultView

/**
 * This macro is used to map properties to the shadow view, instead of the view.
 */
#define HIPPY_EXPORT_SHADOW_PROPERTY(name, type)      \
    typedef type HippyTypeExistCheck##type;           \
    +(NSArray<NSString *> *)propConfigShadow_##name { \
        return @[@ #type];                            \
    }

/**
 * This macro maps a named property to an arbitrary key path in the shadow view.
 */
#define HIPPY_REMAP_SHADOW_PROPERTY(name, keyPath, type) \
    typedef type HippyTypeExistCheck##type;              \
    +(NSArray<NSString *> *)propConfigShadow_##name {    \
        return @[@ #type, @ #keyPath];                   \
    }

/**
 * This macro can be used when you need to provide custom logic for setting
 * shadow view properties. The macro should be followed by a method body, which can
 * refer to "json" and "view".
 */
#define HIPPY_CUSTOM_SHADOW_PROPERTY(name, type, viewClass) \
    HIPPY_REMAP_SHADOW_PROPERTY(name, __custom__, type) \
    -(void)set_##name : (id)json forShadowView : (viewClass *)view


@end

@interface HippyViewManager (InitProps)
@property (nonatomic, strong) NSDictionary *props;
@end

