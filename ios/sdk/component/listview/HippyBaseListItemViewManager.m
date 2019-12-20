//
//  HippyBaseListItemViewManager.m
//  QBCommonRNLib
//
//  Created by pennyli on 2018/8/28.
//  Copyright © 2018年 刘海波. All rights reserved.
//

#import "HippyBaseListItemViewManager.h"
#import "HippyBaseListItemView.h"
#import "HippyVirtualNode.h"

@implementation HippyBaseListItemViewManager
HIPPY_EXPORT_MODULE(ListViewItem)

HIPPY_EXPORT_VIEW_PROPERTY(type, NSString)
HIPPY_EXPORT_VIEW_PROPERTY(isSticky, BOOL)

- (UIView *)view
{
	return [HippyBaseListItemView new];
}

- (HippyVirtualNode *)node:(NSNumber *)tag name:(NSString *)name props:(NSDictionary *)props
{
	return [HippyVirtualCell createNode: tag viewName: name props: props];
}


@end
