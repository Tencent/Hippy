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
#import <UIKit/UIKit.h>

#import "HPRenderFrameworkProxy.h"

#include <memory>

#include "dom/dom_manager.h"
#include "dom/root_node.h"

NS_ASSUME_NONNULL_BEGIN

class VFSUriLoader;

@class HPUriLoader;

@protocol HPRenderContext <NSObject, HPRenderFrameworkProxy>

@property(nonatomic, readonly) std::weak_ptr<hippy::DomManager> domManager;

- (void)registerRootView:(UIView *)rootView asRootNode:(std::weak_ptr<hippy::RootNode>)rootNode;

- (void)unregisterRootViewFromTag:(NSNumber *)rootTag;

- (NSArray<__kindof UIView *> *)rootViews;

- (__kindof UIView *)viewFromRenderViewTag:(NSNumber *)componentTag onRootTag:(NSNumber *)rootTag;

- (void)purgeViewsFromComponentTags:(NSArray<NSNumber *> *)componentTag onRootTag:(NSNumber *)rootTag;

- (void)updateView:(NSNumber *)componentTag onRootTag:(NSNumber *)rootTag props:(NSDictionary *)pros;

- (void)setFrame:(CGRect)frame forRootView:(UIView *)view;

- (void)setNeedsLayoutForRootNodeTag:(NSNumber *)tag;

@end

NS_ASSUME_NONNULL_END
