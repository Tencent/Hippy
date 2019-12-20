//
//  HippyVirtualTextNode.m
//  HippyText
//
//  Created by pennyli on 2017/10/10.
//  Copyright © 2017年 Facebook. All rights reserved.
//

#import "HippyVirtualTextNode.h"
#import "HippyText.h"

@implementation HippyVirtualTextNode

- (UIView *)createView:(HippyCreateViewForShadow)createBlock insertChildrens:(HippyInsertViewForShadow)insertChildrens
{
	HippyText *textView = (HippyText *)createBlock(self);
	
	NSMutableArray *childrens = [NSMutableArray new];
	for (HippyVirtualNode *node in self.subNodes) {
//		if (![node isKindOfClass:[HippyVirtualTextNode class]]) {
			UIView *view = [node createView: createBlock insertChildrens: insertChildrens];
			if (view) {
				[childrens addObject: view];
			}
//		}
	}
	insertChildrens(textView, childrens);
	
	textView.textFrame = self.textFrame;
	textView.textStorage = self.textStorage;
	textView.extraInfo = self.extraInfo;
    textView.textColor = self.textColor;

	return textView;
}

@end
