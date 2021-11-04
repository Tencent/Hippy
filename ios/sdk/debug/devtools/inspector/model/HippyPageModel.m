/*!
* iOS SDK
*
* Tencent is pleased to support the open source community by making
* Hippy available.
*
* Copyright (C) 2019 THL A29 Limited, a Tencent company.
* All rights reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

#import "HippyPageModel.h"
#import "HippyLog.h"
#import "HippyUIManager.h"

NSString *const HippyPageKeyFormat = @"format";
NSString *const HippyPageKeyQuality = @"quality";
NSString *const HippyPageKeyMaxWidth = @"maxWidth";
NSString *const HippyPageKeyMaxHeight = @"maxHeight";
NSString *const HippyPageKeyOffsetTop = @"offsetTop";
NSString *const HippyPageKeyPageScaleFactor = @"pageScaleFactor";
NSString *const HippyPageKeyDeviceWidth = @"deviceWidth";
NSString *const HippyPageKeyDeviceHeight = @"deviceHeight";
NSString *const HippyPageKeyScrollOffsetX = @"scrollOffsetX";
NSString *const HippyPageKeyScrollOffsetY = @"scrollOffsetY";
NSString *const HippyPageKeyTimestamp = @"timestamp";
NSString *const HippyPageKeyData = @"data";
NSString *const HippyPageKeyMetaData = @"metadata";
NSString *const HippyPageKeySessionId = @"sessionId";

NSString *const HippyPageImageFormatPNG = @"png";
NSString *const HippyPageImageFormatJPEG = @"jpeg";

@interface HippyPageModel ()

@property (nonatomic, copy) NSString *format;
@property (nonatomic, assign) CGSize maxSize;
@property (nonatomic, assign) NSInteger quality;
@property (nonatomic, assign) NSTimeInterval lastTimestamp;

@end

@implementation HippyPageModel

- (instancetype)init {
    self = [super init];
    if (self) {
        self.maxSize = CGSizeMake(0, 0);
        self.format = HippyPageImageFormatJPEG;
    }
    return self;
}

- (NSDictionary *)startScreenCastWithUIManager:(HippyUIManager *)manager
                                        params:(NSDictionary *)params {
    if (params.count > 0) {
        self.format = [params objectForKey:HippyPageKeyFormat] ? params[HippyPageKeyFormat] : HippyPageImageFormatJPEG;
        self.quality = [params objectForKey:HippyPageKeyQuality] ? [params[HippyPageKeyQuality] integerValue] : 0;
        CGFloat maxWidth = [params objectForKey:HippyPageKeyMaxWidth] ? [params[HippyPageKeyMaxWidth] doubleValue] : 0;
        CGFloat maxHeight = [params objectForKey:HippyPageKeyMaxHeight] ? [params[HippyPageKeyMaxHeight] doubleValue] : 0;
        self.maxSize = CGSizeMake(maxWidth, maxHeight);
    }
    return [self screencastJSONWithManager:manager];
}

- (void)stopScreenCastWithUIManager:(HippyUIManager *)manager {
    // TODO(nolantang): stop frame update listener
}

- (NSDictionary *)screencastFrameAckWithUIManager:(HippyUIManager *)manager
                                           params:(NSDictionary *)params {
    // TODO(nolantang): need update screencast
    return @{};
}

- (NSDictionary *)screencastJSONWithManager:(HippyUIManager *)manager {
    if (!manager) {
        HippyLogWarn(@"PageModel, screen cast, manager is nil");
        return @{};
    }
    UIView *rootView = [manager viewForHippyTag:[manager rootHippyTag]];
    if (!rootView) {
        HippyLogWarn(@"PageModel, screen cast, root view is nil");
        return @{};
    }
    
    CGFloat viewWidth = rootView.frame.size.width;
    CGFloat viewHeight = rootView.frame.size.height;
    CGFloat scale = 1.f;
    if (viewWidth != 0 && viewHeight != 0) {
        CGFloat scaleX = self.maxSize.width / viewWidth;
        CGFloat scaleY = self.maxSize.height / viewHeight;
        scale = MIN(scaleX, scaleY);
    }
    // root view snapshot
    UIGraphicsBeginImageContextWithOptions(rootView.frame.size, YES, scale);
    [rootView drawViewHierarchyInRect:rootView.bounds afterScreenUpdates:YES];
    UIImage *resultImage = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    if (!resultImage) {
        HippyLogWarn(@"PageModel, screen cast, snapshot is nil");
        return @{};
    }
    NSTimeInterval timestamp = [[NSDate date] timeIntervalSince1970];
    NSString *base64String = [self imageToBase64String:resultImage format:self.format];
    NSMutableDictionary *meta = [NSMutableDictionary dictionary];
    meta[HippyPageKeyOffsetTop] = @(0);
    meta[HippyPageKeyPageScaleFactor] = @(1);
    meta[HippyPageKeyDeviceWidth] = @(viewWidth);
    meta[HippyPageKeyDeviceHeight] = @(viewHeight);
    meta[HippyPageKeyScrollOffsetX] = @(0);
    meta[HippyPageKeyScrollOffsetY] = @(0);
    meta[HippyPageKeyTimestamp] = @(timestamp);
    NSMutableDictionary *resultJSON = [NSMutableDictionary dictionary];
    resultJSON[HippyPageKeyData] = base64String != nil ? base64String : @"";
    resultJSON[HippyPageKeyMetaData] = meta;
    resultJSON[HippyPageKeySessionId] = @(timestamp);
    self.lastTimestamp = timestamp;
    return resultJSON;
}

- (NSString *)imageToBase64String:(UIImage *)image
                           format:(NSString *)format {
    if (!image) {
        return @"";
    }
    NSString *resultFormat = format;
    if (resultFormat.length <= 0) {
        resultFormat = HippyPageImageFormatJPEG;
    }
    NSData *imageData = nil;
    if ([resultFormat caseInsensitiveCompare:HippyPageImageFormatJPEG] == NSOrderedSame) {
        imageData = UIImageJPEGRepresentation(image, 0.8f);
    } else if ([resultFormat caseInsensitiveCompare:HippyPageImageFormatPNG] == NSOrderedSame) {
        imageData = UIImagePNGRepresentation(image);
    }
    return [imageData base64EncodedStringWithOptions:NSDataBase64Encoding64CharacterLineLength];
}

@end
