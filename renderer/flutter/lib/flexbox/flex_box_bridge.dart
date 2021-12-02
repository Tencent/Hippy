import 'dart:collection';
import 'dart:ffi';

import '../ffi/ffi_util.dart';
import 'flex_define.dart';
import 'flex_node.dart';
import 'flex_value.dart';

class _FlexBoxFFIManager {
  static _FlexBoxFFIManager? _instance;

  factory _FlexBoxFFIManager() => _getInstance();

  static _FlexBoxFFIManager get instance => _getInstance();

  final DynamicLibrary _library = loadLibrary("flexbox", isStatic: false);

  late RegisterMeasureFuncFfiDartType registerMeasureFunc;
  late RegisterFloatGetterFuncFfiDartType registerFloatGetterFunc;
  late RegisterFloatSetterFuncFfiDartType registerFloatSetterFunc;
  late RegisterIntGetterFuncFfiDartType registerIntGetterFunc;
  late RegisterIntSetterFuncFfiDartType registerIntSetterFunc;
  late NewNativeItemFuncDartType newFlexNodeFunc;

  late InsertNativeFlexNodeChildFuncDartType insertFlexNodeChildFunc;
  late RemoveNativeFlexNodeChildFuncDartType removeFlexNodeChildFunc;
  late CalculateNativeFlexNodeLayoutFuncDartType calculateLayoutFunc;

  late SingleCallFuncDartType freeFlexNodeFunc;
  late SingleCallFuncDartType markDirtyFunc;
  late SingleCallFuncDartType markLayoutSeenFunc;
  late SingleCallFuncDartType resetFunc;
  late SingleCallFuncDartType markHasNewLayoutFunc;

  late GetIntValueFuncDartType isNodeDirtyFunc;
  late GetIntValueFuncDartType hasNewLayoutFunc;

  late SetIntValueFuncDartType setHasMeasureFunc;
  late SetIntValueFuncDartType setHasBaselineFunc;

  late GetFloatValueFuncDartType getWidthFunc;
  late DetFloatValueFuncDartType setWidthFunc;
  late GetFloatValueFuncDartType getHeightFunc;
  late DetFloatValueFuncDartType setHeightFunc;
  late GetFloatValueFuncDartType getTopFunc;
  late DetFloatValueFuncDartType setTopFunc;
  late GetFloatValueFuncDartType getLeftFunc;
  late DetFloatValueFuncDartType setLeftFunc;
  late GetFloatValueFuncDartType getRightFunc;
  late DetFloatValueFuncDartType setRightFunc;
  late GetFloatValueFuncDartType getBottomFunc;
  late DetFloatValueFuncDartType setBottomFunc;
  late GetFloatValueFuncDartType getMarginTopFunc;
  late DetFloatValueFuncDartType setMarginTopFunc;
  late GetFloatValueFuncDartType getMarginLeftFunc;
  late DetFloatValueFuncDartType setMarginLeftFunc;
  late GetFloatValueFuncDartType getMarginRightFunc;
  late DetFloatValueFuncDartType setMarginRightFunc;
  late GetFloatValueFuncDartType getMarginBottomFunc;
  late DetFloatValueFuncDartType setMarginBottomFunc;
  late GetFloatValueFuncDartType getPaddingTopFunc;
  late DetFloatValueFuncDartType setPaddingTopFunc;
  late GetFloatValueFuncDartType getPaddingLeftFunc;
  late DetFloatValueFuncDartType setPaddingLeftFunc;
  late GetFloatValueFuncDartType getPaddingRightFunc;
  late DetFloatValueFuncDartType setPaddingRightFunc;
  late GetFloatValueFuncDartType getPaddingBottomFunc;
  late DetFloatValueFuncDartType setPaddingBottomFunc;
  late GetFloatValueFuncDartType getBorderTopFunc;
  late DetFloatValueFuncDartType setBorderTopFunc;
  late GetFloatValueFuncDartType getBorderLeftFunc;
  late DetFloatValueFuncDartType setBorderLeftFunc;
  late GetFloatValueFuncDartType getBorderRightFunc;
  late DetFloatValueFuncDartType setBorderRightFunc;
  late GetFloatValueFuncDartType getBorderBottomFunc;
  late DetFloatValueFuncDartType setBorderBottomFunc;

