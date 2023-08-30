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

#import <UIKit/UIKit.h>
#import "NativeRenderBaseListViewDataSource.h"
#import "NativeRenderObjectView.h"
#import "NativeRenderObjectWaterfall.h"

@interface NativeRenderBaseListViewDataSource () {
    NSMutableArray *_headerRenderObjects;
}

@end

@implementation NativeRenderBaseListViewDataSource

- (void)setDataSource:(NSArray<NativeRenderObjectView *> *)dataSource containBannerView:(BOOL)containBannerView {
    NSMutableArray *headerRenderObjects = [NSMutableArray array];
    NSMutableArray<NSMutableArray<NativeRenderObjectView *> *> *cellRenderObjects = [NSMutableArray array];
    NSMutableArray<NativeRenderObjectView *> *sectionCellRenderObject = nil;
    BOOL isFirstIndex = YES;
    for (NativeRenderObjectView *renderObject in dataSource) {
        NSString *viewName = [renderObject viewName];
        if ([self.itemViewName isEqualToString:viewName]) {
            NSNumber *sticky = renderObject.props[@"sticky"];
            if ([sticky boolValue]) {
                [headerRenderObjects addObject:renderObject];
                if (sectionCellRenderObject) {
                    [cellRenderObjects addObject:sectionCellRenderObject];
                    sectionCellRenderObject = nil;
                }
            }
            else {
                if (nil == sectionCellRenderObject) {
                    sectionCellRenderObject = [NSMutableArray array];
                }
                [sectionCellRenderObject addObject:renderObject];
            }
            if (isFirstIndex && 0 == [headerRenderObjects count]) {
                [headerRenderObjects addObject:[NSNull null]];
                isFirstIndex = NO;
            }
        }
    }
    if (sectionCellRenderObject) {
        [cellRenderObjects addObject:sectionCellRenderObject];
    }
    _headerRenderObjects = headerRenderObjects;
    self.cellRenderObjectViews = [cellRenderObjects copy];
}

- (NativeRenderObjectView *)cellForIndexPath:(NSIndexPath *)indexPath {
    if (self.cellRenderObjectViews.count > indexPath.section) {
        NSArray<NativeRenderObjectView *> *sectionCellRenderObject = [self.cellRenderObjectViews objectAtIndex:indexPath.section];
        if (sectionCellRenderObject.count > indexPath.row) {
            return [sectionCellRenderObject objectAtIndex:indexPath.row];
        }
    }
    return nil;
}

- (NSIndexPath *)indexPathOfCell:(NativeRenderObjectView *)cell {
    NSInteger section = 0;
    NSInteger row = 0;
    for (NSInteger sec = 0; sec < [self.cellRenderObjectViews count]; sec++) {
        NSArray<NativeRenderObjectView *> *sectionCellRenderObjects = [self.cellRenderObjectViews objectAtIndex:sec];
        for (NSUInteger r = 0; r < [sectionCellRenderObjects count]; r++) {
            NativeRenderObjectView *cellRenderObject = [sectionCellRenderObjects objectAtIndex:r];
            if (cellRenderObject == cell) {
                section = sec;
                row = r;
            }
        }
    }
    return [NSIndexPath indexPathForRow:row inSection:section];
}

- (NativeRenderObjectView *)headerForSection:(NSInteger)section {
    if (_headerRenderObjects.count > section) {
        return [_headerRenderObjects objectAtIndex:section];
    }
    return nil;
}

- (NSInteger)numberOfSection {
    NSInteger numberOfSection = self.cellRenderObjectViews.count;
    return numberOfSection;
}

- (NSInteger)numberOfCellForSection:(NSInteger)section {
    if (self.cellRenderObjectViews.count > section) {
        return [[self.cellRenderObjectViews objectAtIndex:section] count];
    }
    return 0;
}

