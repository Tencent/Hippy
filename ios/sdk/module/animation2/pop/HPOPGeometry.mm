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

#import "HPOPGeometry.h"

#if !TARGET_OS_IPHONE
@implementation NSValue (POP)

+ (NSValue *)valueWithCGPoint:(CGPoint)point {
  return [NSValue valueWithBytes:&point objCType:@encode(CGPoint)];
}

+ (NSValue *)valueWithCGSize:(CGSize)size {
  return [NSValue valueWithBytes:&size objCType:@encode(CGSize)];
}

+ (NSValue *)valueWithCGRect:(CGRect)rect {
  return [NSValue valueWithBytes:&rect objCType:@encode(CGRect)];
}

+ (NSValue *)valueWithCFRange:(CFRange)range {
  return [NSValue valueWithBytes:&range objCType:@encode(CFRange)];
}

+ (NSValue *)valueWithCGAffineTransform:(CGAffineTransform)transform
{
  return [NSValue valueWithBytes:&transform objCType:@encode(CGAffineTransform)];
}

- (CGPoint)CGPointValue {
  CGPoint result;
  [self getValue:&result];
  return result;
}

- (CGSize)CGSizeValue {
  CGSize result;
  [self getValue:&result];
  return result;
}

- (CGRect)CGRectValue {
  CGRect result;
  [self getValue:&result];
  return result;
}

- (CFRange)CFRangeValue {
  CFRange result;
  [self getValue:&result];
  return result;
}

- (CGAffineTransform)CGAffineTransformValue {
  CGAffineTransform result;
  [self getValue:&result];
  return result;
}
@end

#endif

#if TARGET_OS_IPHONE
#import "HPOPDefines.h"

#if SCENEKIT_SDK_AVAILABLE
#import <SceneKit/SceneKit.h>

/**
  Dirty hacks because iOS is weird and decided to define both SCNVector3's and SCNVector4's objCType as "t". However @encode(SCNVector3) and @encode(SCNVector4) both return the proper definition ("{SCNVector3=fff}" and "{SCNVector4=ffff}" respectively)
 
  [[NSValue valueWithSCNVector3:SCNVector3Make(0.0, 0.0, 0.0)] objcType] returns "t", whereas it should return "{SCNVector3=fff}".
 
  *flips table*
 */
@implementation NSValue (SceneKitFixes)

+ (NSValue *)valueWithSCNVector3:(SCNVector3)vec3 {
  return [NSValue valueWithBytes:&vec3 objCType:@encode(SCNVector3)];
}

+ (NSValue *)valueWithSCNVector4:(SCNVector4)vec4 {
  return [NSValue valueWithBytes:&vec4 objCType:@encode(SCNVector4)];
}

@end
#endif
#endif
