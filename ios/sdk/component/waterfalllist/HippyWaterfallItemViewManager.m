//
//  HippyWaterfallItemViewManager.m
//  HippyDemo
//
//  Created by Ricardo on 2021/1/19.
//  Copyright © 2021 tencent. All rights reserved.
//

#import "HippyWaterfallItemViewManager.h"
#import "HippyWaterfallItemView.h"
#import "HippyVirtualNode.h"

@implementation HippyWaterfallItemViewManager

HIPPY_EXPORT_MODULE(WaterfallItem)

- (UIView *)view {
    return [HippyWaterfallItemView new];
}

- (HippyVirtualNode *)node:(NSNumber *)tag name:(NSString *)name props:(NSDictionary *)props {
    return [HippyVirtualCell createNode:tag viewName:name props:props];
}

@end
