/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "HippyDefines.h"

#if HIPPY_DEV // Debug executors are only supported in dev mode

#import "HippyJavaScriptExecutor.h"

@interface HippyWebSocketExecutor : NSObject <HippyJavaScriptExecutor>

- (instancetype)initWithURL:(NSURL *)URL;

@end

#endif
