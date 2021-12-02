import '../common/native_holder.dart';
import '../util/log_util.dart';
import '../util/num_util.dart';
import 'flex_box_bridge.dart';
import 'flex_define.dart';
import 'flex_node_style.dart';

typedef FlexMeasureFunc = int Function(FlexNodeAPI node, double width,
    FlexMeasureMode widthMode, double height, FlexMeasureMode heightMode);

abstract class FlexNodeAPI<T> extends INativeHolder {
  FlexNodeAPI() : super(NodeApi.newFlexNode, NodeApi.freeFlexNode);

  bool get isDirty;

  bool get hasNewLayout;

  T? get parent;

  List<T> get children;

  int get childCount;

  // ignore: avoid_setters_without_getters
  set measureFunction(FlexMeasureFunc measureFunction);

  bool get isMeasureDefined;

  FlexDirection get styleDirection;

  set styleDirection(FlexDirection direction);

  FlexCSSDirection get styleCssDirection;

  set styleCssDirection(FlexCSSDirection flexDirection);

  FlexJustify get justifyContent;

  set justifyContent(FlexJustify justifyContent);

  FlexAlign get alignItems;

  set alignItems(FlexAlign alignItems);

  FlexAlign get alignSelf;

  set alignSelf(FlexAlign alignSelf);

  FlexAlign get alignContent;

  set alignContent(FlexAlign alignContent);

  FlexPositionType get positionType;

  set positionType(FlexPositionType positionType);

  double get styleWidth;

  set styleWidth(double width);

  double get styleHeight;

  set styleHeight(double height);

  double get styleMaxWidth;

  set styleMaxWidth(double maxWidth);

  double get styleMinWidth;

  set styleMinWidth(double minWidth);

  double get styleMaxHeight;

  set styleMaxHeight(double maxHeight);

  double get styleMinHeight;

  set styleMinHeight(double minHeight);

  T getChildAt(int i);

  void addChildAt(T child, int i);

  T? removeChildAt(int i);

  int indexOf(T child);

  void calculateLayout();

  void dirty();

  void markLayoutSeen();

  bool valuesEqual(double f1, double f2);

  set wrap(FlexWrap flexWrap);

  set flex(double flex);

  set display(FlexDisplay display);

  double get flexGrow;

  set flexGrow(double flexGrow);

  double get flexShrink;

  set flexShrink(double flexShrink);

  double get flexBasis;

  set flexBasis(double flexBasis);

  double getMargin(int spacingType);

  void setMargin(int spacingType, double margin);

  double getPadding(int spacingType);

  void setPadding(int spacingType, double padding);

  double getBorder(int spacingType);

  void setBorder(int spacingType, double border);

  double getPosition(int spacingType);

  void setPosition(int spacingType, double position);

  double get layoutX;

  double get layoutY;

  double get layoutWidth;

  double get layoutHeight;

  FlexOverflow get overflow;

  set overflow(FlexOverflow overflow);

  set data(Object data);

  Object get data;

  void reset();
}

class FlexNode extends FlexNodeAPI<FlexNode> {
  FlexNode? _parent;
  final List<FlexNode> _children = [];
  late NodeApi _nodeApi;
  late FlexNodeStyle _flexNodeStyle;

  FlexMeasureFunc? _measureFunction;

  static const int marginIndex = 1;
  static const int paddingIndex = 2;
  static const int bordreIndex = 4;

  int _edgeSetFlag = 0;
  bool _hasNewLayout = true;
  double _width = double.nan;
  double _height = double.nan;
  double _top = double.nan;
  double _left = double.nan;
  double _bottom = double.nan;
  double _right = double.nan;
  double _marginLeft = 0;
  double _marginTop = 0;
  double _marginRight = 0;
  double _marginBottom = 0;
  double _paddingLeft = 0;
  double _paddingTop = 0;
  double _paddingRight = 0;
  double _paddingBottom = 0;
  double _borderLeft = 0;
  double _borderTop = 0;
  double _borderRight = 0;
  double _borderBottom = 0;

