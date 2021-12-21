import 'dart:ffi';

import 'package:flutter/foundation.dart';

import '../style.dart';
import '../util.dart';
import 'flex_value.dart';

const double undefined = double.nan;

class FlexLayoutParams {
  final double width;
  final double height;
  final FlexMeasureMode widthMode;
  final FlexMeasureMode heightMode;

  FlexLayoutParams(this.width, this.height, int widthMode, int heightMode)
      : widthMode = flexMeasureModeFromInt(widthMode),
        heightMode = flexMeasureModeFromInt(heightMode);

  @override
  String toString() {
    return '{width:$width($widthMode), height: $height($heightMode)}';
  }

  int defaultOutput() {
    return FlexOutput.makeMeasureResult(width, height);
  }

  int zero() {
    return FlexOutput.makeMeasureResult(0, 0);
  }
}

enum FlexDirection { inherit, ltr, rtl }

void _convertError(String error) {
  if (kDebugMode) {
    throw ArgumentError(error);
  } else {
    LogUtils.e('flex_define', error);
  }
}

FlexDirection? flexDirectionFromValue(String? value) {
  if (value == null) {
    return null;
  }
  switch (value.replaceKey()) {
    case 'INHERIT':
      return FlexDirection.inherit;
    case 'LTR':
      return FlexDirection.ltr;
    case 'RTL':
      return FlexDirection.rtl;
    default:
      _convertError("flexDirectionFromInt Unknown enum value: $value");
      return null;
  }
}

enum FlexCSSDirection { row, rowReverse, column, columnReverse }

FlexCSSDirection? flexCssDirectionFromValue(String? value) {
  if (value == null) {
    return null;
  }
  switch (value.replaceKey()) {
    case 'ROW':
      return FlexCSSDirection.row;
    case 'ROW_REVERSE':
      return FlexCSSDirection.rowReverse;
    case 'COLUMN':
      return FlexCSSDirection.column;
    case 'COLUMN_REVERSE':
      return FlexCSSDirection.columnReverse;
    default:
      _convertError("flexCssDirectionFromInt Unknown enum value: $value");
      return null;
  }
}

enum FlexJustify {
  flexStart,
  center,
  flexEnd,
  spaceBetween,
  spaceAround,
  spaceEvenly
}

FlexJustify? flexJustifyFromValue(String? value) {
  if (value == null) {
    return null;
  }
  switch (value.replaceKey()) {
    case 'FLEX_START':
      return FlexJustify.flexStart;
    case 'CENTER':
      return FlexJustify.center;
    case 'FLEX_END':
      return FlexJustify.flexEnd;
    case 'SPACE_BETWEEN':
      return FlexJustify.spaceBetween;
    case 'SPACE_AROUND':
      return FlexJustify.spaceAround;
    case 'SPACE_EVENLY':
      return FlexJustify.spaceEvenly;
    default:
      _convertError("flexJustifyFromInt Unknown enum value: $value");
      return null;
  }
}

enum FlexAlign {
  auto,
  flexStart,
  center,
  flexEnd,
  stretch,
  baseline,
  spaceBetween,
  spaceAround
}

FlexAlign? flexAlignFromValue(String? value) {
  if (value == null) {
    return null;
  }
  switch (value.replaceKey()) {
    case 'AUTO':
      return FlexAlign.auto;
    case 'FLEX_START':
      return FlexAlign.flexStart;
    case 'CENTER':
      return FlexAlign.center;
    case 'FLEX_END':
      return FlexAlign.flexEnd;
    case 'STRETCH':
      return FlexAlign.stretch;
    case 'BASELINE':
      return FlexAlign.baseline;
    case 'SPACE_BETWEEN':
      return FlexAlign.spaceBetween;
    case 'SPACE_AROUND':
      return FlexAlign.spaceAround;
    default:
      _convertError("flexAlignFromInt Unknown enum value: $value");
      return null;
  }
}

enum FlexPositionType { relative, absolute }

FlexPositionType? flexPositionTypeFromValue(String? value) {
  if (value == null) {
    return null;
  }
  switch (value.replaceKey()) {
    case 'RELATIVE':
      return FlexPositionType.relative;
    case 'ABSOLUTE':
      return FlexPositionType.absolute;
    default:
      _convertError("flexPositionTypeFromInt Unknown enum value: $value");
      return null;
  }
}

enum FlexWrap { noWrap, wrap, wrapReverse }

