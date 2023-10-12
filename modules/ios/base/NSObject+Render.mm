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

#import "NSObject+Render.h"
#import "objc/runtime.h"

#include "dom/render_manager.h"

@interface RenderManagerWrapper : NSObject

@property(nonatomic, assign) std::weak_ptr<hippy::RenderManager> renderManager;

@end

@implementation RenderManagerWrapper

@end

@implementation UIView (HippyRenderManager)

- (void)setRenderManager:(std::weak_ptr<hippy::RenderManager>)renderManager {
    RenderManagerWrapper *wrapper = [[RenderManagerWrapper alloc] init];
    wrapper.renderManager = renderManager;
    objc_setAssociatedObject(self, @selector(renderManager), wrapper, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (std::weak_ptr<hippy::RenderManager>)renderManager {
    RenderManagerWrapper *wrapper = objc_getAssociatedObject(self, _cmd);
    return wrapper.renderManager;
}

@end
