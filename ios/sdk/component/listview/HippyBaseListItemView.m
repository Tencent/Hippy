//
//  HippyBaseListItemView.m
//  QBCommonRNLib
//
//  Created by pennyli on 2018/8/28.
//  Copyright © 2018年 刘海波. All rights reserved.
//

#import "HippyBaseListItemView.h"
#import "UIView+React.h"

@implementation HippyBaseListItemView

- (void)hippySetFrame:(CGRect)frame
{
	[super hippySetFrame: frame];
	self.frame = self.bounds;
}

@end