- (NSIndexPath *)indexPathForFlatIndex:(NSInteger)index {
    NSInteger sectionIndex = 0;
    NSInteger rowIndex = 0;
    NSInteger selfIncreaseIndex = 0;
    for (NSInteger sec = 0; sec < [self.cellRenderObjectViews count]; sec++) {
        NSArray<NativeRenderObjectView *> *sectionCellRenderObjects = [self.cellRenderObjectViews objectAtIndex:sec];
        for (NSUInteger r = 0; r < [sectionCellRenderObjects count]; r++) {
            if (index == selfIncreaseIndex) {
                sectionIndex = sec;
                rowIndex = r;
                break;
            }
            selfIncreaseIndex++;
        }
    }
    return [NSIndexPath indexPathForRow:rowIndex inSection:sectionIndex];
}

- (NSInteger)flatIndexForIndexPath:(NSIndexPath *)indexPath {
    NSInteger section = [indexPath section];
    NSInteger row = [indexPath row];
    NSInteger flatIndex = 0;
    for (NSInteger sec = 0; sec <= section; sec++) {
        if (sec == section) {
            flatIndex += row;
        }
        else {
            NSArray<NativeRenderObjectView *> *sectionCellRenderObjects = [self.cellRenderObjectViews objectAtIndex:sec];
            flatIndex += [sectionCellRenderObjects count];
        }
    }
    return flatIndex;
}

- (BOOL)containBannerView {
    return NO;
}

- (UIView *)bannerView {
    return nil;
}

