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

/**
 Copyright (c) 2014-present, Facebook, Inc.
 All rights reserved.
 
 This source code is licensed under the BSD-style license found in the
 LICENSE file in the root directory of this source tree. An additional grant
 of patent rights can be found in the PATENTS file in the same directory.
 */

#import <Foundation/Foundation.h>

#if TARGET_OS_IPHONE
#import <UIKit/UIGeometry.h>
#endif

#if !TARGET_OS_IPHONE

/** NSValue extensions to support animatable types. */
@interface NSValue (POP)

/**
 @abstract Creates an NSValue given a CGPoint.
 */
+ (NSValue *)valueWithCGPoint:(CGPoint)point;

/**
 @abstract Creates an NSValue given a CGSize.
 */
+ (NSValue *)valueWithCGSize:(CGSize)size;

/**
 @abstract Creates an NSValue given a CGRect.
 */
+ (NSValue *)valueWithCGRect:(CGRect)rect;

/**
 @abstract Creates an NSValue given a CFRange.
 */
+ (NSValue *)valueWithCFRange:(CFRange)range;

/**
 @abstract Creates an NSValue given a CGAffineTransform.
 */
+ (NSValue *)valueWithCGAffineTransform:(CGAffineTransform)transform;

/**
 @abstract Returns the underlying CGPoint value.
 */
- (CGPoint)CGPointValue;

/**
 @abstract Returns the underlying CGSize value.
 */
- (CGSize)CGSizeValue;

/**
 @abstract Returns the underlying CGRect value.
 */
- (CGRect)CGRectValue;

/**
 @abstract Returns the underlying CFRange value.
 */
- (CFRange)CFRangeValue;

/**
 @abstract Returns the underlying CGAffineTransform value.
 */
- (CGAffineTransform)CGAffineTransformValue;

@end

#endif
