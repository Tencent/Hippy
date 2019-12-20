//
//  HippyBackgroundImageCacheManager.m
//  QBCommonRNLib
//
//  Created by 万致远 on 2018/8/28.
//  Copyright © 2018年 刘海波. All rights reserved.
//

#import "HippyBackgroundImageCacheManager.h"
#import "HippyUtils.h"
@interface HippyBackgroundImageCacheManager()
  //子图缓存          < key = base64(uri), value = < key = @(frame), value = Image > >
  @property(strong, atomic) NSMutableDictionary<NSString *, NSMutableDictionary *> *subImageCache;
  //原图缓存          < key = base64(uri), value = Image >
  @property(strong, atomic) NSMutableDictionary<NSString *, UIImage *> *originImageCache;
  //原图缓存引用计数    < key = base64(uri), value = Set(hippyTag) >
  @property(strong, atomic) NSMutableDictionary<NSString *, NSMutableSet<NSNumber *> *> *originCacheReferenceCount;

  @property(strong, nonatomic) NSError *defaultError;


@end

@implementation HippyBackgroundImageCacheManager


+ (HippyBackgroundImageCacheManager *)sharedInstance {
  static dispatch_once_t once;
  static HippyBackgroundImageCacheManager * __singleton__;
  dispatch_once( &once, ^{ __singleton__ = [[HippyBackgroundImageCacheManager alloc] init]; } );
  return __singleton__;
}

- (instancetype)init {
  self = [super init];
  if (self) {
    //懒加载
    self.subImageCache = [NSMutableDictionary new];
    self.originImageCache = [NSMutableDictionary new];
    self.originCacheReferenceCount = [NSMutableDictionary new];
  }
  return self;
}

//剪裁图片
- (UIImage*)imageByCroppingWithImage:(UIImage *)image
                               frame:(CGRect)destinationFrame {
  CGFloat scale = [UIScreen mainScreen].scale;
  CGFloat ptX = destinationFrame.origin.x * scale;
  CGFloat ptY = destinationFrame.origin.y * scale;
  CGFloat ptWidth = CGRectGetWidth(destinationFrame) * scale;
  CGFloat ptHeight = CGRectGetHeight(destinationFrame) * scale;
  CGRect ptFrame = CGRectMake(ptX, ptY, ptWidth, ptHeight);
  CGImageRef imageRef = image.CGImage;
  CGImageRef imagePartRef = CGImageCreateWithImageInRect(imageRef, ptFrame);
  UIImage *cropImage = [UIImage imageWithCGImage:imagePartRef scale:image.scale orientation:image.imageOrientation];
  CGImageRelease(imagePartRef);
  
  return cropImage;
}

- (NSError *)defaultError {
  if (_defaultError) {
    _defaultError = [NSError errorWithDomain:NSURLErrorDomain code:NSURLErrorUnknown userInfo:@{@"error":@"error in [HippyBackgroundImageCacheManager imageWithUri: frame: handler:"}];
  }
  return _defaultError;
}

- (void)imageWithUrl:(NSString *)uri
               frame:(CGRect)frame
            hippyTag:(NSNumber *)hippyTag
             handler:(HippyBackgroundImageCompletionHandler)completionHandler {
  if (frame.size.height == 0 || frame.size.width == 0) {
    completionHandler(nil, nil);
    return;
  }
  HippyAssert(uri != nil, @"url不可为nil");
  HippyAssert(hippyTag != nil, @"hippyTag不可为nil");
  UIImage *destinationImage = nil;
  NSString *uriKey = [NSString stringWithFormat:@"%lu",(unsigned long)uri.hash];
  
  //所取子图有缓存
  destinationImage = [self readImageFromCacheWithUrl:uri frame:frame hippyTag:hippyTag];
  if (destinationImage) {
    completionHandler(destinationImage, nil);
    return;
  }
  
  //剪裁原图并将子图存入cache
  UIImage* (^cropImageAndStore)(UIImage *) = ^(UIImage *originImage) {
    //croppedFrame.size是pt
    //originImage.size也是pt
    CGRect croppedFrame = frame;
    //裁剪范围不可大于原图范围
    if (originImage.size.width < croppedFrame.size.width) {
      croppedFrame.size.width = originImage.size.width;
    }
    if (originImage.size.height < croppedFrame.size.height) {
      croppedFrame.size.height = originImage.size.height;
    }
    
    UIImage* croppedImage = nil;
    croppedImage = [self imageByCroppingWithImage:originImage frame:croppedFrame];
    if (croppedImage) {
      [self saveImageToCache:croppedImage uri:uri frame:croppedFrame hippyTag:hippyTag];
    }
    return croppedImage;
  };
  
  //看原图是否有缓存
  //有缓存
  UIImage *originImage = self.originImageCache[uriKey];
  if (originImage) {
    UIImage* destinationImage = cropImageAndStore(originImage);
    completionHandler(destinationImage, destinationImage ? nil : self.defaultError);
    return;
  }
  
  //无缓存
  dispatch_semaphore_t semaphore = dispatch_semaphore_create(0); //创建信号量
  if ([uri hasPrefix:@"http://"] || [uri hasPrefix:@"https://"]) {
    //uri是http类型
    NSURL *requestUrl = HippyURLWithString(uri, NULL);
    if (!requestUrl) {
      completionHandler(nil, self.defaultError);
      return;
    }
    
    NSURLRequest *request = [NSURLRequest requestWithURL:requestUrl cachePolicy:NSURLRequestUseProtocolCachePolicy timeoutInterval:10];
    NSURLSession *session=[NSURLSession sharedSession];
    NSURLSessionDataTask *dataTask=[session dataTaskWithRequest:request completionHandler:^(NSData * _Nullable data, NSURLResponse * _Nullable response, NSError * _Nullable error) {
      CGFloat scale = [UIScreen mainScreen].scale;
      UIImage *originImage = [UIImage imageWithData:data scale:scale];
      if (!originImage) {
        completionHandler(nil, self.defaultError);
        dispatch_semaphore_signal(semaphore);   //发送信号
      }
      [self saveOriginImageToCache:originImage uri:uri];
      UIImage *destinationImage = cropImageAndStore(originImage);
      completionHandler(destinationImage, destinationImage ? nil : self.defaultError);
      
      
      dispatch_semaphore_signal(semaphore);   //发送信号
    }];
    
    //5.执行任务
    [dataTask resume];
    dispatch_semaphore_wait(semaphore,DISPATCH_TIME_FOREVER);  //等待
    return;
    
  } else if ([uri hasPrefix:@"data:image/"]) {
    //uri是base64类型
    //NSNotFound=9223372036854775807
    NSInteger fromIndex = NSMaxRange([uri rangeOfString:@"base64"]);
    if (fromIndex >= uri.length) {
      completionHandler(nil, self.defaultError);
      return;
    }
    NSString *base64ImageDataString = [uri substringFromIndex: fromIndex];
    // 将base64字符串转为NSData
    NSData *decodeData = [[NSData alloc] initWithBase64EncodedString:base64ImageDataString options:(NSDataBase64DecodingIgnoreUnknownCharacters)];
    // 将NSData转为原图并存入cache
    if (!decodeData) {
      completionHandler(nil, self.defaultError);
      return;
    }
    originImage = [UIImage imageWithData:decodeData scale:[UIScreen mainScreen].scale];
    [self saveOriginImageToCache:originImage uri:uri];
    UIImage* destinationImage = cropImageAndStore(originImage);
    completionHandler(destinationImage, destinationImage ? nil : self.defaultError);
    return;
  }
  //未知类型
  completionHandler(nil, self.defaultError);
  
}

