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

#import "HPOPLayerExtras.h"

#include "HPTransformationMatrix.h"

using namespace HPWebCore;

#define DECOMPOSE_TRANSFORM(L) \
  TransformationMatrix _m(L.transform); \
  TransformationMatrix::DecomposedType _d; \
  _m.decompose(_d);

#define RECOMPOSE_TRANSFORM(L) \
  _m.recompose(_d); \
  L.transform = _m.transform3d();

#define RECOMPOSE_ROT_TRANSFORM(L) \
  _m.recompose(_d, true); \
  L.transform = _m.transform3d();

#define DECOMPOSE_SUBLAYER_TRANSFORM(L) \
  TransformationMatrix _m(L.sublayerTransform); \
  TransformationMatrix::DecomposedType _d; \
  _m.decompose(_d);

#define RECOMPOSE_SUBLAYER_TRANSFORM(L) \
  _m.recompose(_d); \
  L.sublayerTransform = _m.transform3d();

#pragma mark - Scale

NS_INLINE void ensureNonZeroValue(CGFloat &f)
{
  if (f == 0) {
    f = 1e-6;
  }
}

NS_INLINE void ensureNonZeroValue(CGPoint &p)
{
  if (p.x == 0 && p.y == 0) {
    p.x = 1e-6;
    p.y = 1e-6;
  }
}

CGFloat POPLayerGetScaleX(CALayer *l)
{
  DECOMPOSE_TRANSFORM(l);
  return _d.scaleX;
}

void POPLayerSetScaleX(CALayer *l, CGFloat f)
{
  ensureNonZeroValue(f);
  DECOMPOSE_TRANSFORM(l);
  _d.scaleX = f;
  RECOMPOSE_TRANSFORM(l);
}

CGFloat POPLayerGetScaleY(CALayer *l)
{
  DECOMPOSE_TRANSFORM(l);
  return _d.scaleY;
}

void POPLayerSetScaleY(CALayer *l, CGFloat f)
{
  ensureNonZeroValue(f);
  DECOMPOSE_TRANSFORM(l);
  _d.scaleY = f;
  RECOMPOSE_TRANSFORM(l);
}

CGFloat POPLayerGetScaleZ(CALayer *l)
{
  DECOMPOSE_TRANSFORM(l);
  return _d.scaleZ;
}

void POPLayerSetScaleZ(CALayer *l, CGFloat f)
{
  ensureNonZeroValue(f);
  DECOMPOSE_TRANSFORM(l);
  _d.scaleZ = f;
  RECOMPOSE_TRANSFORM(l);
}

CGPoint POPLayerGetScaleXY(CALayer *l)
{
  DECOMPOSE_TRANSFORM(l);
  return CGPointMake(_d.scaleX, _d.scaleY);
}

void POPLayerSetScaleXY(CALayer *l, CGPoint p)
{
  ensureNonZeroValue(p);
  DECOMPOSE_TRANSFORM(l);
  _d.scaleX = p.x;
  _d.scaleY = p.y;
  RECOMPOSE_TRANSFORM(l);
}

#pragma mark - Translation

CGFloat POPLayerGetTranslationX(CALayer *l)
{
  DECOMPOSE_TRANSFORM(l);
  return _d.translateX;
}

void POPLayerSetTranslationX(CALayer *l, CGFloat f)
{
  DECOMPOSE_TRANSFORM(l);
  _d.translateX = f;
  RECOMPOSE_TRANSFORM(l);
}

CGFloat POPLayerGetTranslationY(CALayer *l)
{
  DECOMPOSE_TRANSFORM(l);
  return _d.translateY;
}

void POPLayerSetTranslationY(CALayer *l, CGFloat f)
{
  DECOMPOSE_TRANSFORM(l);
  _d.translateY = f;
  RECOMPOSE_TRANSFORM(l);
}

CGFloat POPLayerGetTranslationZ(CALayer *l)
{
  DECOMPOSE_TRANSFORM(l);
  return _d.translateZ;
}

void POPLayerSetTranslationZ(CALayer *l, CGFloat f)
{
  DECOMPOSE_TRANSFORM(l);
  _d.translateZ = f;
  RECOMPOSE_TRANSFORM(l);
}

CGPoint POPLayerGetTranslationXY(CALayer *l)
{
  DECOMPOSE_TRANSFORM(l);
  return CGPointMake(_d.translateX, _d.translateY);
}

