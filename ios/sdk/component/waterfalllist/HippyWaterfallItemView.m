//
//  HippyWaterfallItemView.m
//  HippyDemo
//
//  Created by Ricardo on 2021/1/19.
//  Copyright © 2021 tencent. All rights reserved.
//

#import "HippyWaterfallItemView.h"
#import "UIView+Hippy.h"

@implementation HippyWaterfallItemView

- (instancetype)initWithFrame:(CGRect)frame {
    if (self = [super initWithFrame:frame]) {
        self.clipsToBounds = YES;
    }
    return self;
}

- (void)hippySetFrame:(CGRect)frame;
{
    [super hippySetFrame:frame];
    self.frame = self.bounds;
}

@end
