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

#import "HPOPAnimationRuntime.h"

#import <objc/objc.h>

#import <QuartzCore/QuartzCore.h>

#if TARGET_OS_IPHONE
#import <UIKit/UIKit.h>
#endif

#import "HPOPCGUtils.h"
#import "HPOPDefines.h"
#import "HPOPGeometry.h"
#import "HPOPVector.h"

static Boolean pointerEqual(const void *ptr1, const void *ptr2) {
  return ptr1 == ptr2;
}

static CFHashCode pointerHash(const void *ptr) {
  return (CFHashCode)(ptr);
}

CFMutableDictionaryRef POPDictionaryCreateMutableWeakPointerToWeakPointer(NSUInteger capacity)
{
  CFDictionaryKeyCallBacks kcb = kCFTypeDictionaryKeyCallBacks;

  // weak, pointer keys
  kcb.retain = NULL;
  kcb.release = NULL;
  kcb.equal = pointerEqual;
  kcb.hash = pointerHash;

  CFDictionaryValueCallBacks vcb = kCFTypeDictionaryValueCallBacks;

  // weak, pointer values
  vcb.retain = NULL;
  vcb.release = NULL;
  vcb.equal = pointerEqual;

  return CFDictionaryCreateMutable(NULL, capacity, &kcb, &vcb);
}

CFMutableDictionaryRef POPDictionaryCreateMutableWeakPointerToStrongObject(NSUInteger capacity)
{
  CFDictionaryKeyCallBacks kcb = kCFTypeDictionaryKeyCallBacks;

  // weak, pointer keys
  kcb.retain = NULL;
  kcb.release = NULL;
  kcb.equal = pointerEqual;
  kcb.hash = pointerHash;

  // strong, object values
  CFDictionaryValueCallBacks vcb = kCFTypeDictionaryValueCallBacks;

  return CFDictionaryCreateMutable(NULL, capacity, &kcb, &vcb);
}

static bool FBCompareTypeEncoding(const char *objctype, POPValueType type)
{
  switch (type)
  {
    case kHPOPValueFloat:
      return (strcmp(objctype, @encode(float)) == 0
              || strcmp(objctype, @encode(double)) == 0
              );

    case kHPOPValuePoint:
      return (strcmp(objctype, @encode(CGPoint)) == 0
#if !TARGET_OS_IPHONE
              || strcmp(objctype, @encode(NSPoint)) == 0
#endif
              );

    case kHPOPValueSize:
      return (strcmp(objctype, @encode(CGSize)) == 0
#if !TARGET_OS_IPHONE
              || strcmp(objctype, @encode(NSSize)) == 0
#endif
              );

    case kHPOPValueRect:
      return (strcmp(objctype, @encode(CGRect)) == 0
#if !TARGET_OS_IPHONE
              || strcmp(objctype, @encode(NSRect)) == 0
#endif
              );
    case kHPOPValueEdgeInsets:
#if TARGET_OS_IPHONE
      return strcmp(objctype, @encode(UIEdgeInsets)) == 0;
#else
      return false;
#endif
      
    case kHPOPValueAffineTransform:
      return strcmp(objctype, @encode(CGAffineTransform)) == 0;

    case kHPOPValueTransform:
      return strcmp(objctype, @encode(CATransform3D)) == 0;

    case kHPOPValueRange:
      return strcmp(objctype, @encode(CFRange)) == 0
      || strcmp(objctype, @encode (NSRange)) == 0;

    case kHPOPValueInteger:
      return (strcmp(objctype, @encode(int)) == 0
              || strcmp(objctype, @encode(unsigned int)) == 0
              || strcmp(objctype, @encode(short)) == 0
              || strcmp(objctype, @encode(unsigned short)) == 0
              || strcmp(objctype, @encode(long)) == 0
              || strcmp(objctype, @encode(unsigned long)) == 0
              || strcmp(objctype, @encode(long long)) == 0
              || strcmp(objctype, @encode(unsigned long long)) == 0
              );
      
    case kHPOPValueSCNVector3:
#if SCENEKIT_SDK_AVAILABLE
      return strcmp(objctype, @encode(SCNVector3)) == 0;
#else
      return false;
#endif
      
    case kHPOPValueSCNVector4:
#if SCENEKIT_SDK_AVAILABLE
      return strcmp(objctype, @encode(SCNVector4)) == 0;
#else
      return false;
#endif
      
    default:
      return false;
  }
}

POPValueType POPSelectValueType(const char *objctype, const POPValueType *types, size_t length)
{
  if (NULL != objctype) {
    for (size_t idx = 0; idx < length; idx++) {
      if (FBCompareTypeEncoding(objctype, types[idx]))
        return types[idx];
    }
  }
  return kHPOPValueUnknown;
}

POPValueType POPSelectValueType(id obj, const POPValueType *types, size_t length)
{
  if ([obj isKindOfClass:[NSValue class]]) {
    return POPSelectValueType([obj objCType], types, length);
  } else if (NULL != POPCGColorWithColor(obj)) {
    return kHPOPValueColor;
  }
  return kHPOPValueUnknown;
}

const POPValueType kHPOPAnimatableAllTypes[12] = {kHPOPValueInteger, kHPOPValueFloat, kHPOPValuePoint, kHPOPValueSize, kHPOPValueRect, kHPOPValueEdgeInsets, kHPOPValueAffineTransform, kHPOPValueTransform, kHPOPValueRange, kHPOPValueColor, kHPOPValueSCNVector3, kHPOPValueSCNVector4};

