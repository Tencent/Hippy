//
//  HippyImageViewV2CustomLoader.h
//  QBCommonRNLib
//
//  Created by pennyli on 2018/8/21.
//  Copyright © 2018年 刘海波. All rights reserved.
//


#import "HippyBridgeModule.h"
@class HippyImageView;

@protocol HippyImageViewCustomLoader<HippyBridgeModule>

@required

- (void)imageView:(HippyImageView *)imageView
		loadAtUrl:(NSURL *)url
 placeholderImage:(UIImage *)placeholderImage
		  context:(void *)context
		 progress:(void (^)(long long, long long))progressBlock
		completed:(void (^)(NSData *, NSURL *, NSError *))completedBlock;

- (void)cancelImageDownload:(UIImageView *)imageView withUrl:(NSURL *)url;

@optional
- (void)test;
@end
