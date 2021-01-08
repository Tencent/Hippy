//
//  HippyListTableView.m
//  HippyDemo
//
//  Created by ozonelmy on 2021/1/6.
//  Copyright © 2021 tencent. All rights reserved.
//

#import "HippyListTableView.h"

@implementation HippyListTableView

- (void)layoutSubviews {
    [super layoutSubviews];
    if ([_layoutDelegate respondsToSelector:@selector(tableViewDidLayoutSubviews:)]) {
        [_layoutDelegate tableViewDidLayoutSubviews:self];
    }
}

@end