  late NewNativeItemFuncDartType newFlexNodeStyleFunc;
  late SingleCallFuncDartType freeFlexNodeStyleFunc;
  late SetFlexNodeToStyleFuncDartType setFlexNodeToStyleFunc;
  late GetIntValueFuncDartType getStyleDirectionFunc;
  late SetIntValueFuncDartType setStyleDirectionFunc;
  late GetIntValueFuncDartType getStyleFlexDirectionFunc;
  late SetIntValueFuncDartType setStyleFlexDirectionFunc;
  late GetIntValueFuncDartType getStyleJustifyContentFunc;
  late SetIntValueFuncDartType setStyleJustifyContentFunc;
  late GetIntValueFuncDartType getStyleAlignItemsFunc;
  late SetIntValueFuncDartType setStyleAlignItemsFunc;
  late GetIntValueFuncDartType getStyleAlignSelfFunc;
  late SetIntValueFuncDartType setStyleAlignSelfFunc;
  late GetIntValueFuncDartType getStyleAlignContentFunc;
  late SetIntValueFuncDartType setStyleAlignContentFunc;
  late GetIntValueFuncDartType getStylePositionTypeFunc;
  late SetIntValueFuncDartType setStylePositionTypeFunc;
  late GetIntValueFuncDartType getStyleFlexWrapFunc;
  late SetIntValueFuncDartType setStyleFlexWrapFunc;
  late GetIntValueFuncDartType getStyleOverflowFunc;
  late SetIntValueFuncDartType setStyleOverflowFunc;
  late GetIntValueFuncDartType getStyleDisplayFunc;
  late SetIntValueFuncDartType setStyleDisplayFunc;
  late GetFloatValueFuncDartType getStyleFlexFunc;
  late DetFloatValueFuncDartType setStyleFlexFunc;
  late GetFloatValueFuncDartType getStyleFlexGrowFunc;
  late DetFloatValueFuncDartType setStyleFlexGrowFunc;
  late GetFloatValueFuncDartType getStyleFlexShrinkFunc;
  late DetFloatValueFuncDartType setStyleFlexShrinkFunc;
  late GetFlexValueFuncDartType getStyleFlexBasisFunc;
  late DetFloatValueFuncDartType setStyleFlexBasisFunc;
  late DetFloatValueFuncDartType setStyleFlexBasisPercentFunc;
  late SingleCallFuncDartType setStyleFlexBasisAutoFunc;
  late GetFlexValueWithEdgeFuncDartType getStyleMarginFunc;
  late SetFloatValueWithEdgeFuncDartType setStyleMarginFunc;
  late SetFloatValueWithEdgeFuncDartType setStyleMarginPercentFunc;
  late SetFlexValueWithEdgeFuncDartType setStyleMarginAutoFunc;
  late GetFlexValueWithEdgeFuncDartType getStylePaddingFunc;
  late SetFloatValueWithEdgeFuncDartType setStylePaddingFunc;
  late SetFloatValueWithEdgeFuncDartType setStylePaddingPercentFunc;
  late GetFlexValueWithEdgeFuncDartType getStyleBorderFunc;
  late SetFloatValueWithEdgeFuncDartType setStyleBorderFunc;
  late GetFlexValueWithEdgeFuncDartType getStylePositionFunc;
  late SetFloatValueWithEdgeFuncDartType setStylePositionFunc;
  late SetFloatValueWithEdgeFuncDartType setStylePositionPercentFunc;
  late GetFlexValueFuncDartType getStyleWidthFunc;
  late DetFloatValueFuncDartType setStyleWidthFunc;
  late DetFloatValueFuncDartType setStyleWidthPercentFunc;
  late SingleCallFuncDartType setStyleWidthAuto;
  late GetFlexValueFuncDartType getStyleHeightFunc;
  late DetFloatValueFuncDartType setStyleHeightFunc;
  late DetFloatValueFuncDartType setStyleHeightPercentFunc;
  late SingleCallFuncDartType setStyleHeightAuto;
  late GetFlexValueFuncDartType getStyleMinWidthFunc;
  late DetFloatValueFuncDartType setStyleMinWidthFunc;
  late DetFloatValueFuncDartType setStyleMinWidthPercentFunc;
  late GetFlexValueFuncDartType getStyleMinHeightFunc;
  late DetFloatValueFuncDartType setStyleMinHeightFunc;
  late DetFloatValueFuncDartType setStyleMinHeightPercentFunc;
  late GetFlexValueFuncDartType getStyleMaxWidthFunc;
  late DetFloatValueFuncDartType setStyleMaxWidthFunc;
  late DetFloatValueFuncDartType setStyleMaxWidthPercentFunc;
  late GetFlexValueFuncDartType getStyleMaxHeightFunc;
  late DetFloatValueFuncDartType setStyleMaxHeightFunc;
  late DetFloatValueFuncDartType setStyleMaxHeightPercentFunc;
  late GetFloatValueFuncDartType getStyleAspectRatioFunc;
  late DetFloatValueFuncDartType setStyleAspectRatioFunc;

  static _FlexBoxFFIManager _getInstance() {
    // 只能有一个实例
    if (_instance == null) {
      _instance = _FlexBoxFFIManager._internal();
    }

    return _instance!;
  }

