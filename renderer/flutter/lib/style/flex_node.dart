import '../util.dart';
import 'flex_define.dart';
import 'flex_node_style.dart';

typedef FlexMeasureFunc = int Function(FlexNodeAPI node, double width,
    FlexMeasureMode widthMode, double height, FlexMeasureMode heightMode);

abstract class FlexNodeAPI<T> {
  FlexNodeAPI();

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

  set wrap(FlexWrap flexWrap);

  set flex(double flex);

  set display(FlexDisplay display);

  double get flexGrow;

  set flexGrow(double flexGrow);

  double get flexShrink;

  set flexShrink(double flexShrink);

  double get flexBasis;

  set flexBasis(double flexBasis);

  double getMargin(FlexStyleEdge spacingType);

  void setMargin(FlexStyleEdge spacingType, double margin);

  double getPadding(FlexStyleEdge spacingType);

  void setPadding(FlexStyleEdge spacingType, double padding);

  double getBorder(FlexStyleEdge spacingType);

  void setBorder(FlexStyleEdge spacingType, double border);

  double getPosition(FlexStyleEdge spacingType);

  void setPosition(FlexStyleEdge spacingType, double position);

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
  late FlexNodeStyle _flexNodeStyle;

  static const int kMarginIndex = 1;
  static const int kPaddingIndex = 2;
  static const int kBorderIndex = 4;

  double _width = double.nan;
  double _height = double.nan;
  double _top = double.nan;
  double _left = double.nan;

  dynamic _data;

  int get id => 0;

  FlexNode() {
    _flexNodeStyle = FlexNodeStyle();
    reset();
  }

  @override
  double getBorder(FlexStyleEdge spacingType) {
    return _flexNodeStyle.getBorder(spacingType).value;
  }

  // ignore: always_declare_return_types, type_annotate_public_apis
  get data => _data;

  set data(dynamic data) => {_data = data};

  double get flexBasis => style.flexBasis;

  set flexBasis(double flexBasis) => {style.flexBasis = flexBasis};

  FlexNodeStyle get style => _flexNodeStyle;

  @override
  void reset() {
    styleDirection = FlexDirection.ltr;
    styleCssDirection = FlexCSSDirection.column;
    justifyContent = FlexJustify.flexStart;
    alignContent = FlexAlign.flexStart;
    alignItems = FlexAlign.stretch;
    alignSelf = FlexAlign.auto;
    positionType = FlexPositionType.relative;
    wrap = FlexWrap.noWrap;
    overflow = FlexOverflow.visible;
    flexGrow = 0;
    flexShrink = 0;
    flexBasis = undefined;

    _width = double.nan;
    _height = double.nan;
    _top = double.nan;
    _left = double.nan;
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
  double getMargin(FlexStyleEdge spacingType) {
    return _flexNodeStyle.getMargin(spacingType).value;
  }

  @override
  void setMargin(FlexStyleEdge spacingType, double margin) {
    // 注意，设置宽高margin不直接改变flex node的属性值，在native层cssLayout后属性值由底层传上来设置
    _flexNodeStyle.setMargin(spacingType, margin);
  }

  @override
  double getPadding(FlexStyleEdge spacingType) {
    return _flexNodeStyle.getPadding(spacingType).value;
  }

  @override
  void setPadding(FlexStyleEdge spacingType, double padding) {
    // 注意，设置宽高padding不直接改变flex node的属性值，在native层cssLayout后属性值由底层传上来设置
    _flexNodeStyle.setPadding(spacingType, padding);
  }

  @override
  void setBorder(FlexStyleEdge spacingType, double border) {
    _flexNodeStyle.setBorder(spacingType, border);
  }

  @override
  double getPosition(FlexStyleEdge spacingType) {
    return _flexNodeStyle.getPosition(spacingType).value;
  }

  @override
  void setPosition(FlexStyleEdge spacingType, double position) {
    _flexNodeStyle.setPosition(spacingType, position);
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
}
