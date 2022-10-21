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

#import <Foundation/Foundation.h>

#import "HPRenderFrameworkProxy.h"
#import "UIView+Render.h"
#import "HPRenderContext.h"

NS_ASSUME_NONNULL_BEGIN

@class NativeRenderViewManager;
@class NativeRenderObjectView;

@protocol NativeRenderContext;

typedef void (^NativeRenderRenderUIBlock)(id<NativeRenderContext> renderContext, NSDictionary<NSNumber *, __kindof UIView *> *viewRegistry);

@protocol NativeRenderContext <HPRenderContext>

@property(nonatomic, readonly) NSDictionary<NSNumber *, __kindof UIView *> *viewRegistry;

- (__kindof NativeRenderViewManager *)renderViewManagerForViewName:(NSString *)viewName;

- (__kindof UIView *)createViewRecursivelyFromRenderObject:(NativeRenderObjectView *)renderObject;

- (void)addUIBlock:(NativeRenderRenderUIBlock)block;

@end

NS_ASSUME_NONNULL_END