  _FlexBoxFFIManager._internal() {
    registerMeasureFunc = _library.lookupFunction<
        RegisterMeasureFuncFfiNativeType,
        RegisterMeasureFuncFfiDartType>("registerExportFunction");

    registerFloatGetterFunc = _library.lookupFunction<
        RegisterFloatGetterFuncFfiNativeType,
        RegisterFloatGetterFuncFfiDartType>("registerExportFunction");

    registerFloatSetterFunc = _library.lookupFunction<
        RegisterFloatSetterFuncFfiNativeType,
        RegisterFloatSetterFuncFfiDartType>("registerExportFunction");

    registerIntGetterFunc = _library.lookupFunction<
        RegisterIntGetterFuncFfiNativeType,
        RegisterIntGetterFuncFfiDartType>("registerExportFunction");

    registerIntSetterFunc = _library.lookupFunction<
        RegisterIntSetterFuncFfiNativeType,
        RegisterIntSetterFuncFfiDartType>("registerExportFunction");

    newFlexNodeFunc = newNativeItemFunction(_library, "newNativeFlexNode");

    insertFlexNodeChildFunc = _library.lookupFunction<
        InsertNativeFlexNodeChildFuncNativeType,
        InsertNativeFlexNodeChildFuncDartType>("insertNativeFlexNodeChild");

    removeFlexNodeChildFunc = _library.lookupFunction<
        RemoveNativeFlexNodeChildFuncNativeType,
        RemoveNativeFlexNodeChildFuncDartType>("removeNativeFlexNodeChild");

    calculateLayoutFunc = _library.lookupFunction<
            CalculateNativeFlexNodeLayoutFuncNativeType,
            CalculateNativeFlexNodeLayoutFuncDartType>(
        "calculateNativeFlexNodeLayout");

    freeFlexNodeFunc = singleCallFunction(_library, "freeNativeFlexNode");
    markDirtyFunc = singleCallFunction(_library, "markNativeFlexNodeNodeDirty");
    markLayoutSeenFunc =
        singleCallFunction(_library, "nativeFlexNodeMarkLayoutSeen");
    resetFunc = singleCallFunction(_library, "resetNativeFlexNode");
    markHasNewLayoutFunc =
        singleCallFunction(_library, "nativeFlexNodeMarkHasNewLayout");

    isNodeDirtyFunc = getIntValueFunction(_library, "isNativeFlexNodeDirty");
    hasNewLayoutFunc =
        getIntValueFunction(_library, "hasNativeFlexNodeNewLayout");
    setHasMeasureFunc =
        setIntValueFunction(_library, "setNativeFlexNodeHasMeasureFunc");
    setHasBaselineFunc =
        setIntValueFunction(_library, "setNativeFlexNodeHasBaselineFunc");

    getWidthFunc = getFloatValueFunction(_library, "getNativeFlexNodeWidth");
    setWidthFunc = setFloatValueFunction(_library, "setNativeFlexNodeWidth");
    getHeightFunc = getFloatValueFunction(_library, "getNativeFlexNodeHeight");
    setHeightFunc = setFloatValueFunction(_library, "setNativeFlexNodeHeight");
    getTopFunc = getFloatValueFunction(_library, "getNativeFlexNodeTop");
    setTopFunc = setFloatValueFunction(_library, "setNativeFlexNodeTop");
    getLeftFunc = getFloatValueFunction(_library, "getNativeFlexNodeLeft");
    setLeftFunc = setFloatValueFunction(_library, "setNativeFlexNodeLeft");
    getRightFunc = getFloatValueFunction(_library, "getNativeFlexNodeRight");
    setRightFunc = setFloatValueFunction(_library, "setNativeFlexNodeRight");
    getBottomFunc = getFloatValueFunction(_library, "getNativeFlexNodeBottom");
    setBottomFunc = setFloatValueFunction(_library, "setNativeFlexNodeBottom");
    getMarginTopFunc =
        getFloatValueFunction(_library, "getNativeFlexNodeMarginTop");
    setMarginTopFunc =
        setFloatValueFunction(_library, "setNativeFlexNodeMarginTop");
    getMarginLeftFunc =
        getFloatValueFunction(_library, "getNativeFlexNodeMarginLeft");
    setMarginLeftFunc =
        setFloatValueFunction(_library, "setNativeFlexNodeMarginLeft");
    getMarginRightFunc =
        getFloatValueFunction(_library, "getNativeFlexNodeMarginRight");
    setMarginRightFunc =
        setFloatValueFunction(_library, "setNativeFlexNodeMarginRight");
    getMarginBottomFunc =
        getFloatValueFunction(_library, "getNativeFlexNodeMarginBottom");
    setMarginBottomFunc =
        setFloatValueFunction(_library, "setNativeFlexNodeMarginBottom");
    getPaddingTopFunc =
        getFloatValueFunction(_library, "getNativeFlexNodePaddingTop");
    setPaddingTopFunc =
        setFloatValueFunction(_library, "setNativeFlexNodePaddingTop");
    getPaddingLeftFunc =
        getFloatValueFunction(_library, "getNativeFlexNodePaddingLeft");
    setPaddingLeftFunc =
        setFloatValueFunction(_library, "setNativeFlexNodePaddingLeft");
    getPaddingRightFunc =
        getFloatValueFunction(_library, "getNativeFlexNodePaddingRight");
    setPaddingRightFunc =
        setFloatValueFunction(_library, "setNativeFlexNodePaddingRight");
    getPaddingBottomFunc =
        getFloatValueFunction(_library, "getNativeFlexNodePaddingBottom");
    setPaddingBottomFunc =
        setFloatValueFunction(_library, "setNativeFlexNodePaddingBottom");
    getBorderTopFunc =
        getFloatValueFunction(_library, "getNativeFlexNodeBorderTop");
    setBorderTopFunc =
        setFloatValueFunction(_library, "setNativeFlexNodeBorderTop");
    getBorderLeftFunc =
        getFloatValueFunction(_library, "getNativeFlexNodeBorderLeft");
    setBorderLeftFunc =
        setFloatValueFunction(_library, "setNativeFlexNodeBorderLeft");
    getBorderRightFunc =
        getFloatValueFunction(_library, "getNativeFlexNodeBorderRight");
    setBorderRightFunc =
        setFloatValueFunction(_library, "setNativeFlexNodeBorderRight");
    getBorderBottomFunc =
        getFloatValueFunction(_library, "getNativeFlexNodeBorderBottom");
    setBorderBottomFunc =
        setFloatValueFunction(_library, "setNativeFlexNodeBorderBottom");

    newFlexNodeStyleFunc =
        newNativeItemFunction(_library, "nativeFlexNodeStyleNew");
    freeFlexNodeStyleFunc =
        singleCallFunction(_library, "nativeFlexNodeStyleFree");
    setFlexNodeToStyleFunc = _library.lookupFunction<
        SetFlexNodeToStyleFuncNativeType,
        SetFlexNodeToStyleFuncDartType>("nativeSetFlexNode");
    getStyleDirectionFunc =
        getIntValueFunction(_library, "nativeFlexNodeStyleGetDirection");
    setStyleDirectionFunc =
        setIntValueFunction(_library, "nativeFlexNodeStyleSetDirection");
    getStyleFlexDirectionFunc =
        getIntValueFunction(_library, "nativeFlexNodeStyleGetFlexDirection");
    setStyleFlexDirectionFunc =
        setIntValueFunction(_library, "nativeFlexNodeStyleSetFlexDirection");
    getStyleJustifyContentFunc =
        getIntValueFunction(_library, "nativeFlexNodeStyleGetJustifyContent");
    setStyleJustifyContentFunc =
        setIntValueFunction(_library, "nativeFlexNodeStyleSetJustifyContent");
    getStyleAlignItemsFunc =
        getIntValueFunction(_library, "nativeFlexNodeStyleGetAlignItems");
    setStyleAlignItemsFunc =
        setIntValueFunction(_library, "nativeFlexNodeStyleSetAlignItems");
    getStyleAlignSelfFunc =
        getIntValueFunction(_library, "nativeFlexNodeStyleGetAlignSelf");
    setStyleAlignSelfFunc =
        setIntValueFunction(_library, "nativeFlexNodeStyleSetAlignSelf");
    getStyleAlignContentFunc =
        getIntValueFunction(_library, "nativeFlexNodeStyleGetAlignContent");
    setStyleAlignContentFunc =
        setIntValueFunction(_library, "_nativeFlexNodeStyleSetAlignContent");
    getStylePositionTypeFunc =
        getIntValueFunction(_library, "nativeFlexNodeStyleGetPositionType");
    setStylePositionTypeFunc =
        setIntValueFunction(_library, "nativeFlexNodeStyleSetPositionType");
    getStyleFlexWrapFunc =
        getIntValueFunction(_library, "nativeFlexNodeStyleGetFlexWrap");
    setStyleFlexWrapFunc =
        setIntValueFunction(_library, "nativeFlexNodeStyleSetFlexWrap");
    getStyleOverflowFunc =
        getIntValueFunction(_library, "nativeFlexNodeStyleGetOverflow");
    setStyleOverflowFunc =
        setIntValueFunction(_library, "nativeFlexNodeStyleSetOverflow");
    getStyleDisplayFunc =
        getIntValueFunction(_library, "nativeFlexNodeStyleGetDisplay");
    setStyleDisplayFunc =
        setIntValueFunction(_library, "nativeFlexNodeStyleSetDisplay");
    getStyleFlexFunc =
        getFloatValueFunction(_library, "nativeFlexNodeStyleGetFlex");
    setStyleFlexFunc =
        setFloatValueFunction(_library, "nativeFlexNodeStyleSetFlex");
    getStyleFlexGrowFunc =
        getFloatValueFunction(_library, "nativeFlexNodeStyleGetFlexGrow");
    setStyleFlexGrowFunc =
        setFloatValueFunction(_library, "nativeFlexNodeStyleSetFlexGrow");
    getStyleFlexShrinkFunc =
        getFloatValueFunction(_library, "nativeFlexNodeStyleGetFlexShrink");
    setStyleFlexShrinkFunc =
        setFloatValueFunction(_library, "nativeFlexNodeStyleSetFlexShrink");
    getStyleFlexBasisFunc =
        getFlexValueFunction(_library, "nativeFlexNodeStyleGetFlexBasis");
    setStyleFlexBasisFunc =
        setFloatValueFunction(_library, "nativeFlexNodeStyleSetFlexBasis");
    setStyleFlexBasisPercentFunc = setFloatValueFunction(
        _library, "nativeFlexNodeStyleSetFlexBasisPercent");
    setStyleFlexBasisAutoFunc =
        singleCallFunction(_library, "nativeFlexNodeStyleSetFlexBasisAuto");
    getStyleMarginFunc =
        getFlexValueWithEdgeFunction(_library, "nativeFlexNodeStyleGetMargin");
    setStyleMarginFunc =
        setFloatValueWithEdgeFunction(_library, "nativeFlexNodeStyleSetMargin");
    setStyleMarginPercentFunc = setFloatValueWithEdgeFunction(
        _library, "nativeFlexNodeStyleSetMarginPercent");
    setStyleMarginAutoFunc = setFlexValueWithEdgeFunction(
        _library, "nativeFlexNodeStyleSetMarginAuto");
    getStylePaddingFunc =
        getFlexValueWithEdgeFunction(_library, "nativeFlexNodeStyleGetPadding");
    setStylePaddingFunc = setFloatValueWithEdgeFunction(
        _library, "nativeFlexNodeStyleSetPadding");
    setStylePaddingPercentFunc = setFloatValueWithEdgeFunction(
        _library, "nativeFlexNodeStyleSetPaddingPercent");
    getStyleBorderFunc =
        getFlexValueWithEdgeFunction(_library, "nativeFlexNodeStyleGetBorder");
    setStyleBorderFunc =
        setFloatValueWithEdgeFunction(_library, "nativeFlexNodeStyleSetBorder");
    getStylePositionFunc = getFlexValueWithEdgeFunction(
        _library, "nativeFlexNodeStyleGetPosition");
    setStylePositionFunc = setFloatValueWithEdgeFunction(
        _library, "nativeFlexNodeStyleSetPosition");
    setStylePositionPercentFunc = setFloatValueWithEdgeFunction(
        _library, "nativeFlexNodeStyleSetPositionPercent");
    getStyleWidthFunc =
        getFlexValueFunction(_library, "nativeFlexNodeStyleGetWidth");
    setStyleWidthFunc =
        setFloatValueFunction(_library, "nativeFlexNodeStyleSetWidth");
    setStyleWidthPercentFunc =
        setFloatValueFunction(_library, "nativeFlexNodeStyleSetWidthPercent");
    setStyleWidthAuto =
        singleCallFunction(_library, "nativeFlexNodeStyleSetWidthAuto");
    getStyleHeightFunc =
        getFlexValueFunction(_library, "nativeFlexNodeStyleGetHeight");
    setStyleHeightFunc =
        setFloatValueFunction(_library, "nativeFlexNodeStyleSetHeight");
    setStyleHeightPercentFunc =
        setFloatValueFunction(_library, "nativeFlexNodeStyleSetHeightPercent");
    setStyleHeightAuto =
        singleCallFunction(_library, "nativeFlexNodeStyleSetHeightAuto");
    getStyleMinWidthFunc =
        getFlexValueFunction(_library, "nativeFlexNodeStyleGetMinWidth");
    setStyleMinWidthFunc =
        setFloatValueFunction(_library, "nativeFlexNodeStyleSetMinWidth");
    setStyleMinWidthPercentFunc = setFloatValueFunction(
        _library, "nativeFlexNodeStyleSetMinWidthPercent");
    getStyleMinHeightFunc =
        getFlexValueFunction(_library, "nativeFlexNodeStyleGetMinHeight");
    setStyleMinHeightFunc =
        setFloatValueFunction(_library, "nativeFlexNodeStyleSetMinHeight");
    setStyleMinHeightPercentFunc = setFloatValueFunction(
        _library, "nativeFlexNodeStyleSetMinHeightPercent");
    getStyleMaxWidthFunc =
        getFlexValueFunction(_library, "nativeFlexNodeStyleGetMaxWidth");
    setStyleMaxWidthFunc =
        setFloatValueFunction(_library, "nativeFlexNodeStyleSetMaxWidth");
    setStyleMaxWidthPercentFunc = setFloatValueFunction(
        _library, "nativeFlexNodeStyleSetMaxWidthPercent");
    getStyleMaxHeightFunc =
        getFlexValueFunction(_library, "nativeFlexNodeStyleGetMaxHeight");
    setStyleMaxHeightFunc =
        setFloatValueFunction(_library, "nativeFlexNodeStyleSetMaxHeight");
    setStyleMaxHeightPercentFunc = setFloatValueFunction(
        _library, "nativeFlexNodeStyleSetMaxHeightPercent");
    getStyleAspectRatioFunc =
        getFloatValueFunction(_library, "nativeFlexNodeStyleGetAspectRatio");
    setStyleAspectRatioFunc =
        setFloatValueFunction(_library, "nativeFlexNodeStyleSetAspectRatio");
  }