void POPLayerSetTranslationXY(CALayer *l, CGPoint p)
{
  DECOMPOSE_TRANSFORM(l);
  _d.translateX = p.x;
  _d.translateY = p.y;
  RECOMPOSE_TRANSFORM(l);
}

#pragma mark - Rotation

CGFloat POPLayerGetRotationX(CALayer *l)
{
  DECOMPOSE_TRANSFORM(l);
  return _d.rotateX;
}

void POPLayerSetRotationX(CALayer *l, CGFloat f)
{
  DECOMPOSE_TRANSFORM(l);
  _d.rotateX = f;
  RECOMPOSE_ROT_TRANSFORM(l);
}

CGFloat POPLayerGetRotationY(CALayer *l)
{
  DECOMPOSE_TRANSFORM(l);
  return _d.rotateY;
}

void POPLayerSetRotationY(CALayer *l, CGFloat f)
{
  DECOMPOSE_TRANSFORM(l);
  _d.rotateY = f;
  RECOMPOSE_ROT_TRANSFORM(l);
}

CGFloat POPLayerGetRotationZ(CALayer *l)
{
  DECOMPOSE_TRANSFORM(l);
  return _d.rotateZ;
}

void POPLayerSetRotationZ(CALayer *l, CGFloat f)
{
  DECOMPOSE_TRANSFORM(l);
  _d.rotateZ = f;
  RECOMPOSE_ROT_TRANSFORM(l);
}

CGFloat POPLayerGetRotation(CALayer *l)
{
  return POPLayerGetRotationZ(l);
}

void POPLayerSetRotation(CALayer *l, CGFloat f)
{
  POPLayerSetRotationZ(l, f);
}

#pragma mark - Sublayer Scale

CGPoint POPLayerGetSubScaleXY(CALayer *l)
{
  DECOMPOSE_SUBLAYER_TRANSFORM(l);
  return CGPointMake(_d.scaleX, _d.scaleY);
}

void POPLayerSetSubScaleXY(CALayer *l, CGPoint p)
{
  ensureNonZeroValue(p);
  DECOMPOSE_SUBLAYER_TRANSFORM(l);
  _d.scaleX = p.x;
  _d.scaleY = p.y;
  RECOMPOSE_SUBLAYER_TRANSFORM(l);
}

#pragma mark - Sublayer Translation

extern CGFloat POPLayerGetSubTranslationX(CALayer *l)
{
  DECOMPOSE_SUBLAYER_TRANSFORM(l);
  return _d.translateX;
}

extern void POPLayerSetSubTranslationX(CALayer *l, CGFloat f)
{
  DECOMPOSE_SUBLAYER_TRANSFORM(l);
  _d.translateX = f;
  RECOMPOSE_SUBLAYER_TRANSFORM(l);
}

extern CGFloat POPLayerGetSubTranslationY(CALayer *l)
{
  DECOMPOSE_SUBLAYER_TRANSFORM(l);
  return _d.translateY;
}

extern void POPLayerSetSubTranslationY(CALayer *l, CGFloat f)
{
  DECOMPOSE_SUBLAYER_TRANSFORM(l);
  _d.translateY = f;
  RECOMPOSE_SUBLAYER_TRANSFORM(l);
}

extern CGFloat POPLayerGetSubTranslationZ(CALayer *l)
{
  DECOMPOSE_SUBLAYER_TRANSFORM(l);
  return _d.translateZ;
}

extern void POPLayerSetSubTranslationZ(CALayer *l, CGFloat f)
{
  DECOMPOSE_SUBLAYER_TRANSFORM(l);
  _d.translateZ = f;
  RECOMPOSE_SUBLAYER_TRANSFORM(l);
}

extern CGPoint POPLayerGetSubTranslationXY(CALayer *l)
{
  DECOMPOSE_SUBLAYER_TRANSFORM(l);
  return CGPointMake(_d.translateX, _d.translateY);
}

extern void POPLayerSetSubTranslationXY(CALayer *l, CGPoint p)
{
  DECOMPOSE_SUBLAYER_TRANSFORM(l);
  _d.translateX = p.x;
  _d.translateY = p.y;
  RECOMPOSE_SUBLAYER_TRANSFORM(l);
}
