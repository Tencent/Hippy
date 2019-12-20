//
//  HippyImageViewV2.h
//  QBCommonRNLib
//
//  Created by pennyli on 2018/8/21.
//  Copyright © 2018年 Tencent. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "HippyComponent.h"
#import "HippyConvert.h"
#import "HippyAnimatedImageView.h"
#import "HippyMemoryOpt.h"
@class HippyBridge;
@class HippyImageView;
@interface HippyAnimatedImageOperation : NSOperation {
    NSData *_animatedImageData;
    NSString *_url;
    __weak HippyImageView *_imageView;
}

- (id) initWithAnimatedImageData:(NSData *)data imageView:(HippyImageView *)imageView imageURL:(NSString *)url;

@end

typedef NS_ENUM(NSInteger, HippyResizeMode) {
	HippyResizeModeCover = UIViewContentModeScaleAspectFill,
	HippyResizeModeContain = UIViewContentModeScaleAspectFit,
	HippyResizeModeStretch = UIViewContentModeScaleToFill,
	HippyResizeModeCenter = UIViewContentModeCenter,
	HippyResizeModeRepeat = -1, // Use negative values to avoid conflicts with iOS enum values.
};

@interface HippyImageView : HippyAnimatedImageView <NSURLSessionDelegate, HippyMemoryOpt>

@property (nonatomic, assign) CGFloat blurRadius;
@property (nonatomic, assign) UIEdgeInsets capInsets;
@property (nonatomic, assign) HippyResizeMode resizeMode;
@property (nonatomic, copy) NSArray *source;
@property (nonatomic, strong) UIImage *defaultImage;
@property (nonatomic, assign) UIImageRenderingMode renderingMode;
@property (nonatomic, weak) HippyBridge *bridge;

@property (nonatomic, assign) CGFloat borderTopLeftRadius;
@property (nonatomic, assign) CGFloat borderTopRightRadius;
@property (nonatomic, assign) CGFloat borderBottomLeftRadius;
@property (nonatomic, assign) CGFloat borderBottomRightRadius;

@property (nonatomic, copy) HippyDirectEventBlock onLoadStart;
@property (nonatomic, copy) HippyDirectEventBlock onProgress;
@property (nonatomic, copy) HippyDirectEventBlock onError;
@property (nonatomic, copy) HippyDirectEventBlock onLoad;
@property (nonatomic, copy) HippyDirectEventBlock onLoadEnd;

- (instancetype)initWithBridge:(HippyBridge *)bridge NS_DESIGNATED_INITIALIZER;

- (void)reloadImage;

- (void)updateImage:(UIImage *)image;

- (UIImage *) imageFromData:(NSData *)data;
@end

@interface HippyConvert(HippyResizeMode)
+ (HippyResizeMode)HippyResizeMode:(id)json;
@end