  static NewNativeItemFuncDartType newNativeItemFunction(
      DynamicLibrary library, String funcName) {
    return library.lookupFunction<NewNativeItemFuncNativeType,
        NewNativeItemFuncDartType>(funcName);
  }

  static SingleCallFuncDartType singleCallFunction(
      DynamicLibrary library, String funcName) {
    return library.lookupFunction<SingleCallFuncNativeType,
        SingleCallFuncDartType>(funcName);
  }

  static SetIntValueFuncDartType setIntValueFunction(
      DynamicLibrary library, String funcName) {
    return library.lookupFunction<SetIntValueFuncNativeType,
        SetIntValueFuncDartType>(funcName);
  }

  static GetIntValueFuncDartType getIntValueFunction(
      DynamicLibrary library, String funcName) {
    return library.lookupFunction<GetIntValueFuncNativeType,
        GetIntValueFuncDartType>(funcName);
  }

  static DetFloatValueFuncDartType setFloatValueFunction(
      DynamicLibrary library, String funcName) {
    return library.lookupFunction<SetFloatValueFuncNativeType,
        DetFloatValueFuncDartType>(funcName);
  }

  static GetFloatValueFuncDartType getFloatValueFunction(
      DynamicLibrary library, String funcName) {
    return library.lookupFunction<GetFloatValueFuncNativeType,
        GetFloatValueFuncDartType>(funcName);
  }

