import '../util.dart';
import 'flex_define.dart';
import 'flex_value.dart';

class FlexNodeStyle {
  FlexDirection _direction = FlexDirection.inherit;
  FlexCSSDirection _flexCSSDirection = FlexCSSDirection.row;
  FlexJustify _justifyContent = FlexJustify.flexStart;
  FlexAlign _alignItems = FlexAlign.auto;
  FlexAlign _alignSelf = FlexAlign.auto;
  FlexAlign _alignContent = FlexAlign.auto;
  FlexPositionType _positionType = FlexPositionType.relative;
  FlexWrap _flexWrap = FlexWrap.noWrap;
  FlexOverflow _overflow = FlexOverflow.visible;
  FlexDisplay _display = FlexDisplay.displayNode;

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

  final _margin = List.filled(FlexStyleEdge.all.index + 1, 0.0);
  final _padding = List.filled(FlexStyleEdge.all.index + 1, 0.0);
  final _border = List.filled(FlexStyleEdge.all.index + 1, 0.0);
  final _position = List.filled(FlexStyleEdge.all.index + 1, 0.0);

  @override
  String toString() {
    var buffer = StringBuffer();
    buffer.write("style: {");
    buffer.write(
        "flex-direction: ${flexCSSDirection.toString().toLowerCase()}, ");

    if (flexGrow != 0) buffer.write("flex-grow: $flexGrow, ");

    if (flexBasis != undefined) buffer.write("flex-basis: $flexBasis, ");

    if (flexShrink != 0) buffer.write("flex-shrink: $flexShrink, ");

    if (justifyContent != FlexJustify.flexStart) {
      buffer.write(
          "justify_content: ${enumValueToString(justifyContent).toLowerCase()}, ");
    }

    if (alignContent != FlexAlign.flexStart) {
      buffer.write(
          "align_content: ${enumValueToString(alignContent).toLowerCase()}, ");
    }

    if (alignItems != FlexAlign.stretch) {
      buffer.write(
          "align_items: ${enumValueToString(alignItems).toLowerCase()}, ");
    }

    if (alignSelf != FlexAlign.auto) {
      buffer
          .write("align_self: ${enumValueToString(alignSelf).toLowerCase()}, ");
    }

    if (flexWrap != FlexWrap.noWrap) {
      buffer.write("wrap: ${enumValueToString(flexWrap).toLowerCase()}, ");
    }

    if (overflow != FlexOverflow.visible) {
      buffer.write("overflow: ${enumValueToString(overflow).toLowerCase()}, ");
    }

    if (positionType != FlexPositionType.relative) {
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
  }

  FlexValue get maxHeightFlex => FlexValue.point(_maxHeight);

  double get maxHeight => _maxHeight;

  set maxHeight(double value) {
    _maxHeight = value;
  }

  FlexValue get maxWidthFlex => FlexValue.point(_maxWidth);

  double get maxWidth => _maxWidth;

  set maxWidth(double value) {
    _maxWidth = value;
  }

  FlexValue get minHeightFlex => FlexValue.point(_minHeight);

  double get minHeight => _minHeight;

  set minHeight(double value) {
    _minHeight = value;
  }

  FlexValue get minWidthFlex => FlexValue.point(_minWidth);

  double get minWidth => _minWidth;

  set minWidth(double value) {
    _minWidth = value;
  }

  FlexValue get heightFlex => FlexValue.point(_height);

  double get height => _height;

  set height(double value) {
    _height = value;
  }

  FlexValue get widthFlex => FlexValue.point(_width);

  double get width => _width;

  set width(double value) {
    _width = value;
  }

  FlexValue get flexBasisFlex => FlexValue.point(_flexBasis);

  double get flexBasis => _flexBasis;

  set flexBasis(double value) {
    _flexBasis = value;
  }

  double get flexShrink => _flexShrink;

  set flexShrink(double value) {
    _flexShrink = value;
  }

  double get flexGrow => _flexGrow;

  set flexGrow(double value) {
    _flexGrow = value;
  }

  double get flex => _flex;

  set flex(double value) {
    _flex = value;
  }

  FlexDisplay get display => _display;

  set display(FlexDisplay value) {
    _display = value;
  }

  FlexOverflow get overflow => _overflow;

  set overflow(FlexOverflow value) {
    _overflow = value;
  }

  FlexWrap get flexWrap => _flexWrap;

  set flexWrap(FlexWrap value) {
    _flexWrap = value;
  }

  FlexPositionType get positionType => _positionType;

  set positionType(FlexPositionType value) {
    _positionType = value;
  }

  FlexAlign get alignContent => _alignContent;

  set alignContent(FlexAlign value) {
    _alignContent = value;
  }

  FlexAlign get alignSelf => _alignSelf;

  set alignSelf(FlexAlign value) {
    _alignSelf = value;
  }

  FlexAlign get alignItems => _alignItems;

  set alignItems(FlexAlign value) {
    _alignItems = value;
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
  }

  FlexCSSDirection get flexCSSDirection => _flexCSSDirection;

  set flexCSSDirection(FlexCSSDirection value) {
    _flexCSSDirection = value;
  }

  FlexDirection get direction => _direction;

  set direction(FlexDirection value) {
    _direction = value;
  }

  FlexValue getMargin(FlexStyleEdge edge) {
    return FlexValue.point(_margin[edge.index]);
  }

  void setMargin(FlexStyleEdge edge, double margin) {
    _margin[edge.index] = margin;
  }

  FlexValue getPadding(FlexStyleEdge edge) {
    return FlexValue.point(_padding[edge.index]);
  }

  void setPadding(FlexStyleEdge edge, double padding) {
    _padding[edge.index] = padding;
  }

  FlexValue getBorder(FlexStyleEdge edge) {
    return FlexValue.point(_border[edge.index]);
  }

  void setBorder(FlexStyleEdge edge, double border) {
    _border[edge.index] = border;
  }

  FlexValue getPosition(FlexStyleEdge edge) {
    return FlexValue.point(_position[edge.index]);
  }

  void setPosition(FlexStyleEdge edge, double position) {
    _position[edge.index] = position;
  }
}
