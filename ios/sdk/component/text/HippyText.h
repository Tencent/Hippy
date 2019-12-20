/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import <UIKit/UIKit.h>

@interface HippyText : UIView {
@protected
    NSTextStorage *_textStorage;
    CAShapeLayer *_highlightLayer;
}

@property (nonatomic, assign) UIEdgeInsets contentInset;
@property (nonatomic, strong) NSTextStorage *textStorage;
@property (nonatomic, assign) CGRect textFrame;
@property (nonatomic, assign) CGColorRef borderColor;
@property (nonatomic, strong) UIColor *textColor;

@property (nonatomic, strong) NSString *backgroundImageUrl;
@property (nonatomic, assign) CGFloat backgroundPositionX;
@property (nonatomic, assign) CGFloat backgroundPositionY;

@property (nonatomic, copy) NSDictionary *extraInfo;

@end
