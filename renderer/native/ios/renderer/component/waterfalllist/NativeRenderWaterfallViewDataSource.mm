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

#import <UIKit/NSIndexPath+UIKitAdditions.h>

#import "HPAsserts.h"
#import "NativeRenderWaterfallViewDataSource.h"
#import "NativeRenderObjectView.h"
#import "NativeRenderObjectWaterfall.h"

@interface NativeRenderWaterfallViewDataSource () {
    BOOL _containBannerView;
    NSArray<NSArray<NativeRenderObjectView *> *> *_cellRenderObjectViews;
    NativeRenderObjectView *_bannerView;
}

@end

@implementation NativeRenderWaterfallViewDataSource

- (instancetype)initWithDataSource:(NSArray<__kindof NativeRenderObjectView *> *)dataSource
                      itemViewName:(NSString *)itemViewName
                 containBannerView:(BOOL)containBannerView {
    self = [super init];
    if (self) {
        self.itemViewName = itemViewName;
        [self setDataSource:dataSource containBannerView:containBannerView];
    }
    return self;
}

- (id)copyWithZone:(nullable NSZone *)zone {
    NativeRenderWaterfallViewDataSource *dataSource = [[[self class] allocWithZone:zone] init];
    dataSource->_containBannerView = self.containBannerView;
    dataSource->_bannerView = _bannerView;
    NSMutableArray<NSArray<NativeRenderObjectView *> *> *objectSectionViews = [NSMutableArray arrayWithCapacity:[_cellRenderObjectViews count]];
    for (NSArray<NativeRenderObjectView *> *objects in _cellRenderObjectViews) {
        NSArray<NativeRenderObjectView *> *copiedObjects = [objects copy];
        [objectSectionViews addObject:copiedObjects];
    }
    dataSource->_cellRenderObjectViews = [objectSectionViews copy];
    dataSource.itemViewName = [self.itemViewName copy];
    return dataSource;
}

- (void)setDataSource:(NSArray<NativeRenderObjectView *> *)dataSource {
    [self setDataSource:dataSource containBannerView:NO];
}

- (void)setDataSource:(NSArray<NativeRenderObjectView *> *)dataSource
    containBannerView:(BOOL)containBannerView {
    _containBannerView = containBannerView;
    if ([dataSource count] > 0) {
        if (containBannerView) {
            _bannerView = [dataSource firstObject];
        }
        NSUInteger loc = _containBannerView ? 1 : 0;
        NSArray<NativeRenderObjectView *> *candidateRenderObjectViews = [dataSource subarrayWithRange:NSMakeRange(loc, [dataSource count] - loc)];
        NSString *viewName = self.itemViewName;
        static dispatch_once_t onceToken;
        static NSPredicate *prediate = nil;
        dispatch_once(&onceToken, ^{
            prediate = [NSPredicate predicateWithBlock:^BOOL(id  _Nullable evaluatedObject, NSDictionary<NSString *,id> * _Nullable bindings) {
                NativeRenderObjectView *renderObjectView = (NativeRenderObjectView *)evaluatedObject;
                if ([renderObjectView.viewName isEqualToString:viewName]) {
                    return YES;
                }
                return NO;
            }];
        });
        NSArray<NativeRenderObjectView *> *objects = [candidateRenderObjectViews filteredArrayUsingPredicate:prediate];
        if ([objects count]) {
            _cellRenderObjectViews = [NSArray arrayWithObject:objects];
        }
        else {
            _cellRenderObjectViews = nil;
        }
    }
}

-(NativeRenderObjectView *)bannerView {
    return _bannerView;
}

- (NSArray<NSArray<NativeRenderObjectView *> *> *)cellRenderObjectViews {
    return [_cellRenderObjectViews copy];
}

- (NativeRenderObjectView *)cellForIndexPath:(NSIndexPath *)indexPath {
    if (_containBannerView && 0 == [indexPath section]) {
        return _bannerView;
    }
    else {
        return [[_cellRenderObjectViews firstObject] objectAtIndex:[indexPath row]];
    }
}

- (NativeRenderObjectView *)headerForSection:(NSInteger)section {
    return nil;
}

- (NSInteger)numberOfSection {
    NSInteger count = _containBannerView ? 1  : 0;
    count += [[_cellRenderObjectViews firstObject] count] ? 1 : 0;
    return count;
}

- (NSInteger)numberOfCellForSection:(NSInteger)section {
    if (_containBannerView) {
        return 0 == section ? 1 : [[_cellRenderObjectViews firstObject] count];
    }
    else {
        return [[_cellRenderObjectViews firstObject] count];
    }
}

