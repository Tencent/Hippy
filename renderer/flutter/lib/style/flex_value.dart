//
// Tencent is pleased to support the open source community by making
// Hippy available.
//
// Copyright (C) 2019 THL A29 Limited, a Tencent company.
// All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import 'dart:ffi';

import '../util.dart';

// ignore: constant_identifier_names
enum FlexUnit { UNDEFINED, POINT, PERCENT, AUTO }

FlexUnit flexUnitFromInt(int value) {
  switch (value) {
    case 0:
      return FlexUnit.UNDEFINED;
    case 1:
      return FlexUnit.POINT;
    case 2:
      return FlexUnit.PERCENT;
    case 3:
      return FlexUnit.AUTO;
    default:
      return FlexUnit.UNDEFINED;
  }
}

class FlexValueNative extends Struct {
  @Float()
  external double? value;

  @Int32()
  external int? unit;

  factory FlexValueNative.allocate(double initValue, int initUnit) =>
      allocate<FlexValueNative>(1 * sizeOf<FlexValueNative>()).ref
        ..value = initValue
        ..unit = initUnit;
}

class FlexValue {
  double value;
  FlexUnit unit;

  FlexValue.fromValue(this.value, this.unit);

  FlexValue.point(this.value) : unit = FlexUnit.POINT;

  FlexValue.fromNative(FlexValueNative native)
      : value = native.value ?? 0,
        unit = flexUnitFromInt(native.unit ?? 0);

  FlexValue.fromPointer(Pointer<FlexValueNative> pointer)
      : value = pointer.ref.value ?? 0,
        unit = flexUnitFromInt(pointer.ref.unit ?? 0);
}
