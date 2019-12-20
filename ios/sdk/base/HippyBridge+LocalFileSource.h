//
//  HippyBridge+LocalFileSource.h
//  Hippy
//
//  Created by mengyanluo on 2018/9/25.
//  Copyright © 2018年 Tencent. All rights reserved.
//

#import "HippyBridge.h"

NS_ASSUME_NONNULL_BEGIN

extern NSErrorDomain const HippyLocalFileReadErrorDomain;
extern NSInteger HippyLocalFileNOFilExist;

@interface HippyBridge (LocalFileSource)

@property (nonatomic, copy) NSString *workFolder;

+ (BOOL) isHippyLocalFileURLString:(NSString *)string;

- (NSString *)absoluteStringFromHippyLocalFileURLString:(NSString *)string;
@end

NS_ASSUME_NONNULL_END