- (NSIndexPath *)indexPathOfCell:(NativeRenderObjectView *)cell {
    NSInteger row = 0;
    NSInteger section = 0;
    if (_containBannerView) {
        if (_bannerView != cell) {
            section = 1;
            row = [[_cellRenderObjectViews firstObject] indexOfObject:cell];
        }
    }
    else {
        row = [[_cellRenderObjectViews firstObject] indexOfObject:cell];
    }
    return [NSIndexPath indexPathForRow:row inSection:section];
}

- (NSIndexPath *)indexPathForFlatIndex:(NSInteger)index {
    NSInteger row = 0;
    NSInteger section = 0;
    if (_containBannerView) {
        if (0 != index) {
            section = 1;
            index -= 1;
        }
    }
    else {
        row = index;
    }
    return [NSIndexPath indexPathForRow:row inSection:section];
}

- (NSInteger)flatIndexForIndexPath:(NSIndexPath *)indexPath {
    NSInteger row = [indexPath row];
    NSInteger section = [indexPath section];
    NSInteger index = 0;
    if (_containBannerView) {
        if (0 != section) {
            index = row + 1;
        }
    }
    else {
        index = row;
    }
    return index;
}

static BOOL ObjectViewNeedReload(NativeRenderObjectView *object1,
                                 NativeRenderObjectView *object2,
                                 NSHashTable<__kindof NativeRenderObjectView *> *frameChangedItems) {
    if (object1 != object2) {
        return YES;
    }
    if ([frameChangedItems containsObject:object1]) {
        return YES;
    }
    return NO;
}

static void ObjectsArrayDiff(NSArray<NativeRenderObjectView *> *objects1,
                             NSArray<NativeRenderObjectView *> *objects2,
                             NSHashTable<__kindof NativeRenderObjectView *> *frameChangedItems,
                             void(^result)(NSIndexSet *reloadIndex, NSIndexSet *insertedIndex, NSIndexSet *deletedIndex)) {
    NSMutableIndexSet *reloadIndex = [NSMutableIndexSet indexSet];
    NSMutableIndexSet *insertedIndex = [NSMutableIndexSet indexSet];
    NSMutableIndexSet *deletedIndex = [NSMutableIndexSet indexSet];

    NSEnumerator *obj1Enumer = [objects1 objectEnumerator];
    NSEnumerator *obj2Enumer = [objects2 objectEnumerator];
    NSUInteger index = 0;
    do {
        NativeRenderObjectView *object1 = [obj1Enumer nextObject];
        NativeRenderObjectView *object2 = [obj2Enumer nextObject];
        if (object1 && object2) {
            if (ObjectViewNeedReload(object1, object2, frameChangedItems)) {
                [reloadIndex addIndex:index];
            }
        }
        else if (object1) {
            [insertedIndex addIndex:index];
            obj2Enumer = nil;
        }
        else if (object2){
            [deletedIndex addIndex:index];
            obj1Enumer = nil;
        }
        else {
            obj1Enumer = nil;
            obj2Enumer = nil;
        }
        index++;
    } while (obj1Enumer || obj2Enumer);
    result([reloadIndex copy], [insertedIndex copy], [deletedIndex copy]);
}

static NSArray<NSIndexPath *> *IndexPathForIndexSet(NSUInteger section, NSIndexSet *indexSet) {
    if (!indexSet || 0 == [indexSet count]) {
        return nil;
    }
    NSUInteger indexBuffer[[indexSet count]];
    NSUInteger resultCount = [indexSet getIndexes:indexBuffer maxCount:[indexSet count] inIndexRange:nil];
    HPAssert(resultCount == [indexSet count], @"Should get all index from indexset");
    NSMutableArray<NSIndexPath *> *indexPaths = [NSMutableArray arrayWithCapacity:resultCount];
    for (NSUInteger i = 0; i < resultCount; i++) {
        NSUInteger index = indexBuffer[i];
        NSIndexPath *indexPath = [NSIndexPath indexPathForItem:index inSection:section];
        [indexPaths addObject:indexPath];
    }
    return [indexPaths copy];
}

