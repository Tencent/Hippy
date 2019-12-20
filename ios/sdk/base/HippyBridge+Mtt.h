//
//  HippyBridge+Mtt.h
//  mtt
//
//  Created by halehuang(黄灏涛) on 2017/2/16.
//  Copyright © 2017年 Tencent. All rights reserved.
//

#import "HippyBridge.h"

extern NSString *const HippySecondaryBundleDidStartLoadNotification;
extern NSString *const HippySecondaryBundleDidLoadSourceCodeNotification;
extern NSString *const HippySecondaryBundleDidLoadNotification;

typedef void(^SecondaryBundleLoadingCompletion)(NSError *);
typedef void(^SecondaryBundleCompletion)(BOOL);

@interface HippyBridge (Mtt)

- (BOOL)isSecondaryBundleURLLoaded:(NSURL *)secondaryBundleURL;

- (void)loadSecondary:(NSURL *)secondaryBundleURL loadBundleCompletion:(SecondaryBundleLoadingCompletion)loadBundleCompletion enqueueScriptCompletion:(SecondaryBundleLoadingCompletion)enqueueScriptCompletion completion:(SecondaryBundleCompletion)completion;

@end