  static SetFloatValueWithEdgeFuncDartType setFloatValueWithEdgeFunction(
      DynamicLibrary library, String funcName) {
    return library.lookupFunction<SetFloatValueWithEdgeFuncNativeType,
        SetFloatValueWithEdgeFuncDartType>(funcName);
  }

  static GetFlexValueFuncDartType getFlexValueFunction(
      DynamicLibrary library, String funcName) {
    return library.lookupFunction<GetFlexValueFuncNativeType,
        GetFlexValueFuncDartType>(funcName);
  }

  static GetFlexValueWithEdgeFuncDartType getFlexValueWithEdgeFunction(
      DynamicLibrary library, String funcName) {
    return library.lookupFunction<GetFlexValueWithEdgeFuncNativeType,
        GetFlexValueWithEdgeFuncDartType>(funcName);
  }

  static SetFlexValueWithEdgeFuncDartType setFlexValueWithEdgeFunction(
      DynamicLibrary library, String funcName) {
    return library.lookupFunction<SetFlexValueWithEdgeFuncNativeType,
        SetFlexValueWithEdgeFuncDartType>(funcName);
  }
}

class NodeApi {
  static final HashMap _nodeMap = HashMap<int, FlexNode>();
  final int nodePtr;

  NodeApi(FlexNode flexNode) : nodePtr = flexNode.nativePtr {
    _nodeMap[flexNode.nativePtr] = flexNode;
  }

  static Future<dynamic> initBridge() async {
    var measureFunc = Pointer.fromFunction<FlexNodeMeasureFuncNativeType>(
        sFlexNodeMeasure, 0);
    _FlexBoxFFIManager.instance
        .registerMeasureFunc(ExportFunctionType.measureFunc.index, measureFunc);

    var nodeFloatFiledGetterFunc =
        Pointer.fromFunction<NodeFloatFiledGetter>(sGetNodeFloatFiled, 0.0);
    _FlexBoxFFIManager.instance.registerFloatGetterFunc(
        ExportFunctionType.floatFiledGetter.index, nodeFloatFiledGetterFunc);

    var nodeIntFiledGetterFunc =
        Pointer.fromFunction<NodeIntFiledGetter>(sGetNodeIntFiled, 0);
    _FlexBoxFFIManager.instance.registerIntGetterFunc(
        ExportFunctionType.intFiledGetter.index, nodeIntFiledGetterFunc);

    var nodeFloatFiledSetterFunc =
        Pointer.fromFunction<NodeFloatFiledSetter>(sSetNodeFloatFiled);
    _FlexBoxFFIManager.instance.registerFloatSetterFunc(
        ExportFunctionType.floatFiledSetter.index, nodeFloatFiledSetterFunc);

    var nodeIntFiledSetterFunc =
        Pointer.fromFunction<NodeIntFiledSetter>(sSetNodeIntFiled);
    _FlexBoxFFIManager.instance.registerIntSetterFunc(
        ExportFunctionType.intFiledSetter.index, nodeIntFiledSetterFunc);
  }

  static int newFlexNode() {
    return _FlexBoxFFIManager.instance.newFlexNodeFunc();
  }

  static void freeFlexNode(int nodeId) {
    _FlexBoxFFIManager.instance.freeFlexNodeFunc(nodeId);
    _nodeMap.remove(nodeId);
  }

  void insertChild(int childPtr, int index) {
    _FlexBoxFFIManager.instance
        .insertFlexNodeChildFunc(nodePtr, childPtr, index);
  }

  void removeChild(int childPtr) {
    _FlexBoxFFIManager.instance.removeFlexNodeChildFunc(nodePtr, childPtr);
  }