- (void)cellDiffFromAnother:(NativeRenderWaterfallViewDataSource *)another
             sectionStartAt:(NSUInteger)startSection
          frameChangedItems:(NSHashTable<__kindof NativeRenderObjectView *> *)frameChangedItems
                     result:(void(^)(NSArray<NSIndexPath *> *reloadedItemIndexPath,
                                     NSArray<NSIndexPath *> *InsertedIndexPath,
                                     NSArray<NSIndexPath *> *deletedIndexPath,
                                     NSIndexSet *insertedSecionIndexSet,
                                     NSIndexSet *deletedSectionIndexSet))result {
    NSMutableArray<NSIndexPath *> *reloadedItemIndexPath = [NSMutableArray arrayWithCapacity:16];
    NSMutableArray<NSIndexPath *> *InsertedIndexPath = [NSMutableArray arrayWithCapacity:16];
    NSMutableArray<NSIndexPath *> *deletedIndexPath = [NSMutableArray arrayWithCapacity:16];
    NSMutableIndexSet *insertedSecionIndexSet = [NSMutableIndexSet indexSet];
    NSMutableIndexSet *deletedSectionIndexSet = [NSMutableIndexSet indexSet];
    
    NSArray<NSArray<NativeRenderObjectView *> *> *currenCellObjects = self.cellRenderObjectViews;
    NSArray<NSArray<NativeRenderObjectView *> *> *anotherCellObjects = another.cellRenderObjectViews;
    //compare sections
    //sections number equal,
    NSEnumerator *obj1Enumer = [currenCellObjects objectEnumerator];
    NSEnumerator *obj2Enumer = [anotherCellObjects objectEnumerator];
    NSUInteger section = startSection;
    do {
        NSArray<NativeRenderObjectView *> *objects1 = [obj1Enumer nextObject];
        NSArray<NativeRenderObjectView *> *objects2 = [obj2Enumer nextObject];
        if (objects1 && objects2) {
            ObjectsArrayDiff(objects1, objects2, frameChangedItems, ^(NSIndexSet *reloadIndex, NSIndexSet *insertedIndex, NSIndexSet *deletedIndex) {
                NSArray<NSIndexPath *> *reloadIndics = IndexPathForIndexSet(section, reloadIndex);
                if (reloadIndics) {
                    [reloadedItemIndexPath addObjectsFromArray:reloadIndics];
                }
                NSArray<NSIndexPath *> *insertedIndics = IndexPathForIndexSet(section, insertedIndex);
                if (insertedIndics) {
                    [InsertedIndexPath addObjectsFromArray:insertedIndics];
                }
                NSArray<NSIndexPath *> *deletedIndics = IndexPathForIndexSet(section, deletedIndex);
                if (deletedIndics) {
                    [deletedIndexPath addObjectsFromArray:deletedIndics];
                }
            });
        }
        else if (objects1) {
            [insertedSecionIndexSet addIndex:section];
            obj2Enumer = nil;
        }
        else if (objects2) {
            [deletedSectionIndexSet addIndex:section];
            obj1Enumer = nil;
        }
        else {
            obj1Enumer = nil;
            obj2Enumer = nil;
        }
        section++;
    } while (obj2Enumer || obj2Enumer);
    result([reloadedItemIndexPath copy], [InsertedIndexPath copy], [deletedIndexPath copy], [insertedSecionIndexSet copy], [deletedSectionIndexSet copy]);
}

