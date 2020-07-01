//
//  HippyFooterRefresh.h
//  QBCommonRNLib
//
//  Created by ozonelmy on 2020/3/9.
//  Copyright © 2020 Tencent. All rights reserved.
//

#import "HippyRefresh.h"

@interface HippyFooterRefresh : HippyRefresh

@property (nonatomic, assign) BOOL refreshStick;
@property(nonatomic, copy) HippyDirectEventBlock onFooterReleased;
@property(nonatomic, copy) HippyDirectEventBlock onFooterPulling;

@end
