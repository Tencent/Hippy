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

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

typedef NS_ENUM(NSUInteger, DriverType) {
    DriverTypeReact,
    DriverTypeVue2,
    DriverTypeVue3
};

typedef NS_ENUM(NSUInteger, RenderType) {
    RenderTypeNative,
};

@class HippyBridge, HippyRootView;
@class HippyPageCacheManager, HippyPageCache;

@protocol HippyPageCacheManagerObserverProtocol <NSObject>

@required
- (void)pageCacheManager:(HippyPageCacheManager *)pageCacheManager
         didAddPageCache:(HippyPageCache *)pageCache;

- (void)pageCacheManager:(HippyPageCacheManager *)pageCacheManager
     willRemovePageCache:(HippyPageCache *)pageCache
                 atIndex:(NSUInteger)index;

- (void)pageCacheManager:(HippyPageCacheManager *)pageCacheManager
      didUpdatePageCache:(HippyPageCache *)pageCache
                 atIndex:(NSUInteger)index;

@end

@interface HippyPageCache : NSObject

@property(nonatomic, strong) HippyBridge *hippyBridge;
@property(nonatomic, strong) HippyRootView *rootView;
@property(nonatomic, strong, nullable) UIImage *snapshot;

@property(nonatomic, assign) DriverType driverType;
@property(nonatomic, assign) RenderType renderType;
@property(nonatomic, strong, nullable) NSURL *debugURL;
@property(nonatomic, assign, getter=isDebugMode) BOOL debugMode;

@end

@interface HippyPageCacheManager : NSObject

@property(nonatomic, copy, readonly) NSArray<HippyPageCache *> *pageCaches;

+ (instancetype)defaultPageCacheManager;

- (void)addPageCache:(HippyPageCache *)cache;

- (void)removePageCache:(HippyPageCache *)cache;

- (void)removePageCacheAtIndex:(NSUInteger)index;

- (void)removeAllPageCaches;

- (HippyPageCache *)pageCacheAtIndex:(NSUInteger)index;

- (void)addObserver:(id<HippyPageCacheManagerObserverProtocol>)observer;

- (void)removeObserver:(id<HippyPageCacheManagerObserverProtocol>)observer;

@end

NS_ASSUME_NONNULL_END
