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

NS_ASSUME_NONNULL_BEGIN

/**
 A manager for coordinating V-sync synchronized callbacks.
 Provides thread-safe registration of display link observers with configurable refresh rates.
 */
@interface HippyVsyncManager : NSObject

///-------------------
/// @name Singleton
///-------------------

/**
 Returns the shared vsync manager instance.
 
 @discussion Use this singleton instance to coordinate vsync observers across the application.
 */
+ (instancetype)sharedInstance;

///-------------------
/// @name Registration
///-------------------

/**
 Registers a vsync observer with default 60Hz refresh rate.
 
 @param observer The block to execute on each vsync callback
 @param key A unique identifier for the observer
 
 @discussion Re-registering with the same key will replace the existing observer.
 */
- (void)registerVsyncObserver:(dispatch_block_t)observer forKey:(NSString *)key;

/**
 Registers a vsync observer with custom refresh rate.
 
 @param observer The block to execute on each vsync callback
 @param rate The desired refresh rate in Hz (1-120)
 @param key A unique identifier for the observer
 
 @discussion On iOS versions prior to 15, rates above 60Hz will be capped to 60Hz.
 */
- (void)registerVsyncObserver:(dispatch_block_t)observer rate:(float)rate forKey:(NSString *)key;

/**
 Unregisters and invalidates the vsync observer for the specified key.
 
 @param key The identifier used during registration
 
 @discussion Safe to call even if no observer exists for the key.
 */
- (void)unregisterVsyncObserverForKey:(NSString *)key;

///--------------------
/// @name Restrictions
///--------------------

- (instancetype)init NS_UNAVAILABLE;
+ (instancetype)new NS_UNAVAILABLE;

@end

NS_ASSUME_NONNULL_END

