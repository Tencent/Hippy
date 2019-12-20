//
//  HPAnimationGroup.h
//  HippyNative
//
//  Created by pennyli on 2017/12/26.
//  Copyright © 2017年 pennyli. All rights reserved.
//

#import "HippyExtAnimation.h"

@interface HippyExtAnimationGroup : HippyExtAnimation

@property (nonatomic, strong) NSArray<HippyExtAnimation *> *animations;
//这个参数表明这个动画组只是为了时序管理，并不真正绑定在某个view上
@property (nonatomic, assign) BOOL virtualAnimation;
@end
