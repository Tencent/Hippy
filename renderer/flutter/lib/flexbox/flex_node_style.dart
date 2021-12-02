import '../common/native_holder.dart';
import '../util/enum_util.dart';
import 'flex_box_bridge.dart';
import 'flex_define.dart';
import 'flex_value.dart';

class FlexNodeStyle extends INativeHolder {
  late NodeStyleApi _nodeStyleApi;

  FlexDirection _direction = FlexDirection.INHERIT;
  FlexCSSDirection _flexCSSDirection = FlexCSSDirection.ROW;
  FlexJustify _justifyContent = FlexJustify.FLEX_START;
  FlexAlign _alignItems = FlexAlign.AUTO;
  FlexAlign _alignSelf = FlexAlign.AUTO;
  FlexAlign _alignContent = FlexAlign.AUTO;
  FlexPositionType _positionType = FlexPositionType.RELATIVE;
  FlexWrap _flexWrap = FlexWrap.NOWRAP;
  FlexOverflow _overflow = FlexOverflow.VISIBLE;
  FlexDisplay _display = FlexDisplay.DISPLAY_NONE;

  double _flex = 0;
  double _flexGrow = 0;
  double _flexShrink = 0;
  double _flexBasis = 0;
  double _width = 0;
  double _height = 0;
  double _minWidth = 0;
  double _minHeight = 0;
  double _maxWidth = 0;
  double _maxHeight = 0;
  double _aspectRadio = 0;

  final _margin = List.filled(FlexStyleEdge.EDGE_ALL.index + 1, 0.0);
  final _padding = List.filled(FlexStyleEdge.EDGE_ALL.index + 1, 0.0);
  final _border = List.filled(FlexStyleEdge.EDGE_ALL.index + 1, 0.0);
  final _position = List.filled(FlexStyleEdge.EDGE_ALL.index + 1, 0.0);

  FlexNodeStyle(int flexNodePtr)
      : super(NodeStyleApi.newFlexNodeStyle, NodeStyleApi.freeFlexNodeStyle) {
    if (nativePtr == 0) {
      throw StateError("FlexNodeStyle Failed to allocate native memory");
    }
    _nodeStyleApi = NodeStyleApi(nativePtr);
    _nodeStyleApi.setFlexNode(flexNodePtr);
  }

  @override
  String toString() {
    var buffer = StringBuffer();
    buffer.write("style: {");
    buffer.write(
        "flex-direction: ${flexCSSDirection.toString().toLowerCase()}, ");

    if (flexGrow != 0) buffer.write("flex-grow: $flexGrow, ");

    if (flexBasis != undefined) buffer.write("flex-basis: $flexBasis, ");

    if (flexShrink != 0) buffer.write("flex-shrink: $flexShrink, ");

    if (justifyContent != FlexJustify.FLEX_START) {
      buffer.write(
          "justifycontent: ${enumValueToString(justifyContent).toLowerCase()}, ");
    }

    if (alignContent != FlexAlign.FLEX_START) {
      buffer.write(
          "aligncontent: ${enumValueToString(alignContent).toLowerCase()}, ");
    }

    if (alignItems != FlexAlign.STRETCH) {
      buffer.write(
          "alignitems: ${enumValueToString(alignItems).toLowerCase()}, ");
    }

    if (alignSelf != FlexAlign.AUTO) {
      buffer
          .write("alignself: ${enumValueToString(alignSelf).toLowerCase()}, ");
    }

    if (flexWrap != FlexWrap.NOWRAP) {
      buffer.write("wrap: ${enumValueToString(flexWrap).toLowerCase()}, ");
    }

    if (overflow != FlexOverflow.VISIBLE) {
      buffer.write("overflow: ${enumValueToString(overflow).toLowerCase()}, ");
    }

    if (positionType != FlexPositionType.RELATIVE) {
      buffer.write(
          "positionType: ${enumValueToString(positionType).toLowerCase()}, ");
    }

    if (width != 0) buffer.write("width: $width, ");

    if (height != 0) buffer.write("height: $height, ");

    if (maxWidth != 0) buffer.write("max-width: $maxWidth, ");

    if (maxHeight != 0) buffer.write("max-height: $maxHeight, ");

    if (minWidth != 0) buffer.write("min-height: $minWidth, ");

    if (minHeight != 0) buffer.write("min-height: $minHeight, ");

    buffer.write("}");
    return buffer.toString();
  }

