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

@interface WaterfallItemChangeContext () {
    NSMutableSet<NativeRenderObjectView *> *_deletedItems;
    NSHashTable<NativeRenderObjectView *> *_addedItems;
    NSHashTable<NativeRenderObjectView *> *_movedItems;
    NSHashTable<NativeRenderObjectView *> *_frameChangedItems;
}
//append methods
- (void)appendDeletedItem:(NativeRenderObjectView *)objectView;
- (void)appendAddedItem:(NativeRenderObjectView *)objectView;
- (void)appendMovedItem:(NativeRenderObjectView *)objectView;
- (void)appendFrameChangedItem:(NativeRenderObjectView *)objectView;

@end

@implementation WaterfallItemChangeContext

- (instancetype)init {
    self = [super init];
    if (self) {
        _deletedItems = [NSMutableSet setWithCapacity:8];
        _addedItems = [NSHashTable weakObjectsHashTable];
        _movedItems = [NSHashTable weakObjectsHashTable];
        _frameChangedItems = [NSHashTable weakObjectsHashTable];
    }
    return self;
}

- (id)copyWithZone:(NSZone *)zone {
    WaterfallItemChangeContext *context = [[WaterfallItemChangeContext allocWithZone:zone] init];
    context->_deletedItems = [_deletedItems mutableCopy];
    context->_addedItems = [_addedItems copy];
    context->_movedItems = [_movedItems copy];
    context->_frameChangedItems = [_frameChangedItems copy];
    return context;
}

- (void)appendDeletedItem:(__kindof NativeRenderObjectView *)objectView {
    [_deletedItems addObject:objectView];
}

- (void)appendAddedItem:(__kindof NativeRenderObjectView *)objectView{
    [_addedItems addObject:objectView];
}

- (void)appendMovedItem:(__kindof NativeRenderObjectView *)objectView {
    [_movedItems addObject:objectView];
}

- (void)appendFrameChangedItem:(__kindof NativeRenderObjectView *)objectView {
    if (![_addedItems containsObject:objectView]) {
        [_frameChangedItems addObject:objectView];
    }
}

- (NSSet<__kindof NativeRenderObjectView *> *)deletedItems {
    return [_deletedItems copy];
}

- (NSMapTable<__kindof NativeRenderObjectView *, NSNumber *> *)addedItems {
    return [_addedItems copy];
}

- (NSMapTable<__kindof NativeRenderObjectView *, NSValue *> *)movedItems {
    return [_movedItems copy];
}

- (NSHashTable<__kindof NativeRenderObjectView *> *)frameChangedItems {
    return [_frameChangedItems copy];
}

- (void)clear {
    [_deletedItems removeAllObjects];
    [_addedItems removeAllObjects];
    [_movedItems removeAllObjects];
    [_frameChangedItems removeAllObjects];
}

- (NSString *)description {
    NSString *description = [NSString stringWithFormat:@"<%@: %p deleted items: %lu, added items: %lu, moved items: %lu, frame changed items: %lu>",
                             NSStringFromClass([self class]),
                             self,
                             [_deletedItems count],
                             [_addedItems count],
                             [_movedItems count],
                             [_frameChangedItems count]];
    return description;
}

@end

@interface NativeRenderObjectWaterfall () {
    WaterfallItemChangeContext *_itemChangeContext;
}

@end

@implementation NativeRenderObjectWaterfall

- (instancetype)init{
    self = [super init];
    if (self) {
        _itemChangeContext = [[WaterfallItemChangeContext alloc] init];
    }
    return self;
}

- (WaterfallItemChangeContext *)itemChangeContext {
    return _itemChangeContext;
}

- (void)insertNativeRenderSubview:(NativeRenderObjectView *)subview atIndex:(NSInteger)atIndex {
    [super insertNativeRenderSubview:subview atIndex:atIndex];
    if ([subview isKindOfClass:[NativeRenderObjectWaterfallItem class]]) {
        NativeRenderObjectWaterfallItem *objectItem = (NativeRenderObjectWaterfallItem *)subview;
        objectItem.observer = self;
    }
    [_itemChangeContext appendAddedItem:subview];
}

- (void)removeNativeRenderSubview:(NativeRenderObjectView *)subview {
    [super removeNativeRenderSubview:subview];
    if ([subview isKindOfClass:[NativeRenderObjectWaterfallItem class]]) {
        NativeRenderObjectWaterfallItem *objectItem = (NativeRenderObjectWaterfallItem *)subview;
        objectItem.observer = nil;
    }
    [_itemChangeContext appendDeletedItem:subview];
}

- (void)moveNativeRenderSubview:(id<NativeRenderComponentProtocol>)subview toIndex:(NSInteger)atIndex {
    [super moveNativeRenderSubview:subview toIndex:atIndex];
    [_itemChangeContext appendMovedItem:subview];
}

- (void)itemFrameChanged:(__kindof NativeRenderObjectWaterfallItem *)item {
    [_itemChangeContext appendFrameChangedItem:item];
}

- (void)amendLayoutBeforeMount:(NSMutableSet<NativeRenderApplierBlock> *)blocks {
    if ([self isPropagationDirty:NativeRenderUpdateLifecycleLayoutDirtied]) {
        __weak NativeRenderObjectWaterfall *weakSelf = self;
        WaterfallItemChangeContext *context = [_itemChangeContext copy];
        NSArray<NativeRenderObjectView *> *dataSource = [self.subcomponents copy];
        NativeRenderApplierBlock block = ^void(NSDictionary<NSNumber *, UIView *> *viewRegistry) {
            NativeRenderObjectWaterfall *strongSelf = weakSelf;
            if (!strongSelf) {
                return;
            }
            NativeRenderWaterfallView *view = (NativeRenderWaterfallView *)[viewRegistry objectForKey:[strongSelf componentTag]];
            HPAssert([view isKindOfClass:[NativeRenderWaterfallView class]], @"view must be kind of NativeRenderWaterfallView");
            if ([view isKindOfClass:[NativeRenderWaterfallView class]]) {
                view.dirtyContent = YES;
                view.changeContext = [context copy];
                [view pushDataSource:dataSource];
            }
        };
        [blocks addObject:block];
    }
    [super amendLayoutBeforeMount:blocks];
    [_itemChangeContext clear];
}

@end
