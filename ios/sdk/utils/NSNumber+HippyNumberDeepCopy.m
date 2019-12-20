//
//  NSNumber+HippyNumberDeepCopy.m
//  hippy
//
//  Created by ozonelmy on 2019/9/9.
//  Copyright © 2019 Tencent. All rights reserved.
//

#import "NSNumber+HippyNumberDeepCopy.h"

@implementation NSNumber (HippyNumberDeepCopy)
- (id)deepCopy {
    return self;
}

- (id)mutableDeepCopy {
    return self;
}
@end
