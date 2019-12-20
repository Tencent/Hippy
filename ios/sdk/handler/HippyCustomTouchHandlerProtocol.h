//
//  HippyCustomTouchHandler.h
//  hippy
//
//  Created by 万致远 on 2019/6/19.
//  Copyright © 2019 Tencent. All rights reserved.
//

#import "HippyBridgeModule.h"
#import <Foundation/Foundation.h>


@protocol HippyCustomTouchHandlerProtocol<HippyBridgeModule>

//@required
//
//- (void)imageView:(HippyImageView *)imageView
//        loadAtUrl:(NSURL *)url
// placeholderImage:(UIImage *)placeholderImage
//          context:(void *)context
//         progress:(void (^)(long long, long long))progressBlock
//        completed:(void (^)(NSData *, NSURL *, NSError *))completedBlock;
//
//- (void)cancelImageDownload:(UIImageView *)imageView withUrl:(NSURL *)url;

@optional
- (BOOL)customTouchesBegan:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event;

- (BOOL)customTouchesMoved:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event;

- (BOOL)customTouchesEnded:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event;

- (BOOL)customTouchesCancelled:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event;

- (BOOL)customReset;

@end