FlexWrap? flexWrapFromValue(String? value) {
  if (value == null) {
    return null;
  }
  switch (value.replaceKey()) {
    case 'NOWRAP':
      return FlexWrap.noWrap;
    case 'WRAP':
      return FlexWrap.wrap;
    case 'WRAP_REVERSE':
      return FlexWrap.wrapReverse;
    default:
      _convertError("flexWrapFromInt Unknown enum value: $value");
      return null;
  }
}

enum FlexDisplay { displayFlex, displayNode }

FlexDisplay? flexDisplayFromValue(String? value) {
  if (value == null) {
    return null;
  }
  switch (value.replaceKey()) {
    case 'DISPLAY_FLEX':
      return FlexDisplay.displayFlex;
    case 'DISPLAY_NONE':
      return FlexDisplay.displayNode;
    default:
      _convertError("flexDisplayFromInt Unknown enum value: $value");
      return null;
  }
}

enum FlexOverflow { visible, hidden, scroll }

FlexOverflow? flexOverflowFromValue(String? value) {
  if (value == null) {
    return null;
  }
  switch (value.replaceKey()) {
    case 'VISIBLE':
      return FlexOverflow.visible;
    case 'HIDDEN':
      return FlexOverflow.hidden;
    case 'SCROLL':
      return FlexOverflow.scroll;
    default:
      _convertError("flexOverflowFromInt Unknown enum value: $value");
      return null;
  }
}

// ignore: constant_identifier_names
enum FlexMeasureMode { undefined, exactly, atMost }

FlexMeasureMode? flexMeasureModeFromValue(String? value) {
  if (value == null) {
    return null;
  }
  switch (value.replaceKey()) {
    case 'UNDEFINED':
      return FlexMeasureMode.undefined;
    case 'EXACTLY':
      return FlexMeasureMode.exactly;
    case 'AT_MOST':
      return FlexMeasureMode.atMost;
    default:
      _convertError("flexMeasureModeFromInt Unknown enum value: $value");
      return null;
  }
}

FlexMeasureMode flexMeasureModeFromInt(int value) {
  switch (value) {
    case 0:
      return FlexMeasureMode.undefined;
    case 1:
      return FlexMeasureMode.exactly;
    case 2:
      return FlexMeasureMode.atMost;
    default:
      throw ArgumentError("flexMeasureModeFromInt Unknown enum value: $value");
  }
}

enum FlexStyleEdge {
  left,
  top,
  right,
  bottom,
  start,
  end,
  horizontal,
  vertical,
  all
}

FlexStyleEdge flexStyleEdgeFromInt(int value) {
  switch (value) {
    case 0:
      return FlexStyleEdge.left;
    case 1:
      return FlexStyleEdge.top;
    case 2:
      return FlexStyleEdge.right;
    case 3:
      return FlexStyleEdge.bottom;
    case 4:
      return FlexStyleEdge.start;
    case 5:
      return FlexStyleEdge.end;
    case 6:
      return FlexStyleEdge.horizontal;
    case 7:
      return FlexStyleEdge.vertical;
    case 8:
      return FlexStyleEdge.all;
    default:
      throw ArgumentError("flexStyleEdgeFromInt Unknown enum value: $value");
  }
}

typedef RegisterMeasureFuncFfiDartType = int Function(
    int type, Pointer<NativeFunction<FlexNodeMeasureFuncNativeType>> func);
typedef RegisterMeasureFuncFfiNativeType = Int32 Function(
    Int32 type, Pointer<NativeFunction<FlexNodeMeasureFuncNativeType>> func);

typedef RegisterFloatGetterFuncFfiDartType = int Function(
    int type, Pointer<NativeFunction<NodeFloatFiledGetter>> func);
typedef RegisterFloatGetterFuncFfiNativeType = Int32 Function(
    Int32 type, Pointer<NativeFunction<NodeFloatFiledGetter>> func);

typedef RegisterFloatSetterFuncFfiDartType = int Function(
    int type, Pointer<NativeFunction<NodeFloatFiledSetter>> func);
typedef RegisterFloatSetterFuncFfiNativeType = Int32 Function(
    Int32 type, Pointer<NativeFunction<NodeFloatFiledSetter>> func);

typedef RegisterIntGetterFuncFfiDartType = int Function(
    int type, Pointer<NativeFunction<NodeIntFiledGetter>> func);
