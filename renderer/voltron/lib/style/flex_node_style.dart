//
// Tencent is pleased to support the open source community by making
// Hippy available.
//
// Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

import '../util.dart';
import 'flex_define.dart';
import 'flex_value.dart';

class FlexNodeStyle {
  FlexDirection direction = FlexDirection.inherit;
  FlexCSSDirection flexCSSDirection = FlexCSSDirection.row;
  FlexJustify _justifyContent = FlexJustify.flexStart;
  FlexAlign alignItems = FlexAlign.auto;
  FlexAlign alignSelf = FlexAlign.auto;
  FlexAlign alignContent = FlexAlign.auto;
  FlexPositionType positionType = FlexPositionType.relative;
  FlexWrap flexWrap = FlexWrap.noWrap;
  FlexOverflow overflow = FlexOverflow.visible;
  FlexDisplay display = FlexDisplay.displayNode;

  double flex = 0;
  double flexGrow = 0;
  double flexShrink = 0;
  double flexBasis = 0;
  double width = 0;
  double height = 0;
  double minWidth = 0;
  double minHeight = 0;
  double maxWidth = 0;
  double maxHeight = 0;
  double aspectRadio = 0;

  final _margin = List.filled(FlexStyleEdge.all.index + 1, 0.0);
  final _padding = List.filled(FlexStyleEdge.all.index + 1, 0.0);
  final _border = List.filled(FlexStyleEdge.all.index + 1, 0.0);
  final _position = List.filled(FlexStyleEdge.all.index + 1, 0.0);

  @override
  String toString() {
    var buffer = StringBuffer();
    buffer.write("style: {");
    buffer.write("flex-direction: ${flexCSSDirection.toString().toLowerCase()}, ");

    if (flexGrow != 0) buffer.write("flex-grow: $flexGrow, ");

    if (flexBasis != undefined) buffer.write("flex-basis: $flexBasis, ");

    if (flexShrink != 0) buffer.write("flex-shrink: $flexShrink, ");

    if (justifyContent != FlexJustify.flexStart) {
      buffer.write("justify_content: ${enumValueToString(justifyContent).toLowerCase()}, ");
    }

    if (alignContent != FlexAlign.flexStart) {
      buffer.write("align_content: ${enumValueToString(alignContent).toLowerCase()}, ");
    }

    if (alignItems != FlexAlign.stretch) {
      buffer.write("align_items: ${enumValueToString(alignItems).toLowerCase()}, ");
    }

    if (alignSelf != FlexAlign.auto) {
      buffer.write("align_self: ${enumValueToString(alignSelf).toLowerCase()}, ");
    }

    if (flexWrap != FlexWrap.noWrap) {
      buffer.write("wrap: ${enumValueToString(flexWrap).toLowerCase()}, ");
    }

    if (overflow != FlexOverflow.visible) {
      buffer.write("overflow: ${enumValueToString(overflow).toLowerCase()}, ");
    }

    if (positionType != FlexPositionType.relative) {
      buffer.write("positionType: ${enumValueToString(positionType).toLowerCase()}, ");
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

  FlexValue get maxHeightFlex => FlexValue.point(maxHeight);

  FlexValue get maxWidthFlex => FlexValue.point(maxWidth);

  FlexValue get minHeightFlex => FlexValue.point(minHeight);

  FlexValue get minWidthFlex => FlexValue.point(minWidth);

  FlexValue get heightFlex => FlexValue.point(height);

  FlexValue get widthFlex => FlexValue.point(width);

  FlexValue get flexBasisFlex => FlexValue.point(flexBasis);

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
