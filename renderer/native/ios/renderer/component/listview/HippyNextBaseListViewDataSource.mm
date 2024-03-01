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
#import "HippyNextBaseListViewDataSource.h"
#import "HippyShadowView.h"
#import "HippyShadowListView.h"


static NSString * const kStickyCellPropKey = @"sticky";

@interface HippyNextBaseListViewDataSource () {
    NSMutableArray *_shadowHeaderViews;
}

@end

@implementation HippyNextBaseListViewDataSource

- (void)setDataSource:(NSArray<HippyShadowView *> *)dataSource containBannerView:(BOOL)containBannerView {
    NSMutableArray *shadowHeaders = [NSMutableArray array];
    NSMutableArray<NSMutableArray<HippyShadowView *> *> *shadowCells = [NSMutableArray array];
    NSMutableArray<HippyShadowView *> *shadowSectionCell = nil;
    BOOL isFirstIndex = YES;
    for (HippyShadowView *shadowView in dataSource) {
        if ([self.itemViewName isEqualToString:shadowView.viewName]) {
            NSNumber *sticky = shadowView.props[kStickyCellPropKey];
            if ([sticky boolValue]) {
                [shadowHeaders addObject:shadowView];
                if (shadowSectionCell) {
                    [shadowCells addObject:shadowSectionCell];
                    shadowSectionCell = nil;
                }
            } else {
                if (nil == shadowSectionCell) {
                    shadowSectionCell = [NSMutableArray array];
                }
                [shadowSectionCell addObject:shadowView];
            }
            if (isFirstIndex && 0 == [shadowHeaders count]) {
                [shadowHeaders addObject:[NSNull null]];
                isFirstIndex = NO;
            }
        }
    }
    if (shadowSectionCell) {
        [shadowCells addObject:shadowSectionCell];
    }
    _shadowHeaderViews = shadowHeaders;
    self->_shadowCellViews = [shadowCells copy];
}

- (HippyShadowView *)cellForIndexPath:(NSIndexPath *)indexPath {
    if (self.shadowCellViews.count > indexPath.section) {
        NSArray<HippyShadowView *> *sectionCellRenderObject = [self.shadowCellViews objectAtIndex:indexPath.section];
        if (sectionCellRenderObject.count > indexPath.row) {
            return [sectionCellRenderObject objectAtIndex:indexPath.row];
        }
    }
    return nil;
}

- (NSIndexPath *)indexPathOfCell:(HippyShadowView *)cell {
    NSInteger section = 0;
    NSInteger row = 0;
    for (NSInteger sec = 0; sec < [self.shadowCellViews count]; sec++) {
        NSArray<HippyShadowView *> *sectionCellRenderObjects = [self.shadowCellViews objectAtIndex:sec];
        for (NSUInteger r = 0; r < [sectionCellRenderObjects count]; r++) {
            HippyShadowView *cellRenderObject = [sectionCellRenderObjects objectAtIndex:r];
            if (cellRenderObject == cell) {
                section = sec;
                row = r;
            }
        }
    }
    return [NSIndexPath indexPathForRow:row inSection:section];
}

- (HippyShadowView *)headerForSection:(NSInteger)section {
    if (_shadowHeaderViews.count > section) {
        id shadowHeader = [_shadowHeaderViews objectAtIndex:section];
        return [shadowHeader isKindOfClass:HippyShadowView.class] ? shadowHeader : nil;
    }
    return nil;
}

- (NSInteger)numberOfSection {
    NSInteger numberOfSection = self.shadowCellViews.count;
    return numberOfSection;
}

- (NSInteger)numberOfCellForSection:(NSInteger)section {
    if (self.shadowCellViews.count > section) {
        return [[self.shadowCellViews objectAtIndex:section] count];
    }
    return 0;
}

- (NSIndexPath *)indexPathForFlatIndex:(NSInteger)index {
    NSInteger sectionIndex = 0;
    NSInteger rowIndex = 0;
    NSInteger selfIncreaseIndex = 0;
    for (NSInteger sec = 0; sec < [self.shadowCellViews count]; sec++) {
        NSArray<HippyShadowView *> *sectionCellRenderObjects = [self.shadowCellViews objectAtIndex:sec];
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
            NSArray<HippyShadowView *> *sectionCellRenderObjects = [self.shadowCellViews objectAtIndex:sec];
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


@end
