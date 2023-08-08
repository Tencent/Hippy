/**
 Copyright (c) 2014-present, Facebook, Inc.
 All rights reserved.
 
 This source code is licensed under the BSD-style license found in the
 LICENSE file in the root directory of this source tree. An additional grant
 of patent rights can be found in the PATENTS file in the same directory.
 */

#import <objc/runtime.h>

#import <CoreGraphics/CoreGraphics.h>
#import <Foundation/Foundation.h>

#import "HPOPAnimatablePropertyTypes.h"
#import "HPOPVector.h"

enum POPValueType
{
  kHPOPValueUnknown = 0,
  kHPOPValueInteger,
  kHPOPValueFloat,
  kHPOPValuePoint,
  kHPOPValueSize,
  kHPOPValueRect,
  kHPOPValueEdgeInsets,
  kHPOPValueAffineTransform,
  kHPOPValueTransform,
  kHPOPValueRange,
  kHPOPValueColor,
  kHPOPValueSCNVector3,
  kHPOPValueSCNVector4,
};

using namespace HPOP;

/**
 Returns value type based on objc type description, given list of supported value types and length.
 */
extern POPValueType POPSelectValueType(const char *objctype, const POPValueType *types, size_t length);

/**
 Returns value type based on objc object, given a list of supported value types and length.
 */
extern POPValueType POPSelectValueType(id obj, const POPValueType *types, size_t length);

/**
 Array of all value types.
 */
extern const POPValueType kHPOPAnimatableAllTypes[12];

/**
 Array of all value types supported for animation.
 */
extern const POPValueType kHPOPAnimatableSupportTypes[10];

/**
 Returns a string description of a value type.
 */
extern NSString *POPValueTypeToString(POPValueType t);

/**
 Returns a mutable dictionary of weak pointer keys to weak pointer values.
 */
extern CFMutableDictionaryRef POPDictionaryCreateMutableWeakPointerToWeakPointer(NSUInteger capacity) CF_RETURNS_RETAINED;

/**
 Returns a mutable dictionary of weak pointer keys to weak pointer values.
 */
extern CFMutableDictionaryRef POPDictionaryCreateMutableWeakPointerToStrongObject(NSUInteger capacity) CF_RETURNS_RETAINED;

/**
 Box a vector.
 */
extern id POPBox(VectorConstRef vec, POPValueType type, bool force = false);

/**
 Unbox a vector.
 */
extern VectorRef POPUnbox(id value, POPValueType &type, NSUInteger &count, bool validate);

/**
 Read object value and return a Vector4r.
 */
NS_INLINE Vector4r read_values(HPOPAnimatablePropertyReadBlock read, id obj, size_t count)
{
  Vector4r vec = Vector4r::Zero();
  if (0 == count)
    return vec;

  read(obj, vec.data());

  return vec;
}

NS_INLINE NSString *POPStringFromBOOL(BOOL value)
{
  return value ? @"YES" : @"NO";
}
