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

#import "NativeRenderObjectWaterfall.h"
#import "NativeRenderWaterfallView.h"
#import "HPAsserts.h"

@implementation NativeRenderObjectWaterfall

- (void)amendLayoutBeforeMount:(NSMutableSet<NativeRenderApplierBlock> *)blocks {
    if ([self isPropagationDirty]) {
        __weak NativeRenderObjectWaterfall *weakSelf = self;
        NativeRenderApplierBlock block = ^void(NSDictionary<NSNumber *, UIView *> *viewRegistry) {
            NativeRenderObjectWaterfall *strongSelf = weakSelf;
            if (!strongSelf) {
                return;
            }
            NativeRenderWaterfallView *view = (NativeRenderWaterfallView *)[viewRegistry objectForKey:[strongSelf componentTag]];
            HPAssert([view isKindOfClass:[NativeRenderWaterfallView class]], @"view must be kind of NativeRenderWaterfallView");
            if ([view isKindOfClass:[NativeRenderWaterfallView class]]) {
                [view reloadData];
            }
        };
        [blocks addObject:block];
    }
    [super amendLayoutBeforeMount:blocks];
}

@end
