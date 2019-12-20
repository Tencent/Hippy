//
//  HippyBaseListViewDataSource.h
//  QBCommonRNLib
//
//  Created by pennyli on 2018/4/16.
//  Copyright © 2018年 Tencent. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "HippyVirtualNode.h"

@interface HippyBaseListViewDataSource : NSObject

- (void)setDataSource:(NSArray <HippyVirtualCell *> *)dataSource;
- (HippyVirtualCell *)cellForIndexPath:(NSIndexPath *)indexPath;
- (HippyVirtualCell *)headerForSection:(NSInteger)section;
- (NSInteger)numberOfSection;
- (NSInteger)numberOfCellForSection:(NSInteger)section;
- (NSIndexPath *)indexPathOfCell:(HippyVirtualCell *)cell;
- (NSIndexPath *)indexPathForFlatIndex:(NSInteger)index;

@end