const POPValueType kHPOPAnimatableSupportTypes[10] = {kHPOPValueInteger, kHPOPValueFloat, kHPOPValuePoint, kHPOPValueSize, kHPOPValueRect, kHPOPValueEdgeInsets, kHPOPValueColor, kHPOPValueSCNVector3, kHPOPValueSCNVector4};

NSString *POPValueTypeToString(POPValueType t)
{
  switch (t) {
    case kHPOPValueUnknown:
      return @"unknown";
    case kHPOPValueInteger:
      return @"int";
    case kHPOPValueFloat:
      return @"CGFloat";
    case kHPOPValuePoint:
      return @"CGPoint";
    case kHPOPValueSize:
      return @"CGSize";
    case kHPOPValueRect:
      return @"CGRect";
    case kHPOPValueEdgeInsets:
      return @"UIEdgeInsets";
    case kHPOPValueAffineTransform:
      return @"CGAffineTransform";
    case kHPOPValueTransform:
      return @"CATransform3D";
    case kHPOPValueRange:
      return @"CFRange";
    case kHPOPValueColor:
      return @"CGColorRef";
    case kHPOPValueSCNVector3:
      return @"SCNVector3";
    case kHPOPValueSCNVector4:
      return @"SCNVector4";
    default:
      return nil;
  }
}

id POPBox(VectorConstRef vec, POPValueType type, bool force)
{
  if (NULL == vec)
    return nil;
  
  switch (type) {
    case kHPOPValueInteger:
    case kHPOPValueFloat:
      return @(vec->data()[0]);
      break;
    case kHPOPValuePoint:
      return [NSValue valueWithCGPoint:vec->cg_point()];
      break;
    case kHPOPValueSize:
      return [NSValue valueWithCGSize:vec->cg_size()];
      break;
    case kHPOPValueRect:
      return [NSValue valueWithCGRect:vec->cg_rect()];
      break;
#if TARGET_OS_IPHONE
    case kHPOPValueEdgeInsets:
      return [NSValue valueWithUIEdgeInsets:vec->ui_edge_insets()];
      break;
#endif
    case kHPOPValueColor: {
      return (__bridge_transfer id)vec->cg_color();
      break;
    }
#if SCENEKIT_SDK_AVAILABLE
    case kHPOPValueSCNVector3: {
      return [NSValue valueWithSCNVector3:vec->scn_vector3()];
      break;
    }
    case kHPOPValueSCNVector4: {
      return [NSValue valueWithSCNVector4:vec->scn_vector4()];
      break;
    }
#endif
    default:
      return force ? [NSValue valueWithCGPoint:vec->cg_point()] : nil;
      break;
  }
}

static VectorRef vectorize(id value, POPValueType type)
{
  Vector *vec = NULL;

  switch (type) {
    case kHPOPValueInteger:
    case kHPOPValueFloat:
#if CGFLOAT_IS_DOUBLE
      vec = Vector::new_cg_float([value doubleValue]);
#else
      vec = Vector::new_cg_float([value floatValue]);
#endif
      break;
    case kHPOPValuePoint:
      vec = Vector::new_cg_point([value CGPointValue]);
      break;
    case kHPOPValueSize:
      vec = Vector::new_cg_size([value CGSizeValue]);
      break;
    case kHPOPValueRect:
      vec = Vector::new_cg_rect([value CGRectValue]);
      break;
#if TARGET_OS_IPHONE
    case kHPOPValueEdgeInsets:
      vec = Vector::new_ui_edge_insets([value UIEdgeInsetsValue]);
      break;
#endif
    case kHPOPValueAffineTransform:
      vec = Vector::new_cg_affine_transform([value CGAffineTransformValue]);
      break;
    case kHPOPValueColor:
      vec = Vector::new_cg_color(POPCGColorWithColor(value));
      break;
#if SCENEKIT_SDK_AVAILABLE
    case kHPOPValueSCNVector3:
      vec = Vector::new_scn_vector3([value SCNVector3Value]);
      break;
    case kHPOPValueSCNVector4:
      vec = Vector::new_scn_vector4([value SCNVector4Value]);
      break;
#endif
    default:
      break;
  }
  
  return VectorRef(vec);
}

VectorRef POPUnbox(id value, POPValueType &animationType, NSUInteger &count, bool validate)
{
  if (nil == value) {
    count = 0;
    return VectorRef(NULL);
  }

  // determine type of value
  POPValueType valueType = POPSelectValueType(value, kHPOPAnimatableSupportTypes, POP_ARRAY_COUNT(kHPOPAnimatableSupportTypes));

  // handle unknown types
  if (kHPOPValueUnknown == valueType) {
    NSString *valueDesc = [[value class] description];
    [NSException raise:@"Unsuported value" format:@"Animating %@ values is not supported", valueDesc];
  }

  // vectorize
  VectorRef vec = vectorize(value, valueType);

  if (kHPOPValueUnknown == animationType || 0 == count) {
    // update animation type based on value type
    animationType = valueType;
    if (NULL != vec) {
      count = vec->size();
    }
  } else if (validate) {
    // allow for mismatched types, so long as vector size matches
    if (count != vec->size()) {
      [NSException raise:@"Invalid value" format:@"%@ should be of type %@", value, POPValueTypeToString(animationType)];
    }
  }
  
  return vec;
}