- (void)applyDiff:(NativeRenderWaterfallViewDataSource *)another
    changedConext:(WaterfallItemChangeContext *)context
 forWaterfallView:(UICollectionView *)view
       completion:(void(^)(BOOL success))completion{
    if (!another ||
        0 == [self.cellRenderObjectViews count] ||
        0 == [another.cellRenderObjectViews count]) {
        [view reloadData];
        completion(YES);
        return;
    }

    //check banner view change
    NSMutableArray<NSInvocation *> *batchUpdate = [NSMutableArray arrayWithCapacity:8];
    NSArray<NSInvocation *> *bannerInvocation = [self bannerViewChangeInvocation:another
                                                                         context:context
                                                               forCollectionView:view];
    if (bannerInvocation) {
        [batchUpdate addObjectsFromArray:bannerInvocation];
    }
//    NSArray<NSInvocation *> *cellInvocation = [self cellViewChangeInvocation:another
//                                                                     context:context
//                                                           forCollectionView:view];
//    if (cellInvocation) {
//        [batchUpdate addObjectsFromArray:cellInvocation];
//    }
    NSUInteger section = self.containBannerView ? 1 : 0;
    [self cellDiffFromAnother:another
               sectionStartAt:section
            frameChangedItems:context.frameChangedItems
                       result:^(NSArray<NSIndexPath *> *reloadedItemIndexPath,
                                                                      NSArray<NSIndexPath *> *InsertedIndexPath,
                                                                      NSArray<NSIndexPath *> *deletedIndexPath,
                                                                      NSIndexSet *insertedSecionIndexSet,
                                                                      NSIndexSet *deletedSectionIndexSet) {
        if ([insertedSecionIndexSet count]) {
            NSInvocation *invocation = InvocationFromSelector(view, @selector(insertSections:), insertedSecionIndexSet);
            if (invocation) {
                [batchUpdate addObject:invocation];
            }
        }
        if ([deletedSectionIndexSet count]) {
            NSInvocation *invocation = InvocationFromSelector(view, @selector(deleteSections:), deletedSectionIndexSet);
            if (invocation) {
                [batchUpdate addObject:invocation];
            }
        }
        if ([reloadedItemIndexPath count]) {
            NSInvocation *invocation = InvocationFromSelector(view, @selector(reloadItemsAtIndexPaths:), reloadedItemIndexPath);
            if (invocation) {
                [batchUpdate addObject:invocation];
            }
        }
        if ([InsertedIndexPath count]) {
            NSInvocation *invocation = InvocationFromSelector(view, @selector(insertItemsAtIndexPaths:), InsertedIndexPath);
            if (invocation) {
                [batchUpdate addObject:invocation];
            }
        }
        if ([deletedIndexPath count]) {
            NSInvocation *invocation = InvocationFromSelector(view, @selector(deleteItemsAtIndexPaths:), deletedIndexPath);
            if (invocation) {
                [batchUpdate addObject:invocation];
            }
        }
    }];
    BOOL success = YES;
    if ([batchUpdate count]) {
        [UIView setAnimationsEnabled:NO];
        @try {
            [view performBatchUpdates:^{
                for (NSInvocation *invocation in batchUpdate) {
                    [invocation invoke];
                }
            } completion:^(BOOL finished) {
                [UIView setAnimationsEnabled:YES];
            }];
        } @catch (NSException *exception) {
            success = NO;
            [view reloadData];
            [UIView setAnimationsEnabled:YES];
        }
    }
    completion(success);
}

static NSInvocation *InvocationFromSelector(id object, SEL selector, id param) {
    if (!selector || !object) {
        return nil;
    }
    NSMethodSignature *methodSignature = [UICollectionView instanceMethodSignatureForSelector:selector];
    NSInvocation *invocation = [NSInvocation invocationWithMethodSignature:methodSignature];
    [invocation setTarget:object];
    [invocation setSelector:selector];
    if (param) {
        [invocation setArgument:&param atIndex:2];
    }
    if (![invocation argumentsRetained]) {
        [invocation retainArguments];
    }
    return invocation;
}

- (NSArray<NSInvocation *> *)bannerViewChangeInvocation:(NativeRenderWaterfallViewDataSource *)another
                                                context:(WaterfallItemChangeContext *)context
                                      forCollectionView:(UICollectionView *)collectionView {
    NSIndexSet *bannerIndexSet = [NSIndexSet indexSetWithIndex:0];
    //check if banner view changed
    if (self.containBannerView == another.containBannerView) {
        if ([[context frameChangedItems] containsObject:self.bannerView]) {
            NSInvocation *invocation =
                InvocationFromSelector(collectionView,
                                       @selector(reloadSections:),
                                       bannerIndexSet);
            return invocation ? @[invocation] : nil;
        }
        return nil;
    }
    //banner view added or deleted
    SEL sel = self.containBannerView ? @selector(insertSections:) : @selector(deleteSections:);
    NSInvocation *invocation = InvocationFromSelector(collectionView, sel, bannerIndexSet);
    return invocation ? @[invocation] : nil;
}

static NSComparisonResult ContainViewComparison(NativeRenderWaterfallViewDataSource *source1, NativeRenderWaterfallViewDataSource *source2) {
    if (source1.containBannerView == source2.containBannerView) {
        return NSOrderedSame;
    }
    else if (source1.containBannerView) {
        return NSOrderedDescending;
    }
    else {
        return NSOrderedAscending;
    }
}