- (void)applyDiff:(NativeRenderBaseListViewDataSource *)another
    changedConext:(WaterfallItemChangeContext *)context
 forWaterfallView:(UICollectionView *)view
       completion:(void(^)(BOOL success))completion {
    if (!another ||
        !context ||
        ![[another cellRenderObjectViews] count]) {
        [view reloadData];
        completion(YES);
        return;
    }
//    NSArray<NSInvocation *> *batchUpdateInvocations = [self cellViewChangeInvocation:another context:context forCollectionView:view];
    NSMutableArray<NSInvocation *> *batchUpdate = [NSMutableArray arrayWithCapacity:8];
    [self cellDiffFromAnother:another
               sectionStartAt:0
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
            [view reloadData];
            success = NO;
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

static inline void EnumCellRenderObjects(NSArray<NSArray<__kindof NativeRenderObjectView *> *> *objects,
                                         void (^ _Nonnull block)(__kindof NativeRenderObjectView * object, NSUInteger section, NSUInteger row)) {
    for (NSUInteger section = 0; section < [objects count]; section ++) {
        NSArray<__kindof NativeRenderObjectView *> *sectionObjects = [objects objectAtIndex:section];
        for (NSUInteger row = 0; row < [sectionObjects count]; row++) {
            __kindof NativeRenderObjectView *object = [sectionObjects objectAtIndex:row];
            block(object, section, row);
        }
    }
}

- (NSArray<NSInvocation *> *)cellViewChangeInvocation:(NativeRenderWaterfallViewDataSource *)another
                                              context:(WaterfallItemChangeContext *)context
                                    forCollectionView:(UICollectionView *)collectionView {
    //todo 如果包含move的item，直接返回吧，不好算
//    if ([[context movedItems] count]) {
//        NSInvocation *invocation = InvocationFromSelector(collectionView, @selector(reloadData), nil);
//        return @[invocation];
//    }
    
    NSMutableArray<NSInvocation *> *invocations = [NSMutableArray arrayWithCapacity:8];
    NSHashTable<__kindof NativeRenderObjectView *> *insertedItems = [context addedItems];
    NSMutableSet<__kindof NativeRenderObjectView *> *deletedItems = [[context deletedItems] mutableCopy];
    NSHashTable<__kindof NativeRenderObjectView *> *frameChangedItems = [context frameChangedItems];
    //get section number change
    //section number increased or decreased
    NSUInteger selfSectionCount = [self.cellRenderObjectViews count];
    NSUInteger anotherSectionCount = [another.cellRenderObjectViews count];
    if (selfSectionCount > anotherSectionCount) {
        NSMutableIndexSet *indexSet = [NSMutableIndexSet indexSet];
        do {
            //remove added items from [WaterfallItemChangeContext addedItems] to avoid insertItemsAtIndexes: below
            NSArray<__kindof NativeRenderObjectView *> *objects = [self.cellRenderObjectViews objectAtIndex:anotherSectionCount];
            [objects enumerateObjectsUsingBlock:^(id  _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
                [insertedItems removeObject:obj];
            }];
            [indexSet addIndex:anotherSectionCount];
            anotherSectionCount++;
        } while (selfSectionCount != anotherSectionCount);
        NSInvocation *invocation = InvocationFromSelector(collectionView, @selector(insertSections:), indexSet);
        [invocations addObject:invocation];
    }
    else if (selfSectionCount < anotherSectionCount) {
        NSMutableIndexSet *indexSet = [NSMutableIndexSet indexSet];
        do {
            anotherSectionCount--;
            //remove deleted items from [WaterfallItemChangeContext deletedItems] to avoid deleteItemsAtIndexPaths: below
            NSArray<__kindof NativeRenderObjectView *> *objects = [another.cellRenderObjectViews objectAtIndex:anotherSectionCount];
            [objects enumerateObjectsUsingBlock:^(__kindof NativeRenderObjectView * _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
                [deletedItems removeObject:obj];
            }];
            [indexSet addIndex:anotherSectionCount];
        } while (selfSectionCount != anotherSectionCount);
        NSInvocation *invocation = InvocationFromSelector(collectionView, @selector(deleteSections:), indexSet);
        [invocations addObject:invocation];
    }
    //section number unchanged
    else {
        //get inserted items and frame changed items if exists
        if ([insertedItems count] || [frameChangedItems count]) {
            NSMutableArray<NSIndexPath *> *insertedIndexPaths = [NSMutableArray arrayWithCapacity:16];
            NSMutableArray<NSIndexPath *> *frameChangedIndexPaths = [NSMutableArray arrayWithCapacity:16];
            EnumCellRenderObjects(self.cellRenderObjectViews, ^(__kindof NativeRenderObjectView *object, NSUInteger section, NSUInteger row) {
                if ([insertedItems count] && [insertedItems containsObject:object]) {
                    NSIndexPath *indexPath = [NSIndexPath indexPathForRow:row inSection:section];
                    [insertedIndexPaths addObject:indexPath];
                }
                if ([frameChangedItems count] && [frameChangedItems containsObject:object]) {
                    NSIndexPath *indexPath = [NSIndexPath indexPathForRow:row inSection:section];
                    [frameChangedIndexPaths addObject:indexPath];
                }
            });
            if ([insertedIndexPaths count]) {
                NSInvocation *invocation =
                    InvocationFromSelector(collectionView, @selector(insertItemsAtIndexPaths:), insertedIndexPaths);
                [invocations addObject:invocation];
            }
            if ([frameChangedIndexPaths count]) {
                NSInvocation *invocation =
                    InvocationFromSelector(collectionView, @selector(reloadItemsAtIndexPaths:), frameChangedIndexPaths);
                [invocations addObject:invocation];
            }
        }
        //get deleted items
        if ([deletedItems count]) {
            NSMutableArray<NSIndexPath *> *deletedIndexPaths = [NSMutableArray arrayWithCapacity:16];
            EnumCellRenderObjects(another.cellRenderObjectViews, ^(__kindof NativeRenderObjectView *object, NSUInteger section, NSUInteger row) {
                if ([deletedItems containsObject:object]) {
                    NSIndexPath *indexPath = [NSIndexPath indexPathForRow:row inSection:section];
                    [deletedIndexPaths addObject:indexPath];
                }
            });
            if ([deletedIndexPaths count]) {
                NSInvocation *invocation =
                    InvocationFromSelector(collectionView, @selector(deleteItemsAtIndexPaths:), deletedIndexPaths);
                [invocations addObject:invocation];
            }
        }
    }
    return invocations;
}

@end
