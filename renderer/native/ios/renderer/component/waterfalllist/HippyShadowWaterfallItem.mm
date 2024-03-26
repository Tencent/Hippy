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

#import "HippyShadowWaterfallItem.h"

@implementation HippyShadowWaterfallItem

- (instancetype)init {
    self = [super init];
    if (self) {
        self.creationType = HippyCreationTypeLazily;
    }
    return self;
}

- (void)setFrame:(CGRect)frame {
    CGRect originFrame = self.frame;
    [super setFrame:frame];
    if (!CGSizeEqualToSize(originFrame.size, frame.size) &&
        [self.observer respondsToSelector:@selector(itemFrameChanged:)]) {
        [self.observer itemFrameChanged:self];
    }
}

- (void)amendLayoutBeforeMount:(NSMutableSet<NativeRenderApplierBlock> *)blocks {
    if (HippyCreationTypeLazily == self.creationType) {
        // If item has not yet been created, then no need to collect blocks.
        return;
    }
    _layoutDirty = NO;
    if (NativeRenderUpdateLifecycleComputed == _propagationLifecycle) {
        return;
    }
    if (NativeRenderUpdateLifecycleLayoutDirtied == _propagationLifecycle) {
        _layoutDirty = YES;
    }
    _propagationLifecycle = NativeRenderUpdateLifecycleComputed;
    for (HippyShadowView *renderObjectView in self.subcomponents) {
        [renderObjectView amendLayoutBeforeMount:blocks];
    }
}

@end