  void calculateLayout(
      double width, double height, List<int> childNodesPtr, int direction) {
    var nativeChildNodesPtr = Pointer<Int64>.fromAddress(0);
    if (childNodesPtr.isNotEmpty) {
      nativeChildNodesPtr =
          allocate<Int64>(childNodesPtr.length * sizeOf<Int64>());

      for (var i = 0; i < childNodesPtr.length; i++) {
        nativeChildNodesPtr[i] = childNodesPtr[i];
      }
    }

    _FlexBoxFFIManager.instance.calculateLayoutFunc(nodePtr, width, height,
        nativeChildNodesPtr, childNodesPtr.length, direction);
  }

  void markNodeDirty() {
    _FlexBoxFFIManager.instance.markDirtyFunc(nodePtr);
  }

  void markNodeLayoutSeen() {
    _FlexBoxFFIManager.instance.markLayoutSeenFunc(nodePtr);
  }

  void resetNode() {
    _FlexBoxFFIManager.instance.resetFunc(nodePtr);
  }

  void markNodeHasNewLayout() {
    _FlexBoxFFIManager.instance.markHasNewLayoutFunc(nodePtr);
  }

  bool isNodeDirty() {
    return _FlexBoxFFIManager.instance.isNodeDirtyFunc(nodePtr) != 0;
  }

  bool hasNewLayout() {
    return _FlexBoxFFIManager.instance.hasNewLayoutFunc(nodePtr) != 0;
  }

  void setHadMeasureFunc(bool hasMeasureFunc) {
    _FlexBoxFFIManager.instance
        .setHasMeasureFunc(nodePtr, hasMeasureFunc ? 1 : 0);
  }

  void setHasBaselineFunc(bool hasBaselineFunc) {
    _FlexBoxFFIManager.instance
        .setHasBaselineFunc(nodePtr, hasBaselineFunc ? 1 : 0);
  }

  double getNodeWidth() => _FlexBoxFFIManager.instance.getWidthFunc(nodePtr);

  double getNodeHeight() => _FlexBoxFFIManager.instance.getHeightFunc(nodePtr);

  double getNodeTop() => _FlexBoxFFIManager.instance.getTopFunc(nodePtr);

  double getNodeBottom() => _FlexBoxFFIManager.instance.getBottomFunc(nodePtr);

  double getNodeLeft() => _FlexBoxFFIManager.instance.getLeftFunc(nodePtr);

  double getNodeRight() => _FlexBoxFFIManager.instance.getRightFunc(nodePtr);

  double getMarginNodeTop() =>
      _FlexBoxFFIManager.instance.getMarginTopFunc(nodePtr);

  double getMarginNodeBottom() =>
      _FlexBoxFFIManager.instance.getMarginBottomFunc(nodePtr);

  double getMarginNodeLeft() =>
      _FlexBoxFFIManager.instance.getMarginLeftFunc(nodePtr);

  double getMarginNodeRight() =>
      _FlexBoxFFIManager.instance.getMarginRightFunc(nodePtr);

  double getPaddingNodeTop() =>
      _FlexBoxFFIManager.instance.getPaddingTopFunc(nodePtr);

  double getPaddingNodeBottom() =>
      _FlexBoxFFIManager.instance.getPaddingBottomFunc(nodePtr);

  double getPaddingNodeLeft() =>
      _FlexBoxFFIManager.instance.getPaddingLeftFunc(nodePtr);

  double getPaddingNodeRight() =>
      _FlexBoxFFIManager.instance.getPaddingRightFunc(nodePtr);

  double getBorderNodeTop() =>
      _FlexBoxFFIManager.instance.getBorderTopFunc(nodePtr);

  double getBorderNodeBottom() =>
      _FlexBoxFFIManager.instance.getBorderBottomFunc(nodePtr);

  double getBorderNodeLeft() =>
      _FlexBoxFFIManager.instance.getBorderLeftFunc(nodePtr);

  double getBorderNodeRight() =>
      _FlexBoxFFIManager.instance.getBorderRightFunc(nodePtr);

  void setNodeTop(double value) =>
      _FlexBoxFFIManager.instance.setTopFunc(nodePtr, value);

  void setNodeBottom(double value) =>
      _FlexBoxFFIManager.instance.setBottomFunc(nodePtr, value);

  void setNodeLeft(double value) =>
      _FlexBoxFFIManager.instance.setLeftFunc(nodePtr, value);

  void setNodeRight(double value) =>
      _FlexBoxFFIManager.instance.setRightFunc(nodePtr, value);

  void setMarginNodeTop(double value) =>
      _FlexBoxFFIManager.instance.setMarginTopFunc(nodePtr, value);

  void setMarginNodeBottom(double value) =>
      _FlexBoxFFIManager.instance.setMarginBottomFunc(nodePtr, value);

  void setMarginNodeLeft(double value) =>
      _FlexBoxFFIManager.instance.setMarginLeftFunc(nodePtr, value);

  void setMarginNodeRight(double value) =>
      _FlexBoxFFIManager.instance.setMarginRightFunc(nodePtr, value);

  void setPaddingNodeTop(double value) =>
      _FlexBoxFFIManager.instance.setPaddingTopFunc(nodePtr, value);

  void setPaddingNodeBottom(double value) =>
      _FlexBoxFFIManager.instance.setPaddingBottomFunc(nodePtr, value);

  void setPaddingNodeLeft(double value) =>
      _FlexBoxFFIManager.instance.setPaddingLeftFunc(nodePtr, value);

  void setPaddingNodeRight(double value) =>
      _FlexBoxFFIManager.instance.setPaddingRightFunc(nodePtr, value);

  void setBorderNodeTop(double value) =>
      _FlexBoxFFIManager.instance.setBorderTopFunc(nodePtr, value);

  void setBorderNodeBottom(double value) =>
      _FlexBoxFFIManager.instance.setBorderBottomFunc(nodePtr, value);

  void setBorderNodeLeft(double value) =>
      _FlexBoxFFIManager.instance.setBorderLeftFunc(nodePtr, value);

  void setBorderNodeRight(double value) =>
      _FlexBoxFFIManager.instance.setBorderRightFunc(nodePtr, value);
}

