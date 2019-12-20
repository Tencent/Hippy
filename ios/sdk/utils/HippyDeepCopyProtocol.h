//
//  HippyDeepCopyProtocol.h
//  hippy
//
//  Created by ozonelmy on 2019/9/9.
//  Copyright © 2019 Tencent. All rights reserved.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@protocol HippyDeepCopyProtocol <NSObject>
@required
- (id)deepCopy;
- (id)mutableDeepCopy;
@end

NS_ASSUME_NONNULL_END
