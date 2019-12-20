/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "HippyBridgeModule.h"

@interface HippyDevLoadingView : NSObject <HippyBridgeModule>

+ (void)setEnabled:(BOOL)enabled;
- (void)updateProgress:(HippyLoadingProgress *)progress;

@end
