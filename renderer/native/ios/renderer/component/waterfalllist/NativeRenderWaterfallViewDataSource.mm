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

#import "NativeRenderWaterfallViewDataSource.h"
#import "NativeRenderObjectView.h"

@interface NativeRenderWaterfallViewDataSource () {
    BOOL _containBannerView;
    NSArray<NativeRenderObjectView *> *_cellRenderObjectViews;
    NativeRenderObjectView *_bannerView;
}

@end

@implementation NativeRenderWaterfallViewDataSource

- (instancetype)init {
    self = [super init];
    if (self) {
    }
    return self;
}

- (id)copyWithZone:(nullable NSZone *)zone {
    NativeRenderWaterfallViewDataSource *dataSource = [[[self class] allocWithZone:zone] init];
    dataSource->_containBannerView = self.containBannerView;
    dataSource->_bannerView = _bannerView;
    dataSource->_cellRenderObjectViews = [_cellRenderObjectViews copy];
    dataSource.itemViewName = self.itemViewName;
    return dataSource;
}

- (void)setDataSource:(NSArray<NativeRenderObjectView *> *)dataSource {
    [self setDataSource:dataSource containBannerView:NO];
}

- (void)setDataSource:(NSArray<NativeRenderObjectView *> *)dataSource containBannerView:(BOOL)containBannerView {
    _containBannerView = containBannerView;
    if ([dataSource count] > 0) {
        if (containBannerView) {
            _bannerView = [dataSource firstObject];
        }
        NSArray<NativeRenderObjectView *> *candidateRenderObjectViews = [dataSource subarrayWithRange:NSMakeRange(1, [dataSource count] - 1)];
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
        _cellRenderObjectViews = [candidateRenderObjectViews filteredArrayUsingPredicate:prediate];
    }
}

-(NativeRenderObjectView *)bannerView {
    return _bannerView;
}

- (NSArray<NativeRenderObjectView *> *)cellRenderObjectViews {
    return [_cellRenderObjectViews copy];
}

- (NativeRenderObjectView *)cellForIndexPath:(NSIndexPath *)indexPath {
    if (_containBannerView && 0 == [indexPath section]) {
        return _bannerView;
    }
    else {
        return [_cellRenderObjectViews objectAtIndex:[indexPath row]];
    }
}

- (NativeRenderObjectView *)headerForSection:(NSInteger)section {
    return nil;
}

- (NSInteger)numberOfSection {
    return _containBannerView ? 2  : 1;
}

- (NSInteger)numberOfCellForSection:(NSInteger)section {
    if (_containBannerView) {
        return 0 == section ? 1 : [_cellRenderObjectViews count];
    }
    else {
        return [_cellRenderObjectViews count];
    }
}

- (NSIndexPath *)indexPathOfCell:(NativeRenderObjectView *)cell {
    NSInteger row = 0;
    NSInteger section = 0;
    if (_containBannerView) {
        if (_bannerView != cell) {
            section = 1;
            row =  [_cellRenderObjectViews indexOfObject:cell];
        }
    }
    else {
        row =  [_cellRenderObjectViews indexOfObject:cell];
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

@end

@implementation NativeRenderWaterfallViewDataSource (ApplyDiff)

- (void)applyDiff:(NativeRenderWaterfallViewDataSource *)another forWaterfallView:(UICollectionView *)view {
    if (!another) {
        [view reloadData];
        return;
    }
    @try {
        NativeRenderObjectView *selfBannerView = [self bannerView];
        NativeRenderObjectView *oldBannerView = [another bannerView];
        //check bannerview section
        BOOL updateBannerAction = NO;
        if (selfBannerView != oldBannerView) {
            updateBannerAction = YES;
        }
        NSArray<NativeRenderObjectView *> *selfNodes = [self cellRenderObjectViews];
        NSArray<NativeRenderObjectView *> *oldNodes = [another cellRenderObjectViews];
        if (selfNodes && oldNodes && [selfNodes isEqualToArray:oldNodes] && updateBannerAction) {
            [view reloadData];
            return;
        }
        //check cell section
        NSUInteger selfNodesCount = [selfNodes count];
        NSUInteger oldNodesCount = [oldNodes count];
        if (0 == selfNodesCount || 0 == oldNodesCount) {
            [view reloadData];
            return;
        }
        //incremental
        if (selfNodesCount > oldNodesCount) {
            NSArray<NativeRenderObjectView *> *intersection = [selfNodes subarrayWithRange:NSMakeRange(0, [oldNodes count])];
            //no change, just incremental
            if ([intersection isEqualToArray:oldNodes]) {
                NSUInteger incrementalNumber = selfNodesCount - oldNodesCount;
                NSMutableArray<NSIndexPath *> *incrementalIndexPathes = [NSMutableArray arrayWithCapacity:incrementalNumber];
                for (NSUInteger i = 0; i < incrementalNumber; i++) {
                    NSIndexPath *indexPath = [NSIndexPath indexPathForRow:oldNodesCount + i inSection:selfBannerView?1:0];
                    [incrementalIndexPathes addObject:indexPath];
                }
                [view insertItemsAtIndexPaths:incrementalIndexPathes];
            }
            else {
                [view reloadData];
            }
        }
        else if (selfNodesCount < oldNodesCount) {
            //reduction
            NSArray<NativeRenderObjectView *> *reduction = [oldNodes subarrayWithRange:NSMakeRange(0, [selfNodes count])];
            //no change, just reduction
            if ([reduction isEqualToArray:selfNodes]) {
                NSUInteger reductionNumber = oldNodesCount - selfNodesCount;
                NSMutableArray<NSIndexPath *> *reductionIndexPathes = [NSMutableArray arrayWithCapacity:reductionNumber];
                for (NSUInteger i = 0; i < reductionNumber; i++) {
                    NSIndexPath *indexPath = [NSIndexPath indexPathForRow:selfNodesCount + i inSection:selfBannerView?1:0];
                    [reductionIndexPathes addObject:indexPath];
                }
                [view deleteItemsAtIndexPaths:reductionIndexPathes];
            }
            else {
                [view reloadData];
            }
        }
    } @catch (NSException *exception) {
        [view reloadData];
    }
}

//- ()

@end
