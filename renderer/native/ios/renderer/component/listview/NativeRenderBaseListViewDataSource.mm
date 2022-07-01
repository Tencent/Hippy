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

@interface NativeRenderBaseListViewDataSource () {
    NSMutableArray *_headerRenderObjects;
    NSMutableArray<NSMutableArray<NativeRenderObjectView *> *> *_cellRenderObjects;
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
    _cellRenderObjects = cellRenderObjects;
}

- (NativeRenderObjectView *)cellForIndexPath:(NSIndexPath *)indexPath {
    if (_cellRenderObjects.count > indexPath.section) {
        NSArray<NativeRenderObjectView *> *sectionCellRenderObject = [_cellRenderObjects objectAtIndex:indexPath.section];
        if (sectionCellRenderObject.count > indexPath.row) {
            return [sectionCellRenderObject objectAtIndex:indexPath.row];
        }
    }
    return nil;
}

- (NSIndexPath *)indexPathOfCell:(NativeRenderObjectView *)cell {
    NSInteger section = 0;
    NSInteger row = 0;
    for (NSInteger sec = 0; sec < [_cellRenderObjects count]; sec++) {
        NSArray<NativeRenderObjectView *> *sectionCellRenderObjects = [_cellRenderObjects objectAtIndex:sec];
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
    return _cellRenderObjects.count;
}

- (NSInteger)numberOfCellForSection:(NSInteger)section {
    if (_cellRenderObjects.count > section) {
        return [[_cellRenderObjects objectAtIndex:section] count];
    }
    return 0;
}

- (NSIndexPath *)indexPathForFlatIndex:(NSInteger)index {
    NSInteger sectionIndex = 0;
    NSInteger rowIndex = 0;
    NSInteger selfIncreaseIndex = 0;
    for (NSInteger sec = 0; sec < [_cellRenderObjects count]; sec++) {
        NSArray<NativeRenderObjectView *> *sectionCellRenderObjects = [_cellRenderObjects objectAtIndex:sec];
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
            NSArray<NativeRenderObjectView *> *sectionCellRenderObjects = [_cellRenderObjects objectAtIndex:sec];
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
