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

#import "UIView+Render.h"
#import "objc/runtime.h"
#import "HippyRenderContext.h"

@implementation UIView (Render)

- (void)setRenderContext:(id<HippyRenderContext>)renderContext {
    if (renderContext) {
        NSHashTable *weakContainer = [NSHashTable weakObjectsHashTable];
        [weakContainer addObject:renderContext];
        objc_setAssociatedObject(self, @selector(renderContext), weakContainer, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    }
}

- (id<HippyRenderContext>)renderContext {
    NSHashTable *hashTable = objc_getAssociatedObject(self, _cmd);
    return [hashTable anyObject];
}

- (void)registerAsRootView:(id<HippyRenderContext>) renderContext {
    [renderContext registerRootView:self];
}

@end
