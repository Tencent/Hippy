/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "HippyBridgeModule.h"
#import "HippyInvalidating.h"

/**
 * A simple, asynchronous, persistent, key-value storage system designed as a
 * backend to the AsyncStorage JS module, which is modeled after LocalStorage.
 *
 * Current implementation stores small values in serialized dictionary and
 * larger values in separate files. Since we use a serial file queue
 * `RKFileQueue`, reading/writing from multiple threads should be perceived as
 * being atomic, unless someone bypasses the `HippyAsyncLocalStorage` API.
 *
 * Keys and values must always be strings or an error is returned.
 */
extern NSString *const HippyStorageDirectory;
@interface HippyAsyncLocalStorage : NSObject <HippyBridgeModule,HippyInvalidating>

@property (nonatomic, assign) BOOL clearOnInvalidate;

@property (nonatomic, readonly, getter=isValid) BOOL valid;

// Clear the HippyAsyncLocalStorage data from native code
+ (void)clearAllData;

- (NSString *) HippyGetStorageDirectory;
@end
