//
//  HippyHeaderRefresh.h
//  QBCommonRNLib
//
//  Created by ozonelmy on 2020/3/8.
//  Copyright © 2020 Tencent. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "HippyRefresh.h"
#import "HippyComponent.h"

@interface HippyHeaderRefresh : HippyRefresh

@property(nonatomic, copy) HippyDirectEventBlock onHeaderReleased;
@property(nonatomic, copy) HippyDirectEventBlock onHeaderPulling;

@end