  dynamic _data;

  int get id => 0;

  FlexNode() {
    if (nativePtr == 0) {
      throw StateError("NewFlexNode failed, Failed to allocate native memory");
    }
    _nodeApi = NodeApi(this);
    _flexNodeStyle = FlexNodeStyle(nativePtr);
    reset();
  }

  @override
  bool get isMeasureDefined => _measureFunction != null;

  @override
  void addChildAt(FlexNode child, int i) {
    if (child._parent != null) {
      throw StateError("Child already has a parent, it must be removed first.");
    }

    _children.insert(i, child);
    child._parent = this;
    _nodeApi.insertChild(child.nativePtr, i);
  }

  @override
  void calculateLayout() {
    calculateLayoutInner(undefined, undefined, styleDirection);
  }

  void calculateLayoutInner(
      double width, double height, FlexDirection direction) {
    var nativeNodes = <int>[];
    var n = <FlexNode>[];
    n.add(this);
    n.addAll(_children);
    // 遍历所有子节点
    for (var i = 0; i < n.length; i++) {
      var children = n[i]._children;
      n.addAll(children);
    }

    for (var i = 0; i < n.length; i++) {
      nativeNodes.add(n[i].nativePtr);
    }
    LogUtils.i("flex_node", "calculateLayout $width, $height");
    _nodeApi.calculateLayout(width, height, nativeNodes, direction.index);
  }

  @override
  void dirty() {
    _nodeApi.markNodeDirty();
  }

  @override
  double getBorder(int spacingType) {
    var edge = flexStyleEdgeFromInt(spacingType);
    switch (edge) {
      case FlexStyleEdge.EDGE_LEFT:
      case FlexStyleEdge.EDGE_START:
        return _borderLeft;
      case FlexStyleEdge.EDGE_TOP:
        return _borderTop;
      case FlexStyleEdge.EDGE_RIGHT:
      case FlexStyleEdge.EDGE_END:
        return _borderRight;
      case FlexStyleEdge.EDGE_BOTTOM:
        return _borderBottom;
      default:
        return _flexNodeStyle.getBorder(edge).value;
    }
  }

  @override
  FlexNode getChildAt(int i) {
    return _children[i];
  }

  // ignore: always_declare_return_types, type_annotate_public_apis
  get data => _data;

  set data(dynamic data) => {_data = data};

  double get flexBasis => style.flexBasis;

  set flexBasis(double flexBasis) => {style.flexBasis = flexBasis};

  FlexNodeStyle get style => _flexNodeStyle;

  @override
  bool get isDirty => _nodeApi.isNodeDirty();

  @override
  void reset() {
    if (_parent != null || (_children.isNotEmpty)) {
      return;
    }
    _nodeApi.resetNode();
    styleDirection = FlexDirection.LTR;
    styleCssDirection = FlexCSSDirection.COLUMN;
    justifyContent = FlexJustify.FLEX_START;
    alignContent = FlexAlign.FLEX_START;
    alignItems = FlexAlign.STRETCH;
    alignSelf = FlexAlign.AUTO;
    positionType = FlexPositionType.RELATIVE;
    wrap = FlexWrap.NOWRAP;
    overflow = FlexOverflow.VISIBLE;
    flexGrow = 0;
    flexShrink = 0;
    flexBasis = undefined;
    _measureFunction = null;

    _edgeSetFlag = 0;
    _hasNewLayout = true;

    _width = double.nan;
    _height = double.nan;
    _top = double.nan;
    _left = double.nan;
    _marginLeft = 0;
    _marginTop = 0;
    _marginRight = 0;
    _marginBottom = 0;
    _paddingLeft = 0;
    _paddingTop = 0;
    _paddingRight = 0;
    _paddingBottom = 0;
    _borderLeft = 0;
    _borderTop = 0;
    _borderRight = 0;
    _borderBottom = 0;
  }