  double get aspectRadio => _aspectRadio;

  set aspectRadio(double value) {
    _aspectRadio = value;
    _nodeStyleApi.setStyleAspectRatio(value);
  }

  FlexValue get maxHeightFlex => FlexValue.point(_maxHeight);

  double get maxHeight => _maxHeight;

  set maxHeight(double value) {
    _maxHeight = value;
    _nodeStyleApi.setStyleMaxHeight(value);
  }

  // ignore: avoid_setters_without_getters
  set maxHeightPercent(double value) {
    _nodeStyleApi.setStyleMaxHeightPercent(value);
  }

  FlexValue get maxWidthFlex => FlexValue.point(_maxWidth);

  double get maxWidth => _maxWidth;

  set maxWidth(double value) {
    _maxWidth = value;
    _nodeStyleApi.setStyleMaxWidth(value);
  }

  set maxWidthPercent(double value) {
    _nodeStyleApi.setStyleMaxWidthPercent(value);
  }

  FlexValue get minHeightFlex => FlexValue.point(_minHeight);

  double get minHeight => _minHeight;

  set minHeight(double value) {
    _minHeight = value;
    _nodeStyleApi.setStyleMinHeight(value);
  }

  set minHeightPercent(double value) {
    _nodeStyleApi.setStyleMinHeightPercent(value);
  }

  FlexValue get minWidthFlex => FlexValue.point(_minWidth);

  double get minWidth => _minWidth;

  set minWidth(double value) {
    _minWidth = value;
    _nodeStyleApi.setStyleMinWidth(value);
  }

  set minWidthPercent(double value) {
    _nodeStyleApi.setStyleMinWidthPercent(value);
  }

  FlexValue get heightFlex => FlexValue.point(_height);

  double get height => _height;

  set height(double value) {
    _height = value;
    _nodeStyleApi.setStyleHeight(value);
  }

  set heightPercent(double value) {
    _nodeStyleApi.setStyleHeightPercent(value);
  }

  void setHeightAuto() {
    _nodeStyleApi.setStyleHeightAuto();
  }

  FlexValue get widthFlex => FlexValue.point(_width);

  double get width => _width;

  set width(double value) {
    _width = value;
    _nodeStyleApi.setStyleWidth(value);
  }

  set widthPercent(double value) {
    _nodeStyleApi.setStyleWidthPercent(value);
  }

  void setWidthAuto() {
    _nodeStyleApi.setStyleWidthAuto();
  }

  FlexValue get flexBasisFlex => FlexValue.point(_flexBasis);

  double get flexBasis => _flexBasis;

  set flexBasis(double value) {
    _flexBasis = value;
    _nodeStyleApi.setStyleFlexBasis(value);
  }

  set flexBasisPercent(double value) {
    _nodeStyleApi.setStyleFlexBasisPercent(value);
  }

  void setFlexBasisAuto() {
    _nodeStyleApi.setStyleFlexBasisAuto();
  }

  double get flexShrink => _flexShrink;

  set flexShrink(double value) {
    _flexShrink = value;
    _nodeStyleApi.setStyleFlexShrink(value);
  }

  double get flexGrow => _flexGrow;

  set flexGrow(double value) {
    _flexGrow = value;
    _nodeStyleApi.setStyleFlexGrow(value);
  }

  double get flex => _flex;

  set flex(double value) {
    _flex = value;
    _nodeStyleApi.setStyleFlex(value);
  }

  FlexDisplay get display => _display;

  set display(FlexDisplay value) {
    _display = value;
    _nodeStyleApi.setStyleDisplay(value.index);
  }

  FlexOverflow get overflow => _overflow;

  set overflow(FlexOverflow value) {
    _overflow = value;
    _nodeStyleApi.setStyleOverflow(value.index);
  }

