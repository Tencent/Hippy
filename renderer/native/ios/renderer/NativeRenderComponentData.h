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
#import "NativeRenderComponentProtocol.h"
#import "NativeRenderViewManager.h"

@class NativeRenderObjectView;
@class UIView;

@interface NativeRenderComponentData : NSObject

@property (nonatomic, readonly) Class managerClass;
@property (nonatomic, copy, readonly) NSString *name;
@property (nonatomic, weak, readonly) NativeRenderViewManager *manager;

- (instancetype)initWithViewManager:(NativeRenderViewManager *)viewManager viewName:(NSString *)viewName NS_DESIGNATED_INITIALIZER;

- (UIView *)createViewWithTag:(NSNumber *)tag;

- (UIView *)createViewWithTag:(NSNumber *)tag initProps:(NSDictionary *)props;

- (NativeRenderObjectView *)createRenderObjectViewWithTag:(NSNumber *)tag;
- (void)setProps:(NSDictionary<NSString *, id> *)props forView:(id<NativeRenderComponentProtocol>)view;
- (void)setProps:(NSDictionary<NSString *, id> *)props forRenderObjectView:(NativeRenderObjectView *)renderObject;

- (NSDictionary<NSString *, NSString *> *)eventNameMap;

- (NSDictionary<NSString *, NSValue *> *)methodsByName;

- (NativeRenderRenderUIBlock)uiBlockToAmendWithRenderObjectViewRegistry:(NSDictionary<NSNumber *, NativeRenderObjectView *> *)registry;

@end