  @override
  bool valuesEqual(double f1, double f2) {
    throw floatsEqual(f1, f2);
  }

  @override
  bool get hasNewLayout => _hasNewLayout;

  @override
  FlexNode? get parent => _parent;

  @override
  List<FlexNode> get children => _children;

  @override
  int get childCount => _children.length;

  @override
  set measureFunction(FlexMeasureFunc measureFunction) {
    _measureFunction = measureFunction;
    _nodeApi.setHadMeasureFunc(isMeasureDefined);
  }

  int measure(double width, int widthMode, double height, int heightMode) {
    var measureFunction = _measureFunction;
    if (measureFunction == null) {
      throw StateError("Measure function isn't defined!");
    }

    return measureFunction(this, width, flexMeasureModeFromInt(widthMode),
        height, flexMeasureModeFromInt(heightMode));
  }

  String resultToString() {
    return "layout: {${"left: $layoutX"}, ${"top: $layoutY"}, ${"width: $layoutWidth"}, ${"height: $layoutHeight"}, }";
  }

  @override
  String toString() {
    var sb = StringBuffer();
    toStringWithIndentation(sb, 0);
    return sb.toString();
  }

  void toStringWithIndentation(StringBuffer result, int level) {
    var indentation = StringBuffer();
    for (var i = 0; i < level; ++i) {
      indentation.write("__");
    }

    result.write(indentation.toString());
    result.write(_flexNodeStyle.toString());
    result.write(resultToString());

    if (childCount == 0) {
      return;
    }

    result.write(", children: [\n");
    for (var i = 0; i < childCount; i++) {
      getChildAt(i).toStringWithIndentation(result, level + 1);
      result.write("\n");
    }
    result.write("$indentation]");
  }

  @override
  FlexDirection get styleDirection {
    return _flexNodeStyle.direction;
  }

  @override
  set styleDirection(FlexDirection direction) {
    _flexNodeStyle.direction = direction;
  }

  @override
  FlexCSSDirection get styleCssDirection {
    return _flexNodeStyle.flexCSSDirection;
  }

  @override
  set styleCssDirection(FlexCSSDirection flexDirection) {
    _flexNodeStyle.flexCSSDirection = flexDirection;
  }

  @override
  FlexJustify get justifyContent {
    return _flexNodeStyle.justifyContent;
  }

  @override
  set justifyContent(FlexJustify justifyContent) {
    _flexNodeStyle.justifyContent = justifyContent;
  }

  @override
  FlexAlign get alignItems {
    return _flexNodeStyle.alignItems;
  }

  @override
  set alignItems(FlexAlign alignItems) {
    _flexNodeStyle.alignItems = alignItems;
  }

  @override
  FlexAlign get alignSelf {
    return _flexNodeStyle.alignSelf;
  }

  @override
  set alignSelf(FlexAlign alignSelf) {
    _flexNodeStyle.alignSelf = alignSelf;
  }

  @override
  FlexAlign get alignContent {
    return _flexNodeStyle.alignContent;
  }

  @override
  set alignContent(FlexAlign alignContent) {
    _flexNodeStyle.alignContent = alignContent;
  }

  @override
  FlexPositionType get positionType {
    return _flexNodeStyle.positionType;
  }

  @override
  set positionType(FlexPositionType positionType) {
    _flexNodeStyle.positionType = positionType;
  }

  @override
  double get styleWidth {
    return _flexNodeStyle.width;
  }

  @override
  set styleWidth(double width) {
    _flexNodeStyle.width = width;
  }

  @override
  double get styleHeight {
    return _flexNodeStyle.height;
  }

  @override
  set styleHeight(double height) {
    _flexNodeStyle.height = height;
  }

  @override
  double get styleMaxWidth {
    return _flexNodeStyle.maxWidth;
  }

  @override
  set styleMaxWidth(double maxWidth) {
    _flexNodeStyle.maxWidth = maxWidth;
  }

