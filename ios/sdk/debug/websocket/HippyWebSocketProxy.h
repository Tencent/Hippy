/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "HippyDefines.h"

#if HIPPY_DEV // Only supported in dev mode

#import "HippyWebSocketProxyDelegate.h"

@protocol HippyWebSocketProxy

+ (instancetype)sharedInstance;

- (void)setDelegate:(id<HippyWebSocketProxyDelegate>)delegate forURL:(NSURL *)url;

- (instancetype) init   __attribute__((unavailable("init not available, call sharedInstance instead")));

@end

#endif
