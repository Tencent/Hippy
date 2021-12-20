import 'dart:ffi';

import '../style.dart';
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

enum FiledType {
  edgeSetFlagField,
  hasNewLayoutField,
  widthFiled,
  heightField,
  leftField,
  topField,
  rightFiled,
  bottomFiled,
  marginLeftField,
  marginTopField,
  marginRightField,
  marginBottomField,
  paddingLeftField,
  paddingTopField,
  paddingRightField,
  paddingBottomField,
  borderLeftField,
  borderTopField,
  borderRightField,
  borderBottomField
}

// 注意这里枚举变动后，要同步修改FlexNodeFfiBridge.h中的同名枚举
enum ExportFunctionType {
  measureFunc,
  floatFiledGetter,
  floatFiledSetter,
  intFiledGetter,
  intFiledSetter
}

/// 注意，由于需要把枚举值直接转换成对应的key，所以这里枚举必须跟C++侧的枚举定义保持一致
/// 因此需要使用大写英文+下划线方式

// ignore: constant_identifier_names
enum FlexDirection { INHERIT, LTR, RTL }

FlexDirection flexDirectionFromInt(int value) {
  switch (value) {
    case 0:
      return FlexDirection.INHERIT;
    case 1:
      return FlexDirection.LTR;
    case 2:
      return FlexDirection.RTL;
    default:
      throw ArgumentError("flexDirectionFromInt Unknown enum value: $value");
  }
}

// ignore: constant_identifier_names
enum FlexCSSDirection { ROW, ROW_REVERSE, COLUMN, COLUMN_REVERSE }

FlexCSSDirection flexCssDirectionFromInt(int value) {
  switch (value) {
    case 0:
      return FlexCSSDirection.ROW;
    case 1:
      return FlexCSSDirection.ROW_REVERSE;
    case 2:
      return FlexCSSDirection.COLUMN;
    case 3:
      return FlexCSSDirection.COLUMN_REVERSE;
    default:
      throw ArgumentError("flexCssDirectionFromInt Unknown enum value: $value");
  }
}

enum FlexJustify {
  // ignore: constant_identifier_names
  FLEX_START,
  // ignore: constant_identifier_names
  CENTER,
  // ignore: constant_identifier_names
  FLEX_END,
  // ignore: constant_identifier_names
  SPACE_BETWEEN,
  // ignore: constant_identifier_names
  SPACE_AROUND,
  // ignore: constant_identifier_names
  SPACE_EVENLY
}

FlexJustify flexJustifyFromInt(int value) {
  switch (value) {
    case 0:
      return FlexJustify.FLEX_START;
    case 1:
      return FlexJustify.CENTER;
    case 2:
      return FlexJustify.FLEX_END;
    case 3:
      return FlexJustify.SPACE_BETWEEN;
    case 4:
      return FlexJustify.SPACE_AROUND;
    case 5:
      return FlexJustify.SPACE_EVENLY;
    default:
      throw ArgumentError("flexJustifyFromInt Unknown enum value: $value");
  }
}

enum FlexAlign {
  // ignore: constant_identifier_names
  AUTO,
  // ignore: constant_identifier_names
  FLEX_START,
  // ignore: constant_identifier_names
  CENTER,
  // ignore: constant_identifier_names
  FLEX_END,
  // ignore: constant_identifier_names
  STRETCH,
  // ignore: constant_identifier_names
  BASELINE,
  // ignore: constant_identifier_names
  SPACE_BETWEEN,
  // ignore: constant_identifier_names
  SPACE_AROUND
}

FlexAlign flexAlignFromInt(int value) {
  switch (value) {
    case 0:
      return FlexAlign.AUTO;
    case 1:
      return FlexAlign.FLEX_START;
    case 2:
      return FlexAlign.CENTER;
    case 3:
      return FlexAlign.FLEX_END;
    case 4:
      return FlexAlign.STRETCH;
    case 5:
      return FlexAlign.BASELINE;
    case 6:
      return FlexAlign.SPACE_BETWEEN;
    case 7:
      return FlexAlign.SPACE_AROUND;
    default:
      throw ArgumentError("flexAlignFromInt Unknown enum value: $value");
  }
}