//释放
- (void)releaseBackgroundImageCacheWithUrl:(NSString *)uri
                                     frame:(CGRect)frame
                                  hippyTag:(NSNumber *)hippyTag
{
  HippyAssert(uri != nil, @"url不可为nil");
  HippyAssert(hippyTag != nil, @"hippyTag不可为nil");
  //减少引用计数
  NSString *uriKey = [NSString stringWithFormat:@"%lu", (unsigned long)uri.hash];
  NSMutableSet<NSNumber *> *set = self.originCacheReferenceCount[uriKey];
  if (set) {
    [set removeObject:hippyTag];
    //检查缓存,清除缓存
    NSInteger count = set.allObjects.count;
    if (count == 0) {
      [self.subImageCache removeObjectForKey:uriKey];
      [self.originImageCache removeObjectForKey:uriKey];
      [self.originCacheReferenceCount removeObjectForKey:uriKey];
    }
  }
}

//储存原图
- (void)saveOriginImageToCache:(UIImage *)image
                          uri:(NSString *)uri
{
  HippyAssert(uri != nil, @"url不可为nil");
  HippyAssert(image != nil, @"image不可为nil");
  NSString *uriKey = [NSString stringWithFormat:@"%lu", (unsigned long)uri.hash];
  self.originImageCache[uriKey] = image;
  self.originCacheReferenceCount[uriKey] = [NSMutableSet new];
}

//储存子图
- (void)saveImageToCache:(UIImage *)image
                     uri:(NSString *)uri
                   frame:(CGRect)frame
                hippyTag:(NSNumber *)hippyTag
{
  HippyAssert(uri != nil, @"url不可为nil");
  HippyAssert(image != nil, @"image不可为nil");
  HippyAssert(hippyTag != nil, @"hippyTag不可为nil");
  NSString *uriKey = [NSString stringWithFormat:@"%lu", (unsigned long)uri.hash];
  //初始化图片缓存
  NSMutableDictionary<NSValue *, UIImage *> *cacheOfTheImage = self.subImageCache[uriKey];
  if (!cacheOfTheImage) {
    self.subImageCache[uriKey] = [NSMutableDictionary new];
    cacheOfTheImage = self.subImageCache[uriKey];
  }
  //保存缓存
  cacheOfTheImage[@(frame)] = image;
  //插入引用set
  [self.originCacheReferenceCount[uriKey] addObject:hippyTag];
}



//取出子图
- (UIImage *)readImageFromCacheWithUrl:(NSString *)uri
                                frame:(CGRect)frame
                            hippyTag:(NSNumber *)hippyTag {
    HippyAssert(uri != nil, @"url不可为nil");
    NSString *uriKey = [NSString stringWithFormat:@"%lu", (unsigned long)uri.hash];
    if (!self.subImageCache[uriKey]) {
      return nil;
    }
    //取出图片缓存
    NSMutableDictionary<NSValue *, UIImage *> *cacheOfTheImage = self.subImageCache[uriKey];
    UIImage *image = cacheOfTheImage[@(frame)];
    if (!image) {
      return nil;
    }
    
    //插入引用set
    [self.originCacheReferenceCount[uriKey] addObject:hippyTag];
    return image;
}

@end