double sGetNodeFloatFiled(int nodeId, int filedTypeVal) {
  var node = NodeApi._nodeMap[nodeId];
  if (node != null) {
    var filedType = FiledType.values[filedTypeVal];
    return node.getAttrByFiledType(filedType);
  }
  return 0;
}

void sSetNodeFloatFiled(int nodeId, int filedTypeVal, double value) {
  var node = NodeApi._nodeMap[nodeId];
  if (node != null) {
    var filedType = FiledType.values[filedTypeVal];
    return node.setAttrByFiledType(filedType, value);
  }
}

int sGetNodeIntFiled(int nodeId, int filedTypeVal) {
  var node = NodeApi._nodeMap[nodeId];
  if (node != null) {
    var filedType = FiledType.values[filedTypeVal];
    return node.getAttrByFiledType(filedType);
  }
  return 0;
}

void sSetNodeIntFiled(int nodeId, int filedTypeVal, int value) {
  var node = NodeApi._nodeMap[nodeId];
  if (node != null) {
    var filedType = FiledType.values[filedTypeVal];
    return node.setAttrByFiledType(filedType, value);
  }
}

int sFlexNodeMeasure(
    int nodeId, double width, int widthMode, double height, int heightMode) {
  var node = NodeApi._nodeMap[nodeId];
  if (node != null) {
    return node.measure(width, widthMode, height, heightMode);
  }

  return 0;
}

class NodeStyleApi {
  int nodeStyleId;
  NodeStyleApi(this.nodeStyleId);

  static int newFlexNodeStyle() =>
      _FlexBoxFFIManager.instance.newFlexNodeStyleFunc();

  static void freeFlexNodeStyle(int nodeId) =>
      _FlexBoxFFIManager.instance.freeFlexNodeStyleFunc(nodeId);

  void setFlexNode(int nodePtr) =>
      _FlexBoxFFIManager.instance.setFlexNodeToStyleFunc(nodeStyleId, nodePtr);

  int getStyleDirection() =>
      _FlexBoxFFIManager.instance.getStyleDirectionFunc(nodeStyleId);

  void setStyleDirection(int direction) =>
      _FlexBoxFFIManager.instance.setStyleDirectionFunc(nodeStyleId, direction);

  int getStyleFlexDirection() =>
      _FlexBoxFFIManager.instance.getStyleFlexDirectionFunc(nodeStyleId);

  void setStyleFlexDirection(int flexDirection) => _FlexBoxFFIManager.instance
      .setStyleFlexDirectionFunc(nodeStyleId, flexDirection);

  int getStyleJustifyContent() =>
      _FlexBoxFFIManager.instance.getStyleJustifyContentFunc(nodeStyleId);

  void setStyleJustifyContent(int justifyContent) => _FlexBoxFFIManager.instance
      .setStyleJustifyContentFunc(nodeStyleId, justifyContent);

  int getStyleAlignItems() =>
      _FlexBoxFFIManager.instance.getStyleAlignItemsFunc(nodeStyleId);

  void setStyleAlignItems(int alignItems) => _FlexBoxFFIManager.instance
      .setStyleAlignItemsFunc(nodeStyleId, alignItems);

  int getStyleAlignSelf() =>
      _FlexBoxFFIManager.instance.getStyleAlignSelfFunc(nodeStyleId);

  void setStyleAlignSelf(int alignSelf) =>
      _FlexBoxFFIManager.instance.setStyleAlignSelfFunc(nodeStyleId, alignSelf);

  int getStyleAlignContent() =>
      _FlexBoxFFIManager.instance.getStyleAlignContentFunc(nodeStyleId);

  void setStyleAlignContent(int alignContent) => _FlexBoxFFIManager.instance
      .setStyleAlignContentFunc(nodeStyleId, alignContent);

  int getStylePositionType() =>
      _FlexBoxFFIManager.instance.getStylePositionTypeFunc(nodeStyleId);

  void setStylePositionType(int positionType) => _FlexBoxFFIManager.instance
      .setStylePositionTypeFunc(nodeStyleId, positionType);

  int getStyleFlexWrap() =>
      _FlexBoxFFIManager.instance.getStyleFlexWrapFunc(nodeStyleId);

  void setStyleFlexWrap(int flexWrap) =>
      _FlexBoxFFIManager.instance.setStyleFlexWrapFunc(nodeStyleId, flexWrap);

  int getStyleOverflow() =>
      _FlexBoxFFIManager.instance.getStyleOverflowFunc(nodeStyleId);

  void setStyleOverflow(int overflow) =>
      _FlexBoxFFIManager.instance.setStyleOverflowFunc(nodeStyleId, overflow);

  int getStyleDisplay() =>
      _FlexBoxFFIManager.instance.getStyleDisplayFunc(nodeStyleId);

  void setStyleDisplay(int display) =>
      _FlexBoxFFIManager.instance.setStyleDisplayFunc(nodeStyleId, display);

  double getStyleFlex() =>
      _FlexBoxFFIManager.instance.getStyleFlexFunc(nodeStyleId);

  void setStyleFlex(double flex) =>
      _FlexBoxFFIManager.instance.setStyleFlexFunc(nodeStyleId, flex);

  double getStyleFlexGrow() =>
      _FlexBoxFFIManager.instance.getStyleFlexGrowFunc(nodeStyleId);

  void setStyleFlexGrow(double flexGrow) =>
      _FlexBoxFFIManager.instance.setStyleFlexGrowFunc(nodeStyleId, flexGrow);

  double getStyleFlexShrink() =>
      _FlexBoxFFIManager.instance.getStyleFlexGrowFunc(nodeStyleId);

  void setStyleFlexShrink(double flexShrink) => _FlexBoxFFIManager.instance
      .setStyleFlexShrinkFunc(nodeStyleId, flexShrink);

  Pointer<FlexValueNative> getStyleFlexBasis() =>
      _FlexBoxFFIManager.instance.getStyleFlexBasisFunc(nodeStyleId);

  void setStyleFlexBasis(double flexBasis) =>
      _FlexBoxFFIManager.instance.setStyleFlexBasisFunc(nodeStyleId, flexBasis);