typedef RegisterIntGetterFuncFfiNativeType = Int32 Function(
    Int32 type, Pointer<NativeFunction<NodeIntFiledGetter>> func);

typedef RegisterIntSetterFuncFfiDartType = int Function(
    int type, Pointer<NativeFunction<NodeIntFiledSetter>> func);
typedef RegisterIntSetterFuncFfiNativeType = Int32 Function(
    Int32 type, Pointer<NativeFunction<NodeIntFiledSetter>> func);

typedef NewNativeItemFuncDartType = int Function();
typedef NewNativeItemFuncNativeType = Int64 Function();

typedef InsertNativeFlexNodeChildFuncDartType = void Function(
    int nativeFlexNode, int childNode, int index);
typedef InsertNativeFlexNodeChildFuncNativeType = Void Function(
    Int64 nativeFlexNode, Int64 childNode, Int32 index);
typedef RemoveNativeFlexNodeChildFuncDartType = void Function(
    int nativeFlexNode, int childNode);
typedef RemoveNativeFlexNodeChildFuncNativeType = Void Function(
    Int64 nativeFlexNode, Int64 childNode);
typedef CalculateNativeFlexNodeLayoutFuncDartType = void Function(
    int nativeFlexNode,
    double width,
    double height,
    Pointer<Int64> nativeNodes,
    int nativeNodesLen,
    int direction);
typedef CalculateNativeFlexNodeLayoutFuncNativeType = Void Function(
    Int64 nativeFlexNode,
    Float width,
    Float height,
    Pointer<Int64> nativeNodes,
    Int32 nativeNodesLen,
    Int32 direction);

typedef GetFloatValueFuncDartType = double Function(int nativeFlexNode);
typedef GetFloatValueFuncNativeType = Float Function(Int64 nativeFlexNode);

typedef DetFloatValueFuncDartType = void Function(
    int nativeFlexNode, double value);
typedef SetFloatValueFuncNativeType = Void Function(
    Int64 nativeFlexNode, Float value);

typedef GetFlexValueFuncDartType = Pointer<FlexValueNative> Function(
    int nativeFlexNode);
typedef GetFlexValueFuncNativeType = Pointer<FlexValueNative> Function(
    Int64 nativeFlexNode);

typedef GetFlexValueWithEdgeFuncDartType = Pointer<FlexValueNative> Function(
    int nativeFlexNode, int edge);
typedef GetFlexValueWithEdgeFuncNativeType = Pointer<FlexValueNative> Function(
    Int64 nativeFlexNode, Int32 edge);
typedef SetFlexValueWithEdgeFuncDartType = void Function(
    int nativeFlexNode, int edge);
typedef SetFlexValueWithEdgeFuncNativeType = Void Function(
    Int64 nativeFlexNode, Int32 edge);

typedef SetFloatValueWithEdgeFuncDartType = void Function(
    int nativeFlexNode, int edge, double value);
typedef SetFloatValueWithEdgeFuncNativeType = Void Function(
    Int64 nativeFlexNode, Int32 edge, Float value);

typedef GetIntValueFuncDartType = int Function(int nativeFlexNode);
typedef GetIntValueFuncNativeType = Int32 Function(Int64 nativeFlexNode);

typedef SetIntValueFuncDartType = void Function(int nativeFlexNode, int value);
typedef SetIntValueFuncNativeType = Void Function(
    Int64 nativeFlexNode, Int32 value);

typedef SingleCallFuncDartType = void Function(int nativePointer);
typedef SingleCallFuncNativeType = Void Function(Int64 nativePointer);

typedef SetFlexNodeToStyleFuncDartType = void Function(
    int stylePointer, int nodePointer);
typedef SetFlexNodeToStyleFuncNativeType = Void Function(
    Int64 stylePointer, Int64 nodePointer);

typedef FlexNodeMeasureFuncNativeType = Int64 Function(
    Int64 nodeId, Float width, Int32 widthMode, Float height, Int32 heightMode);
typedef NodeFloatFiledGetter = Float Function(Int64 nodeId, Int32 filedType);
typedef NodeFloatFiledSetter = Void Function(
    Int64 nodeId, Int32 filedType, Float value);
typedef NodeIntFiledGetter = Int32 Function(Int64 nodeId, Int32 filedType);
typedef NodeIntFiledSetter = Void Function(
    Int64 nodeId, Int32 filedType, Int32 value);
