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
#import "HippyBaseListViewDataSource.h"
#import "HippyShadowView.h"

@interface HippyBaseListViewDataSource () {
    NSMutableArray<HippyShadowView *> *_headerShadowViews;
    NSMutableArray<NSMutableArray<HippyShadowView *> *> *_cellShadowViews;
    NSString *_itemViewName;
}

@end

@implementation HippyBaseListViewDataSource

- (void)setItemViewsName:(NSString *)viewName {
    _itemViewName = [viewName copy];
}

- (void)setDataSource:(NSArray<HippyShadowView *> *)dataSource {
    NSMutableArray<HippyShadowView *> *headerShadowViews = [NSMutableArray array];
    NSMutableArray<NSMutableArray<HippyShadowView *> *> *cellShadowViews = [NSMutableArray array];
    NSMutableArray<HippyShadowView *> *sectionCellShadowViews = nil;
    for (HippyShadowView *shadowView in dataSource) {
        NSString *viewName = [shadowView viewName];
        if ([_itemViewName isEqualToString:viewName]) {
            NSNumber *sticky = shadowView.props[@"sticky"];
            if ([sticky boolValue]) {
                [_headerShadowViews addObject:shadowView];
                if (sectionCellShadowViews) {
                    [cellShadowViews addObject:sectionCellShadowViews];
                    sectionCellShadowViews = nil;
                }
            }
            else {
                if (nil == sectionCellShadowViews) {
                    sectionCellShadowViews = [NSMutableArray array];
                }
                [sectionCellShadowViews addObject:shadowView];
            }
        }
    }
    if (sectionCellShadowViews) {
        [cellShadowViews addObject:sectionCellShadowViews];
    }
    _headerShadowViews = headerShadowViews;
    _cellShadowViews = cellShadowViews;
}

- (HippyShadowView *)cellForIndexPath:(NSIndexPath *)indexPath {
    if (_cellShadowViews.count > indexPath.section) {
        NSArray<HippyShadowView *> *sectionCellShadowViews = [_cellShadowViews objectAtIndex:indexPath.section];
        if (sectionCellShadowViews.count > indexPath.row) {
            return [sectionCellShadowViews objectAtIndex:indexPath.row];
        }
    }
    return nil;
}

- (NSIndexPath *)indexPathOfCell:(HippyShadowView *)cell {
    NSInteger section = 0;
    NSInteger row = 0;
    for (NSInteger sec = 0; sec < [_cellShadowViews count]; sec++) {
        NSArray<HippyShadowView *> *sectionCellShadowViews = [_cellShadowViews objectAtIndex:sec];
        for (NSUInteger r = 0; r < [sectionCellShadowViews count]; r++) {
            HippyShadowView *cellShadowView = [sectionCellShadowViews objectAtIndex:r];
            if (cellShadowView == cell) {
                section = sec;
                row = r;
            }
        }
    }
    return [NSIndexPath indexPathForRow:row inSection:section];
}

- (HippyShadowView *)headerForSection:(NSInteger)section {
    if (_headerShadowViews.count > section) {
        return [_headerShadowViews objectAtIndex:section];
    }
    return nil;
}

- (NSInteger)numberOfSection {
    return _cellShadowViews.count;
}

- (NSInteger)numberOfCellForSection:(NSInteger)section {
    if (_cellShadowViews.count > section) {
        return [[_cellShadowViews objectAtIndex:section] count];
    }
    return 0;
}

- (NSIndexPath *)indexPathForFlatIndex:(NSInteger)index {
    NSInteger sectionIndex = 0;
    NSInteger rowIndex = 0;
    NSInteger selfIncreaseIndex = 0;
    for (NSInteger sec = 0; sec < [_cellShadowViews count]; sec++) {
        NSArray<HippyShadowView *> *sectionCellShadowViews = [_cellShadowViews objectAtIndex:sec];
        for (NSUInteger r = 0; r < [sectionCellShadowViews count]; r++) {
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
            NSArray<HippyShadowView *> *sectionCellShadowViews = [_cellShadowViews objectAtIndex:sec];
            flatIndex += [sectionCellShadowViews count];
        }
    }
    return flatIndex;
}

@end
