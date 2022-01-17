//
//  HippyDevInfo.h
//  HippyDemo
//
//  Created by  nolantang on 2022/1/12.
//  Copyright © 2022 tencent. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface HippyDevInfo : NSObject

@property (nonatomic, copy) NSString *scheme;
@property (nonatomic, copy) NSString *ipAddress;
@property (nonatomic, copy) NSString *port;
@property (nonatomic, copy) NSString *versionId;

- (void)setScheme:(NSString *)scheme;

@end