  @override
  double get styleMinWidth {
    return _flexNodeStyle.minWidth;
  }

  @override
  set styleMinWidth(double minWidth) {
    _flexNodeStyle.minWidth = minWidth;
  }

  @override
  double get styleMaxHeight {
    return _flexNodeStyle.maxHeight;
  }

  @override
  set styleMaxHeight(double maxHeight) {
    _flexNodeStyle.maxHeight = maxHeight;
  }

  @override
  double get styleMinHeight {
    return _flexNodeStyle.minHeight;
  }

  @override
  set styleMinHeight(double minHeight) {
    _flexNodeStyle.minHeight = minHeight;
  }

  @override
  FlexNode? removeChildAt(int i) {
    if (i < 0 || i >= _children.length) {
      LogUtils.i(
          "flex_node", "remove child at:$i error, length:${_children.length}");
      return null;
    }
    final child = _children.removeAt(i);
    child._parent = null;
    _nodeApi.removeChild(child.nativePtr);
    return child;
  }

  @override
  int indexOf(FlexNode child) {
    return _children.indexOf(child);
  }

  @override
  void markLayoutSeen() {
    _hasNewLayout = false;
    _nodeApi.markNodeLayoutSeen();
  }

  @override
  set wrap(FlexWrap flexWrap) {
    _flexNodeStyle.flexWrap = flexWrap;
  }

  @override
  set flex(double flex) {
    _flexNodeStyle.flex = flex;
  }

  @override
  set display(FlexDisplay display) {
    _flexNodeStyle.display = display;
  }

  @override
  double get flexGrow {
    return _flexNodeStyle.flexGrow;
  }

  @override
  set flexGrow(double flexGrow) {
    _flexNodeStyle.flexGrow = flexGrow;
  }

  @override
  double get flexShrink {
    return _flexNodeStyle.flexShrink;
  }

  @override
  set flexShrink(double flexShrink) {
    _flexNodeStyle.flexShrink = flexShrink;
  }

  @override
  double getMargin(int spacingType) {
    final edge = flexStyleEdgeFromInt(spacingType);
    switch (edge) {
      case FlexStyleEdge.EDGE_LEFT:
      case FlexStyleEdge.EDGE_START:
        return _marginLeft;
      case FlexStyleEdge.EDGE_TOP:
        return _marginTop;
      case FlexStyleEdge.EDGE_RIGHT:
      case FlexStyleEdge.EDGE_END:
        return _marginRight;
      case FlexStyleEdge.EDGE_BOTTOM:
        return _marginBottom;
      default:
        return _flexNodeStyle.getMargin(edge).value;
    }
  }

  @override
  void setMargin(int spacingType, double margin) {
    // 注意，设置宽高margin不直接改变flex node的属性值，在native层cssLayout后属性值由底层传上来设置
    _edgeSetFlag |= marginIndex;
    _flexNodeStyle.setMargin(flexStyleEdgeFromInt(spacingType), margin);
  }

  @override
  double getPadding(int spacingType) {
    final edge = flexStyleEdgeFromInt(spacingType);
    switch (edge) {
      case FlexStyleEdge.EDGE_LEFT:
      case FlexStyleEdge.EDGE_START:
        return _paddingLeft;
      case FlexStyleEdge.EDGE_TOP:
        return _paddingTop;
      case FlexStyleEdge.EDGE_RIGHT:
      case FlexStyleEdge.EDGE_END:
        return _paddingRight;
      case FlexStyleEdge.EDGE_BOTTOM:
        return _paddingBottom;
      default:
        return _flexNodeStyle.getPadding(edge).value;
    }
  }

  @override
  void setPadding(int spacingType, double padding) {
    // 注意，设置宽高padding不直接改变flex node的属性值，在native层cssLayout后属性值由底层传上来设置
    _edgeSetFlag |= paddingIndex;
    _flexNodeStyle.setPadding(flexStyleEdgeFromInt(spacingType), padding);
  }