  void setStyleFlexBasisPercent(double flexBasisPercent) =>
      _FlexBoxFFIManager.instance
          .setStyleFlexBasisPercentFunc(nodeStyleId, flexBasisPercent);

  void setStyleFlexBasisAuto() =>
      _FlexBoxFFIManager.instance.setStyleFlexBasisAutoFunc(nodeStyleId);

  Pointer<FlexValueNative> getStyleMargin(int edge) =>
      _FlexBoxFFIManager.instance.getStyleMarginFunc(nodeStyleId, edge);

  void setStyleMargin(int edge, double margin) =>
      _FlexBoxFFIManager.instance.setStyleMarginFunc(nodeStyleId, edge, margin);

  void setStyleMarginPercent(int edge, double marginPercent) =>
      _FlexBoxFFIManager.instance
          .setStyleMarginPercentFunc(nodeStyleId, edge, marginPercent);

  void setStyleMarginAuto(int edge) =>
      _FlexBoxFFIManager.instance.setStyleMarginAutoFunc(nodeStyleId, edge);

  Pointer<FlexValueNative> getStylePadding(int edge) =>
      _FlexBoxFFIManager.instance.getStylePaddingFunc(nodeStyleId, edge);

  void setStylePadding(int edge, double padding) => _FlexBoxFFIManager.instance
      .setStylePaddingFunc(nodeStyleId, edge, padding);

  void setStylePaddingPercent(int edge, double paddingPercent) =>
      _FlexBoxFFIManager.instance
          .setStylePaddingPercentFunc(nodeStyleId, edge, paddingPercent);

  Pointer<FlexValueNative> getStyleBorder(int edge) =>
      _FlexBoxFFIManager.instance.getStyleBorderFunc(nodeStyleId, edge);

  void setStyleBorder(int edge, double border) =>
      _FlexBoxFFIManager.instance.setStyleBorderFunc(nodeStyleId, edge, border);

  Pointer<FlexValueNative> getStylePosition(int edge) =>
      _FlexBoxFFIManager.instance.getStylePositionFunc(nodeStyleId, edge);

  void setStylePosition(int edge, double position) =>
      _FlexBoxFFIManager.instance
          .setStylePositionFunc(nodeStyleId, edge, position);

  void setStylePositionPercent(int edge, double position) =>
      _FlexBoxFFIManager.instance
          .setStylePositionPercentFunc(nodeStyleId, edge, position);

  Pointer<FlexValueNative> getStyleWidth() =>
      _FlexBoxFFIManager.instance.getStyleWidthFunc(nodeStyleId);

  void setStyleWidth(double width) =>
      _FlexBoxFFIManager.instance.setStyleWidthFunc(nodeStyleId, width);

  void setStyleWidthPercent(double width) =>
      _FlexBoxFFIManager.instance.setStyleWidthPercentFunc(nodeStyleId, width);

  void setStyleWidthAuto() =>
      _FlexBoxFFIManager.instance.setStyleWidthAuto(nodeStyleId);

  Pointer<FlexValueNative> getStyleHeight() =>
      _FlexBoxFFIManager.instance.getStyleHeightFunc(nodeStyleId);

  void setStyleHeight(double height) =>
      _FlexBoxFFIManager.instance.setStyleHeightFunc(nodeStyleId, height);

  void setStyleHeightPercent(double height) => _FlexBoxFFIManager.instance
      .setStyleHeightPercentFunc(nodeStyleId, height);

  void setStyleHeightAuto() =>
      _FlexBoxFFIManager.instance.setStyleHeightAuto(nodeStyleId);

  Pointer<FlexValueNative> getStyleMinWidth() =>
      _FlexBoxFFIManager.instance.getStyleMinWidthFunc(nodeStyleId);

  void setStyleMinWidth(double minWidth) =>
      _FlexBoxFFIManager.instance.setStyleMinWidthFunc(nodeStyleId, minWidth);

  void setStyleMinWidthPercent(double minWidth) => _FlexBoxFFIManager.instance
      .setStyleMinWidthPercentFunc(nodeStyleId, minWidth);

  Pointer<FlexValueNative> getStyleMinHeight() =>
      _FlexBoxFFIManager.instance.getStyleMinHeightFunc(nodeStyleId);

  void setStyleMinHeight(double minHeight) =>
      _FlexBoxFFIManager.instance.setStyleMinHeightFunc(nodeStyleId, minHeight);

  void setStyleMinHeightPercent(double minHeight) => _FlexBoxFFIManager.instance
      .setStyleMinHeightPercentFunc(nodeStyleId, minHeight);

  Pointer<FlexValueNative> getStyleMaxWidth() =>
      _FlexBoxFFIManager.instance.getStyleMaxWidthFunc(nodeStyleId);

  void setStyleMaxWidth(double maxWidth) =>
      _FlexBoxFFIManager.instance.setStyleMaxWidthFunc(nodeStyleId, maxWidth);

  void setStyleMaxWidthPercent(double maxWidth) => _FlexBoxFFIManager.instance
      .setStyleMaxWidthPercentFunc(nodeStyleId, maxWidth);

  Pointer<FlexValueNative> getStyleMaxHeight() =>
      _FlexBoxFFIManager.instance.getStyleMaxHeightFunc(nodeStyleId);

  void setStyleMaxHeight(double maxHeight) =>
      _FlexBoxFFIManager.instance.setStyleMaxHeightFunc(nodeStyleId, maxHeight);

  void setStyleMaxHeightPercent(double maxHeight) => _FlexBoxFFIManager.instance
      .setStyleMaxHeightPercentFunc(nodeStyleId, maxHeight);

  double getStyleAspectRatio() =>
      _FlexBoxFFIManager.instance.getStyleAspectRatioFunc(nodeStyleId);

  void setStyleAspectRatio(double aspectRatio) => _FlexBoxFFIManager.instance
      .setStyleAspectRatioFunc(nodeStyleId, aspectRatio);
}
