//
//  x5LayoutUtil.c
//  Hippy
//
//  Created by mengyanluo on 2018/7/30.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import "x5LayoutUtil.h"

static void x5ExecuteOnMainThread(dispatch_block_t block, BOOL sync)
{
    if ([NSThread mainThread]) {
        block();
    } else if (sync) {
        dispatch_sync(dispatch_get_main_queue(), ^{
            block();
        });
    } else {
        dispatch_async(dispatch_get_main_queue(), ^{
            block();
        });
    }
}

static CGFloat x5ScreenScale()
{
    static CGFloat scale;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        x5ExecuteOnMainThread(^{
            scale = [UIScreen mainScreen].scale;
        }, YES);
    });
    
    return scale;
}

CGFloat x5CeilPixelValue(CGFloat value)
{
    CGFloat scale = x5ScreenScale();
    return ceil(value * scale) / scale;
}

CGFloat x5RoundPixelValue(CGFloat value)
{
    CGFloat scale = x5ScreenScale();
    return round(value * scale) / scale;
}