  @override
  void setBorder(int spacingType, double border) {
    _edgeSetFlag |= bordreIndex;
    _flexNodeStyle.setBorder(flexStyleEdgeFromInt(spacingType), border);
  }

  @override
  double getPosition(int spacingType) {
    return _flexNodeStyle.getPosition(flexStyleEdgeFromInt(spacingType)).value;
  }

  @override
  void setPosition(int spacingType, double position) {
    _flexNodeStyle.setPosition(flexStyleEdgeFromInt(spacingType), position);
  }

  @override
  double get layoutX {
    return _left;
  }

  @override
  double get layoutY {
    return _top;
  }

  @override
  double get layoutWidth {
    return _width;
  }

  @override
  double get layoutHeight {
    return _height;
  }

  @override
  FlexOverflow get overflow {
    return _flexNodeStyle.overflow;
  }

  @override
  set overflow(FlexOverflow overflow) {
    _flexNodeStyle.overflow = overflow;
  }

  @override
  void free() {
    super.free();
    _flexNodeStyle.free();
  }

  dynamic getAttrByFiledType(FiledType type) {
    switch (type) {
      case FiledType.edgeSetFlagField:
        return _edgeSetFlag;
      case FiledType.hasNewLayoutField:
        return _hasNewLayout;
      case FiledType.widthFiled:
        return _width;
      case FiledType.heightField:
        return _height;
      case FiledType.leftField:
        return _left;
      case FiledType.topField:
        return _top;
      case FiledType.rightFiled:
        return _right;
      case FiledType.bottomFiled:
        return _bottom;
      case FiledType.marginLeftField:
        return _marginLeft;
      case FiledType.marginTopField:
        return _marginTop;
      case FiledType.marginRightField:
        return _marginRight;
      case FiledType.marginBottomField:
        return _marginBottom;
      case FiledType.paddingLeftField:
        return _paddingLeft;
      case FiledType.paddingTopField:
        return _paddingTop;
      case FiledType.paddingRightField:
        return _paddingRight;
      case FiledType.paddingBottomField:
        return _paddingBottom;
      case FiledType.borderLeftField:
        return _borderLeft;
      case FiledType.borderTopField:
        return _borderTop;
      case FiledType.borderRightField:
        return _borderRight;
      case FiledType.borderBottomField:
        return _borderBottom;
    }
  }

  void setAttrByFiledType(FiledType filedType, dynamic value) {
    switch (filedType) {
      case FiledType.edgeSetFlagField:
        _edgeSetFlag = value;
        break;
      case FiledType.hasNewLayoutField:
        _hasNewLayout = value == 1;
        break;
      case FiledType.widthFiled:
        _width = value;
        break;
      case FiledType.heightField:
        _height = value;
        break;
      case FiledType.leftField:
        _left = value;
        break;
      case FiledType.topField:
        _top = value;
        break;
      case FiledType.rightFiled:
        _right = value;
        break;
      case FiledType.bottomFiled:
        _bottom = value;
        break;
      case FiledType.marginLeftField:
        _marginLeft = value;
        break;
      case FiledType.marginTopField:
        _marginTop = value;
        break;
      case FiledType.marginRightField:
        _marginRight = value;
        break;
      case FiledType.marginBottomField:
        _marginBottom = value;
        break;
      case FiledType.paddingLeftField:
        _paddingLeft = value;
        break;
      case FiledType.paddingTopField:
        _paddingTop = value;
        break;
      case FiledType.paddingRightField:
        _paddingRight = value;
        break;
      case FiledType.paddingBottomField:
        _paddingBottom = value;
        break;
      case FiledType.borderLeftField:
        _borderLeft = value;
        break;
      case FiledType.borderTopField:
        _borderTop = value;
        break;
      case FiledType.borderRightField:
        _borderRight = value;
        break;
      case FiledType.borderBottomField:
        _borderBottom = value;
        break;
    }
  }
}
