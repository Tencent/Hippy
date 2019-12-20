//
//  HippyBaseListViewDataSource.m
//  QBCommonRNLib
//
//  Created by pennyli on 2018/4/16.
//  Copyright © 2018年 Tencent. All rights reserved.
//

#import "HippyBaseListViewDataSource.h"

@implementation HippyBaseListViewDataSource {
	NSMutableArray *_sections;
}

- (instancetype)init
{
	if (self = [super init]) {
		_sections = [NSMutableArray new];
	}
	return self;
}

- (void)setDataSource:(NSArray <HippyVirtualCell *> *)dataSource
{
	NSMutableArray *sections = [NSMutableArray new];
	NSMutableArray *lastSection = [NSMutableArray new];
	HippyVirtualCell * lastStickyCell = nil;
	NSInteger index = 0;
	for (HippyVirtualCell *cell in dataSource) {
		if (cell.sticky) {
			
			if (lastSection.count == 0) {
				lastStickyCell = cell;
			} else {
				if (lastStickyCell)
					[sections addObject: @{@"cell": lastSection, @"header": lastStickyCell}];
				else {
					[sections addObject: @{@"cell": lastSection}];
				}
				lastSection = [NSMutableArray array];
				lastStickyCell = cell;
			}
		} else {
			[lastSection addObject: cell];
		}
		
		if (index == dataSource.count - 1 && lastStickyCell != nil) {
			[sections addObject: @{@"cell": lastSection, @"header": lastStickyCell}];
		}
		
		index++;
	}
	
	if (sections.count == 0 && lastSection.count != 0) {
		[sections addObject: @{@"cell": lastSection}];
	}
	
	_sections = sections;
}

- (HippyVirtualCell *)cellForIndexPath:(NSIndexPath *)indexPath
{
	if (_sections.count > indexPath.section) {
		NSArray *cells = _sections[indexPath.section][@"cell"];
		if (cells.count > indexPath.row) {
			return (HippyVirtualCell *)cells[indexPath.row];
		}
	}
	return nil;
}

//FIXME: 这个地方默认section只有一个，否则row应该在单次循环后置0。目前ListView暂时不支持多section
- (NSIndexPath *)indexPathOfCell:(HippyVirtualCell *)cell
{
	NSInteger section = 0;
	NSInteger row = 0;
	for (NSDictionary *sec in _sections) {
		NSArray *cells = sec[@"cell"];
		for (HippyVirtualCell *node in cells) {
			if ([node isEqual: cell]) {
				break;
			}
			row++;
		}
		if (row != cells.count) {
			break;
		}
		section++;
	}
	
	if (section == _sections.count) {
		return nil;
	}
	return [NSIndexPath indexPathForRow: row inSection: section];
}

- (HippyVirtualCell *)headerForSection:(NSInteger)section
{
	if (_sections.count > section) {
		HippyVirtualCell *header = _sections[section][@"header"];
		return header;
	}
	return nil;
}

- (NSInteger)numberOfSection
{
	return _sections.count;
}

- (NSInteger)numberOfCellForSection:(NSInteger)section
{
	if (_sections.count > section) {
		NSArray *cells = _sections[section][@"cell"];
		return cells.count;
	}
	return 0;
}

- (NSIndexPath *)indexPathForFlatIndex:(NSInteger)index
{
	NSInteger totalIndex = 0;
	NSInteger sectionIndex = 0;
	NSInteger rowIndex = 0;
	NSIndexPath *indexPath = nil;
	
	for (NSDictionary *section in _sections) {
		rowIndex = 0;
		if (index == totalIndex) {
			indexPath = [NSIndexPath indexPathForRow: 0 inSection: sectionIndex];
			break;
		}
		totalIndex += section[@"header"] == nil ? 0 : 1;
		
		NSArray *cells = section[@"cell"];
		for (__unused HippyVirtualCell *node in cells) {
			if (totalIndex == index) {
				indexPath = [NSIndexPath indexPathForRow: rowIndex inSection: sectionIndex];
				break;
			}
			rowIndex++;
			totalIndex++;
		}
		
		sectionIndex++;
	}
	
	return indexPath;
}


@end
