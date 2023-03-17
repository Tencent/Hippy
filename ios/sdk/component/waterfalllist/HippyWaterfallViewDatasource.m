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

#import <UIKit/UIKit.h>
#import "HippyWaterfallViewDatasource.h"
#import "HippyVirtualNode.h"
#import "HippyVirtualList.h"

@interface HippyWaterfallViewDatasource () {
    HippyVirtualNode *_bannerNode;
    
    //HippyVirtualCell class only
    NSArray<HippyVirtualCell *> *_cellNodes;
}

@end

@implementation HippyWaterfallViewDatasource

- (instancetype)initWithCellNodes:(NSArray<HippyVirtualCell *> *)cellNodes bannerNode:(HippyVirtualNode *)bannerNode {
    self = [super init];
    if (self) {
        _bannerNode = bannerNode;
        _cellNodes = [cellNodes copy];
    }
    return self;
}

- (HippyVirtualNode *)bannerViewNode {
    return _bannerNode;
}

- (NSArray<HippyVirtualCell *> *)itemNodes {
    return _cellNodes;
}

- (NSUInteger)numberOfSections {
    NSUInteger number = 0;
    if (_bannerNode) {
        number++;
    }
    if ([_cellNodes count]) {
        number++;
    }
    return number;
}

- (NSUInteger)numberOfItemInSection:(NSUInteger)section {
    HippyAssert(section < 2, @"The number of waterfallview section is limited to 2");
    if (_bannerNode) {
        if (0 == section) {
            return 1;
        }
        else {
            return [_cellNodes count];
        }
    }
    else {
        return [_cellNodes count];
    }
}

- (__kindof HippyVirtualNode *)cellAtIndexPath:(NSIndexPath *)indexPath {
    NSInteger section = [indexPath section];
    NSInteger row = [indexPath row];
    if (_bannerNode) {
        if (0 == section) {
            HippyAssert(row < 1, @"If banner view is available, section 0 must only contain 1 row");
            return _bannerNode;
        }
        else {
            return [_cellNodes objectAtIndex:row];
        }
    }
    else {
        HippyAssert(section < 1, @"If banner view is unavailable, only 1 section exists");
        return [_cellNodes objectAtIndex:row];
    }
}

@end

@implementation HippyWaterfallViewDatasource (ApplyDiff)

- (void)applyDiff:(HippyWaterfallViewDatasource *)another forWaterfallView:(UICollectionView *)view {
    if (!another) {
        [view reloadData];
        return;
    }
    @try {
        HippyVirtualNode *selfBannerView = [self bannerViewNode];
        HippyVirtualNode *oldBannerView = [another bannerViewNode];
        NSIndexSet *bannerViewIndex = [NSIndexSet indexSetWithIndex:0];
        //check bannerview section
        dispatch_block_t updateBannerAction = NULL;
        if (selfBannerView && !oldBannerView) {
            updateBannerAction = ^(void){
                [view insertSections:bannerViewIndex];
            };
        }
        else if (!selfBannerView && oldBannerView) {
            updateBannerAction = ^(void){
                [view deleteSections:bannerViewIndex];
            };
        }
        else if (selfBannerView && oldBannerView && selfBannerView != oldBannerView) {
            updateBannerAction = ^(void){
                [view reloadSections:bannerViewIndex];
            };
        }
        else {
            
        }
        NSArray<HippyVirtualCell *> *selfNodes = [self itemNodes];
        NSArray<HippyVirtualCell *> *oldNodes = [another itemNodes];
        if (selfNodes && oldNodes && [selfNodes isEqualToArray:oldNodes] && updateBannerAction) {
            updateBannerAction();
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
            NSArray<HippyVirtualCell *> *intersection = [selfNodes subarrayWithRange:NSMakeRange(0, [oldNodes count])];
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
            NSArray<HippyVirtualCell *> *reduction = [oldNodes subarrayWithRange:NSMakeRange(0, [selfNodes count])];
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

@end
