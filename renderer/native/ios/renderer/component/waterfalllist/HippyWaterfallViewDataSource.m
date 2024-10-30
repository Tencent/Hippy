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

#import "HippyWaterfallViewDataSource.h"
#import "HippyAssert.h"
#import "HippyShadowView.h"
#import "HippyShadowListView.h"
#import "HippyHeaderRefreshManager.h"

@interface HippyWaterfallViewDataSource () {
    BOOL _containBannerView;
    HippyShadowView *_headerView;
    HippyShadowWaterfallItem *_footerView;
    NSString *_itemViewName;
}

@end

@implementation HippyWaterfallViewDataSource

- (instancetype)initWithDataSource:(NSArray<__kindof HippyShadowView *> *)dataSource
                      itemViewName:(NSString *)itemViewName
                 containBannerView:(BOOL)containBannerView {
    self = [super init];
    if (self) {
        _itemViewName = itemViewName;
        [self setDataSource:dataSource containBannerView:containBannerView];
    }
    return self;
}

- (id)copyWithZone:(nullable NSZone *)zone {
    HippyWaterfallViewDataSource *dataSource = [[[self class] allocWithZone:zone] init];
    dataSource->_containBannerView = self.containBannerView;
    dataSource->_headerView = _headerView;
    NSMutableArray<NSArray<HippyShadowView *> *> *objectSectionViews = [NSMutableArray arrayWithCapacity:[_shadowCellViews count]];
    for (NSArray<HippyShadowView *> *objects in _shadowCellViews) {
        NSArray<HippyShadowView *> *copiedObjects = [objects copy];
        [objectSectionViews addObject:copiedObjects];
    }
    dataSource->_shadowCellViews = [objectSectionViews copy];
    dataSource->_itemViewName = [self.itemViewName copy];
    return dataSource;
}

- (void)setDataSource:(NSArray<HippyShadowView *> *)dataSource containBannerView:(BOOL)containBannerView {
    _containBannerView = containBannerView;
    if ([dataSource count] > 0) {
        // find all cell item and header/footer in a loop
        NSString *waterfallItemViewName = self.itemViewName;
        NSMutableArray *cellItems = [NSMutableArray arrayWithCapacity:dataSource.count];
        for (int i = 0; i < dataSource.count; i++) {
            HippyShadowView *shadowView = [dataSource objectAtIndex:i];
            if ([shadowView.viewName isEqualToString:waterfallItemViewName]) {
                HippyShadowWaterfallItem *item = (HippyShadowWaterfallItem *)shadowView;
                if ([item isHeader]) {
                    _headerView = item;
                    _containBannerView = YES;
                } else if ([item isFooter]) {
                    _footerView = item;
                } else {
                    [cellItems addObject:item];
                }
            }
        }
        
        if (cellItems.count > 0) {
            _shadowCellViews = [NSArray arrayWithObject:cellItems];
        } else {
            _shadowCellViews = nil;
        }
        
        if (containBannerView && !_headerView) {
            // find the first shadowView that is not pull header or pull footer
            // Old logic and is deprecated, keep it for some time to ensure js compatibility
            // As of version 3.3.2, use the `isHeader` attribute to determine whether it is banner.
            for (int i = 0; i < dataSource.count; i++) {
                HippyShadowView *subShadowView = [dataSource objectAtIndex:i];
                if ([subShadowView.viewName isEqualToString:HippyHeaderRefreshManager.moduleName]) {
                    continue;
                } else {
                    _headerView = subShadowView;
                    break;
                }
            }
        }
    }
}

#pragma mark - Getters

- (NSArray<NSArray<HippyShadowView *> *> *)shadowCellViews {
    return [_shadowCellViews copy];
}

- (HippyShadowView *)cellForIndexPath:(NSIndexPath *)indexPath {
    return [[_shadowCellViews firstObject] objectAtIndex:[indexPath row]];
}

- (HippyShadowView *)headerForSection:(NSInteger)section {
    return _headerView;
}

- (HippyShadowView *)footerForSection:(NSInteger)section {
    return _footerView;
}

- (NSInteger)numberOfSection {
    NSInteger count = [[_shadowCellViews firstObject] count] ? 1 : 0;
    return count;
}

- (NSInteger)numberOfCellForSection:(NSInteger)section {
    return [[_shadowCellViews firstObject] count];
}

- (NSIndexPath *)indexPathOfCell:(HippyShadowView *)cell {
    NSInteger section = 0;
    NSInteger row = [[_shadowCellViews firstObject] indexOfObject:cell];
    return [NSIndexPath indexPathForRow:row inSection:section];
}

- (NSIndexPath *)indexPathForFlatIndex:(NSInteger)index {
    NSInteger section = 0;
    return [NSIndexPath indexPathForRow:index inSection:section];
}

- (NSInteger)flatIndexForIndexPath:(NSIndexPath *)indexPath {
    return [indexPath row];
}


@end