- (NSArray<NSInvocation *> *)cellViewChangeInvocation:(NativeRenderWaterfallViewDataSource *)another
                                              context:(WaterfallItemChangeContext *)context
                                    forCollectionView:(UICollectionView *)collectionView {
    //todo 计算太麻烦了，先直接reload all吧
    NSHashTable<__kindof NativeRenderObjectView *> *movedItems = [context movedItems];
    if ([movedItems count]) {
        NSInvocation *invocation =
            InvocationFromSelector(collectionView, @selector(reloadData), nil);
        return @[invocation];
    }
    //waterfall contains only one section
    
//    NSComparisonResult result = ContainViewComparison(self, another);
    //new and old data sources contain cell view section, update cell items section
    NSMutableArray<NSInvocation *> *invocations = [NSMutableArray arrayWithCapacity:8];
    NSIndexSet *cellSectionIndexSet = [NSIndexSet indexSetWithIndex:self.containBannerView ? 1 : 0];
    if ([[self.cellRenderObjectViews firstObject] count] && [[another.cellRenderObjectViews firstObject] count]) {
        //get inserted items
        NSHashTable<__kindof NativeRenderObjectView *> *addedItems = [context addedItems];
        NSIndexSet *insertedItemsIndexSet = [[self.cellRenderObjectViews firstObject] indexesOfObjectsPassingTest:^BOOL(NativeRenderObjectView * _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
            if ([addedItems containsObject:obj]) {
                return YES;
            }
            return NO;
        }];
        if ([insertedItemsIndexSet count]) {
            NSMutableArray<NSIndexPath *> *insertedItemsIndexPaths = [NSMutableArray arrayWithCapacity:[insertedItemsIndexSet count]];
            [insertedItemsIndexSet enumerateIndexesUsingBlock:^(NSUInteger idx, BOOL * _Nonnull stop) {
                NSIndexPath *indexPath = [NSIndexPath indexPathForRow:idx inSection:[cellSectionIndexSet firstIndex]];
                [insertedItemsIndexPaths addObject:indexPath];
            }];
            NSInvocation *invocation =
                InvocationFromSelector(collectionView,
                                       @selector(insertItemsAtIndexPaths:),
                                       insertedItemsIndexPaths);
            [invocations addObject:invocation];
        }
        //get deleteed items
        NSSet<__kindof NativeRenderObjectView *> *deletedItems = [context deletedItems];
        if ([deletedItems count]) {
            NSMutableIndexSet *deletedItemsIndexSet = [NSMutableIndexSet indexSet];
            [deletedItems enumerateObjectsUsingBlock:^(__kindof NativeRenderObjectView * _Nonnull obj, BOOL * _Nonnull stop) {
                NSUInteger index = [[[another cellRenderObjectViews]firstObject] indexOfObject:obj];
                if (NSNotFound != index) {
                    [deletedItemsIndexSet addIndex:index];
                }
            }];
            if ([deletedItemsIndexSet count]) {
                NSMutableArray<NSIndexPath *> *deletedIndexPaths = [NSMutableArray arrayWithCapacity:[deletedItemsIndexSet count]];
                [deletedItemsIndexSet enumerateIndexesUsingBlock:^(NSUInteger idx, BOOL * _Nonnull stop) {
                    NSIndexPath *indexPath = [NSIndexPath indexPathForRow:idx inSection:[cellSectionIndexSet firstIndex]];
                    [deletedIndexPaths addObject:indexPath];
                }];
                NSInvocation *invocation =
                    InvocationFromSelector(collectionView,
                                           @selector(deleteItemsAtIndexPaths:),
                                           deletedIndexPaths);
                [invocations addObject:invocation];
            }
        }
        //get frame update items
        NSHashTable<__kindof NativeRenderObjectView *> *frameChangedItems = [context frameChangedItems];
        if ([frameChangedItems count]) {
            NSMutableArray<NSIndexPath *> *frameChangedIndexPaths = [NSMutableArray arrayWithCapacity:[frameChangedItems count]];
            NSEnumerator *enumerator = [frameChangedItems objectEnumerator];
            NativeRenderObjectView *objectView = [enumerator nextObject];
            while (objectView) {
                NSUInteger index = [[self.cellRenderObjectViews firstObject] indexOfObject:objectView];
                if (NSNotFound != index) {
                    NSIndexPath *indexPath = [NSIndexPath indexPathForRow:index inSection:[cellSectionIndexSet firstIndex]];
                    [frameChangedIndexPaths addObject:indexPath];
                }
            }
            NSInvocation *invocation =
                InvocationFromSelector(collectionView, @selector(reloadItemsAtIndexPaths:), frameChangedIndexPaths);
            [invocations addObject:invocation];
        }
        //get moved items
    }
    //only the new one contains cell items, insert cell items section
    else if ([[self.cellRenderObjectViews firstObject] count]) {
        NSInvocation *invocation = InvocationFromSelector(collectionView, @selector(insertSections:), cellSectionIndexSet);
        [invocations addObject:invocation];
    }
    //only old contains data sources, delete cell items section
    else if ([[another.cellRenderObjectViews firstObject] count]) {
        NSInvocation *invocation = InvocationFromSelector(collectionView, @selector(deleteSections:), cellSectionIndexSet);
        [invocations addObject:invocation];
    }
    return [invocations copy];
}

@end
