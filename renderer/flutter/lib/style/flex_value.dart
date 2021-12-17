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
