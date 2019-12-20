/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "HippyRootView.h"

/**
 * The interface provides a set of functions that allow other internal framework
 * classes to change the HippyRootViews's internal state.
 */
@interface HippyRootView ()

/**
 * This setter should be used only by HippyUIManager on hippy root view size update.
 */
@property (readwrite, nonatomic, assign) CGSize intrinsicSize;

@end