// ignore: constant_identifier_names
enum FlexPositionType { RELATIVE, ABSOLUTE }

FlexPositionType flexPositionTypeFromInt(int value) {
  switch (value) {
    case 0:
      return FlexPositionType.RELATIVE;
    case 1:
      return FlexPositionType.ABSOLUTE;
    default:
      throw ArgumentError("flexPositionTypeFromInt Unknown enum value: $value");
  }
}

// ignore: constant_identifier_names
enum FlexWrap { NOWRAP, WRAP, WRAP_REVERSE }

FlexWrap flexWrapFromInt(int value) {
  switch (value) {
    case 0:
      return FlexWrap.NOWRAP;
    case 1:
      return FlexWrap.WRAP;
    case 2:
      return FlexWrap.WRAP_REVERSE;
    default:
      throw ArgumentError("flexWrapFromInt Unknown enum value: $value");
  }
}

// ignore: constant_identifier_names
enum FlexDisplay { DISPLAY_FLEX, DISPLAY_NONE }

FlexDisplay flexDisplayFromInt(int value) {
  switch (value) {
    case 0:
      return FlexDisplay.DISPLAY_FLEX;
    case 1:
      return FlexDisplay.DISPLAY_NONE;
    default:
      throw ArgumentError("flexDisplayFromInt Unknown enum value: $value");
  }
}

// ignore: constant_identifier_names
enum FlexOverflow { VISIBLE, HIDDEN, SCROLL }

FlexOverflow flexOverflowFromInt(int value) {
  switch (value) {
    case 0:
      return FlexOverflow.VISIBLE;
    case 1:
      return FlexOverflow.HIDDEN;
    case 2:
      return FlexOverflow.SCROLL;
    default:
      throw ArgumentError("flexOverflowFromInt Unknown enum value: $value");
  }
}

// ignore: constant_identifier_names
enum FlexMeasureMode { UNDEFINED, EXACTLY, AT_MOST }

FlexMeasureMode flexMeasureModeFromInt(int value) {
  switch (value) {
    case 0:
      return FlexMeasureMode.UNDEFINED;
    case 1:
      return FlexMeasureMode.EXACTLY;
    case 2:
      return FlexMeasureMode.AT_MOST;
    default:
      throw ArgumentError("flexMeasureModeFromInt Unknown enum value: $value");
  }
}

enum FlexStyleEdge {
  // ignore: constant_identifier_names
  EDGE_LEFT,
  // ignore: constant_identifier_names
  EDGE_TOP,
  // ignore: constant_identifier_names
  EDGE_RIGHT,
  // ignore: constant_identifier_names
  EDGE_BOTTOM,
  // ignore: constant_identifier_names
  EDGE_START,
  // ignore: constant_identifier_names
  EDGE_END,
  // ignore: constant_identifier_names
  EDGE_HORIZONTAL,
  // ignore: constant_identifier_names
  EDGE_VERTICAL,
  // ignore: constant_identifier_names
  EDGE_ALL
}

FlexStyleEdge flexStyleEdgeFromInt(int value) {
  switch (value) {
    case 0:
      return FlexStyleEdge.EDGE_LEFT;
    case 1:
      return FlexStyleEdge.EDGE_TOP;
    case 2:
      return FlexStyleEdge.EDGE_RIGHT;
    case 3:
      return FlexStyleEdge.EDGE_BOTTOM;
    case 4:
      return FlexStyleEdge.EDGE_START;
    case 5:
      return FlexStyleEdge.EDGE_END;
    case 6:
      return FlexStyleEdge.EDGE_HORIZONTAL;
    case 7:
      return FlexStyleEdge.EDGE_VERTICAL;
    case 8:
      return FlexStyleEdge.EDGE_ALL;
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
