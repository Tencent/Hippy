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

#import <Foundation/Foundation.h>
#import "HippyFrameworkProxy.h"
#import "UIView+Render.h"
#import "dom/dom_manager.h"
#import "dom/root_node.h"

NS_ASSUME_NONNULL_BEGIN

@class HippyViewManager;
@class HippyShadowView;

@protocol HippyRenderContext;

typedef void (^HippyRenderUIBlock)(id<HippyRenderContext> renderContext, NSDictionary<NSNumber *, __kindof UIView *> *viewRegistry);

@protocol HippyRenderContext <NSObject>

@property(nonatomic, readonly) NSDictionary<NSNumber *, __kindof UIView *> *viewRegistry;

@property(nonatomic, readonly) std::weak_ptr<hippy::DomManager> domManager;

@property(nonatomic, weak) id<HippyFrameworkProxy> frameworkProxy;

- (void)registerRootView:(UIView *)rootView asRootNode:(std::weak_ptr<hippy::RootNode>)rootNode;

- (__kindof HippyViewManager *)renderViewManagerForViewName:(NSString *)viewName;

- (__kindof UIView *)viewFromRenderViewTag:(NSNumber *)hippyTag onRootTag:(NSNumber *)rootTag;

- (__kindof UIView *)createViewRecursivelyFromShadowView:(HippyShadowView *)shadowView;

- (void)purgeViewsFromHippyTags:(NSArray<NSNumber *> *)hippyTag onRootTag:(NSNumber *)rootTag;

- (void)addUIBlock:(HippyRenderUIBlock)block;

- (void)executeBlockOnRenderQueue:(dispatch_block_t)block;

- (void)updateView:(NSNumber *)hippyTag onRootTag:(NSNumber *)rootTag props:(NSDictionary *)pros;

- (void)setFrame:(CGRect)frame forRootView:(UIView *)view;

- (void)setNeedsLayoutForRootNodeTag:(NSNumber *)tag;

@end

NS_ASSUME_NONNULL_END
