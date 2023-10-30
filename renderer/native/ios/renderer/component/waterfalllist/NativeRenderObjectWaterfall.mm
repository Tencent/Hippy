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

#import "NativeRenderObjectWaterfall.h"
#import "NativeRenderWaterfallView.h"
#import "HippyAssert.h"

@interface WaterfallItemChangeContext () {
    NSMutableSet<HippyShadowView *> *_deletedItems;
    NSHashTable<HippyShadowView *> *_addedItems;
    NSHashTable<HippyShadowView *> *_movedItems;
    NSHashTable<HippyShadowView *> *_frameChangedItems;
}
//append methods
- (void)appendDeletedItem:(HippyShadowView *)objectView;
- (void)appendAddedItem:(HippyShadowView *)objectView;
- (void)appendMovedItem:(HippyShadowView *)objectView;
- (void)appendFrameChangedItem:(HippyShadowView *)objectView;

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

- (void)appendDeletedItem:(__kindof HippyShadowView *)objectView {
    [_deletedItems addObject:objectView];
}

- (void)appendAddedItem:(__kindof HippyShadowView *)objectView{
    [_addedItems addObject:objectView];
}

- (void)appendMovedItem:(__kindof HippyShadowView *)objectView {
    [_movedItems addObject:objectView];
}

- (void)appendFrameChangedItem:(__kindof HippyShadowView *)objectView {
    // _frameChangedItems may be also in other addedItems/movedItems
    [_frameChangedItems addObject:objectView];
}

- (NSSet<__kindof HippyShadowView *> *)deletedItems {
    return [_deletedItems copy];
}

- (NSMapTable<__kindof HippyShadowView *, NSNumber *> *)addedItems {
    return [_addedItems copy];
}

- (NSMapTable<__kindof HippyShadowView *, NSValue *> *)movedItems {
    return [_movedItems copy];
}

- (NSHashTable<__kindof HippyShadowView *> *)frameChangedItems {
    return [_frameChangedItems copy];
}

- (BOOL)hasChanges {
    return _addedItems.count != 0 || _deletedItems.count != 0 ||
    _movedItems.count != 0 || _frameChangedItems.count != 0;
}

- (NSSet<HippyShadowView *> *)allChangedItems {
    NSMutableSet *allChanges = [NSMutableSet set];
    [allChanges addObjectsFromArray:_addedItems.allObjects];
    [allChanges addObjectsFromArray:_deletedItems.allObjects];
    [allChanges addObjectsFromArray:_movedItems.allObjects];
    [allChanges addObjectsFromArray:_frameChangedItems.allObjects];
    return allChanges;
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

- (void)insertHippySubview:(HippyShadowView *)subview atIndex:(NSInteger)atIndex {
    [super insertHippySubview:subview atIndex:atIndex];
    if ([subview isKindOfClass:[NativeRenderObjectWaterfallItem class]]) {
        NativeRenderObjectWaterfallItem *objectItem = (NativeRenderObjectWaterfallItem *)subview;
        objectItem.observer = self;
    }
    [_itemChangeContext appendAddedItem:subview];
}

- (void)removeHippySubview:(HippyShadowView *)subview {
    [super removeHippySubview:subview];
    if ([subview isKindOfClass:[NativeRenderObjectWaterfallItem class]]) {
        NativeRenderObjectWaterfallItem *objectItem = (NativeRenderObjectWaterfallItem *)subview;
        objectItem.observer = nil;
    }
    [_itemChangeContext appendDeletedItem:subview];
}

- (void)moveHippySubview:(id<HippyComponent>)subview toIndex:(NSInteger)atIndex {
    [super moveHippySubview:subview toIndex:atIndex];
    [_itemChangeContext appendMovedItem:subview];
}

- (void)itemFrameChanged:(__kindof NativeRenderObjectWaterfallItem *)item {
    [_itemChangeContext appendFrameChangedItem:item];
}

- (void)amendLayoutBeforeMount:(NSMutableSet<NativeRenderApplierBlock> *)blocks {
    if ([self isPropagationDirty:NativeRenderUpdateLifecycleLayoutDirtied] &&
        _itemChangeContext.hasChanges) {
        WaterfallItemChangeContext *context = [_itemChangeContext copy];
        NSArray<HippyShadowView *> *dataSource = [self.subcomponents copy];
        __weak __typeof(self)weakSelf = self;
        NativeRenderApplierBlock block = ^void(NSDictionary<NSNumber *, UIView *> *viewRegistry) {
            __strong __typeof(weakSelf)strongSelf = weakSelf;
            if (!strongSelf) {
                return;
            }
            NativeRenderWaterfallView *view = (NativeRenderWaterfallView *)[viewRegistry objectForKey:[strongSelf hippyTag]];
            HippyAssert([view isKindOfClass:[NativeRenderWaterfallView class]], @"view must be kind of NativeRenderWaterfallView");
            if ([view isKindOfClass:[NativeRenderWaterfallView class]]) {
                view.dirtyContent = YES;
                view.changeContext = context;
                [view pushDataSource:dataSource];
            }
        };
        [blocks addObject:block];
        [_itemChangeContext clear];
    }
    [super amendLayoutBeforeMount:blocks];
}

@end
