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

#import "NativeRenderObjectView.h"
#import "NativeRenderObjectWaterfallItem.h"

NS_ASSUME_NONNULL_BEGIN

@interface WaterfallItemChangeContext : NSObject<NSCopying>

- (NSHashTable<__kindof NativeRenderObjectView *> *)addedItems;
- (NSHashTable<__kindof NativeRenderObjectView *> *)frameChangedItems;
- (NSSet<__kindof NativeRenderObjectView *> *)deletedItems;
- (NSHashTable<__kindof NativeRenderObjectView *> *)movedItems;

- (void)clear;

@end

@interface NativeRenderObjectWaterfall : NativeRenderObjectView<NativeRenderObjectWaterfallItemFrameChangedProtocol>

@property(nonatomic, readonly, strong)WaterfallItemChangeContext *itemChangeContext;

@end

NS_ASSUME_NONNULL_END
