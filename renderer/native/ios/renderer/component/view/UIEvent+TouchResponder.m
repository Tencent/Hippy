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

#import "UIEvent+TouchResponder.h"
#import "objc/runtime.h"

@implementation UIEvent (TouchResponder)

- (NSMapTable<NSNumber *, id> *)respondersMap {
    NSMapTable<NSNumber *, id> *map = objc_getAssociatedObject(self, _cmd);
    if (!map) {
        map = [NSMapTable strongToWeakObjectsMapTable];
        objc_setAssociatedObject(self, _cmd, map, OBJC_ASSOCIATION_RETAIN);
    }
    return map;
}

- (void)setResponder:(__weak id)responder forType:(NativeRenderViewEventType)type {
    [[self respondersMap] setObject:responder forKey:@(type)];
}

- (id)responderForType:(NativeRenderViewEventType)type {
    return [[self respondersMap] objectForKey:@(type)];
}

- (void)removeAllResponders {
    [[self respondersMap] removeAllObjects];
}

@end