  FlexWrap get flexWrap => _flexWrap;

  set flexWrap(FlexWrap value) {
    _flexWrap = value;
    _nodeStyleApi.setStyleFlexWrap(value.index);
  }

  FlexPositionType get positionType => _positionType;

  set positionType(FlexPositionType value) {
    _positionType = value;
    _nodeStyleApi.setStylePositionType(value.index);
  }

  FlexAlign get alignContent => _alignContent;

  set alignContent(FlexAlign value) {
    _alignContent = value;
    _nodeStyleApi.setStyleAlignContent(value.index);
  }

  FlexAlign get alignSelf => _alignSelf;

  set alignSelf(FlexAlign value) {
    _alignSelf = value;
    _nodeStyleApi.setStyleAlignSelf(value.index);
  }

  FlexAlign get alignItems => _alignItems;

  set alignItems(FlexAlign value) {
    _alignItems = value;
    _nodeStyleApi.setStyleAlignItems(value.index);
  }

  FlexJustify get justifyContent => _justifyContent;

  set justifyContent(FlexJustify value) {
    _justifyContent = value;
    var order = value.index;
    switch (order) {
      case 0:
        {
          //FLEX_START
          order = 1;
          break;
        }
      case 1:
        {
          //CENTER;
          order = 2;
          break;
        }
      case 2:
        {
          //FLEX_END;
          order = 3;
          break;
        }
      case 3:
        {
          //SPACE_BETWEEN;
          order = 6;
          break;
        }
      case 4:
        {
          //SPACE_AROUND;
          order = 7;
          break;
        }
      case 5:
        {
          //SPACE_EVENLY;
          order = 8;
          break;
        }
      default:
        {
          order = 1; //default FLEX_START
          break;
        }
    }
    _nodeStyleApi.setStyleJustifyContent(order);
  }

  FlexCSSDirection get flexCSSDirection => _flexCSSDirection;

  set flexCSSDirection(FlexCSSDirection value) {
    _flexCSSDirection = value;
    _nodeStyleApi.setStyleFlexDirection(value.index);
  }

  FlexDirection get direction => _direction;

  set direction(FlexDirection value) {
    _direction = value;
    _nodeStyleApi.setStyleDirection(value.index);
  }

  FlexValue getMargin(FlexStyleEdge edge) {
    return FlexValue.point(_margin[edge.index]);
  }

  void setMargin(FlexStyleEdge edge, double margin) {
    _margin[edge.index] = margin;
    _nodeStyleApi.setStyleMargin(edge.index, margin);
  }

  void setMarginPercent(FlexStyleEdge edge, double percent) {
    _nodeStyleApi.setStyleMarginPercent(edge.index, percent);
  }

  void setMarginAuto(FlexStyleEdge edge) {
    _nodeStyleApi.setStyleMarginAuto(edge.index);
  }

  FlexValue getPadding(FlexStyleEdge edge) {
    return FlexValue.point(_padding[edge.index]);
  }

  void setPadding(FlexStyleEdge edge, double padding) {
    _padding[edge.index] = padding;
    _nodeStyleApi.setStylePadding(edge.index, padding);
  }

  void setPaddingPercent(FlexStyleEdge edge, double percent) {
    _nodeStyleApi.setStylePaddingPercent(edge.index, percent);
  }

  FlexValue getBorder(FlexStyleEdge edge) {
    return FlexValue.point(_border[edge.index]);
  }

  void setBorder(FlexStyleEdge edge, double border) {
    _border[edge.index] = border;
    _nodeStyleApi.setStyleBorder(edge.index, border);
  }

  FlexValue getPosition(FlexStyleEdge edge) {
    return FlexValue.point(_position[edge.index]);
  }

  void setPosition(FlexStyleEdge edge, double position) {
    _position[edge.index] = position;
    _nodeStyleApi.setStylePosition(edge.index, position);
  }

  void setPositionPercent(FlexStyleEdge edge, double position) {
    _nodeStyleApi.setStylePositionPercent(edge.index, position);
  }
}
