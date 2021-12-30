import 'package:flutter/material.dart';

import '../adapter.dart';
import '../common.dart';
import '../controller.dart';
import '../render.dart';
import '../util.dart';
import 'flex_define.dart';
import 'prop.dart';
import 'style_node.dart';

final TextMethodProvider _sTextMethodProvider = TextMethodProvider();
const int kDefaultTextShadowColor = 0x55000000;
const String kEllipsis = "\u2026";
const int kMaxLineCount = 100000;

mixin TextStyleNode on StyleNode {
  static const _kTag = "TextNode";

  // 文本转换后的span，组合各种css样式
  TextSpan? span;
  // 原文本
  String? _sourceText;

  // 文本基础属性
  int? _numberOfLines;
  double _fontSize = NodeProps.kDefaultFontSizeSp;
  double? _lineHeight;
  double? _letterSpacing;
  int _color = Colors.black.value;
  String? _fontFamily;
  TextAlign _textAlign = TextAlign.start;
  FontStyle _fontStyle = FontStyle.normal;
  FontWeight? _fontWeight;
  String? _whiteSpace;
  TextOverflow _textOverflow = TextOverflow.visible;

  // 文本阴影属性
  double _textShadowOffsetDx = 0;
  double _textShadowOffsetDy = 0;
  double _textShadowRadius = 1;
  int _textShadowColor = kDefaultTextShadowColor;

  // 下划线
  bool _isUnderlineTextDecorationSet = false;
  // 删除线
  bool _isLineThroughTextDecorationSet = false;

  // 系统文本缩放尺寸
  bool _enableScale = false;
  FontScaleAdapter? fontScaleAdapter;

  // 手势
  final List<String> _gestureTypes = [];

  bool get enableScale => _enableScale;

  String get _text {
    if (_whiteSpace == null ||
        _whiteSpace == 'normal' ||
        _whiteSpace == 'nowrap') {
      // 连续的空白符会被合并，换行符会被当作空白符来处理
      return _sourceText
              ?.replaceAll(RegExp(r' +'), ' ')
              .replaceAll('\n', ' ')
              .replaceAll(RegExp(r'<br\s*/?>'), ' ') ??
          '';
    }
    if (_whiteSpace == 'pre-line') {
      // 连续的空白符会被合并。在遇到换行符或者<br>元素，才换行
      return _sourceText
              ?.replaceAll(RegExp(r' +'), ' ')
              .replaceAll(RegExp(r'<br\s*/?>'), '\n') ??
          '';
    }
    if (_whiteSpace == 'pre') {
      // 连续的空白符会被保留。在遇到换行符或者<br>元素，才换行
      return _sourceText?.replaceAll(RegExp(r'<br\s*/?>'), '\n') ?? '';
    }
    return _sourceText ?? '';
  }

  static int _parseArgument(String weight) {
    return weight.length == 3 &&
            weight.endsWith("00") &&
            weight.codeUnitAt(0) <= '9'.codeUnitAt(0) &&
            weight.codeUnitAt(0) >= '1'.codeUnitAt(0)
        ? 100 * (weight.codeUnitAt(0) - '0'.codeUnitAt(0))
        : -1;
  }

  @ControllerProps(NodeProps.kFontStyle)
  // ignore: use_setters_to_change_properties
  void fontStyle(String fontStyleString) {
    var fontStyle = parseFontStyle(fontStyleString);
    if (fontStyle != _fontStyle) {
      _fontStyle = fontStyle;
    }
  }

  static FontStyle parseFontStyle(String fontStyleStr) {
    var fontStyle = FontStyle.normal;
    if ("italic" == fontStyleStr) {
      fontStyle = FontStyle.italic;
    } else if ("normal" == fontStyleStr) {
      fontStyle = FontStyle.normal;
    }

    return fontStyle;
  }

  @ControllerProps(NodeProps.kLetterSpacing)
  // ignore: use_setters_to_change_properties
  void letterSpacing(double letterSpace) {
    if (letterSpace != -1.0) {
      _letterSpacing = letterSpace;
    }
  }

  @ControllerProps(NodeProps.kColor)
  // ignore: use_setters_to_change_properties
  void color(int color) {
    _color = color;
  }

  @ControllerProps(NodeProps.kFontSize)
  // ignore: use_setters_to_change_properties
  void fontSize(double fontSize) {
    _fontSize = fontSize;
  }

  @ControllerProps(NodeProps.kFontFamily)
  // ignore: use_setters_to_change_properties
  void fontFamily(String fontFamily) {
    _fontFamily = fontFamily;
  }

  @ControllerProps(NodeProps.kFontWeight)
  void fontWeight(String weight) {
    var fontWeight = parseFontWeight(weight);

    if (fontWeight != _fontWeight) {
      _fontWeight = fontWeight;
    }
  }

  static FontWeight parseFontWeight(String weight) {
    var fontWeight = FontWeight.normal;
    if ("bold" == weight) {
      fontWeight = FontWeight.bold;
    } else if ("normal" == weight) {
      fontWeight = FontWeight.normal;
    } else {
      var fontWeightNumeric = _parseArgument(weight);
      if (fontWeightNumeric != -1) {
        if (fontWeightNumeric <= 100) {
          fontWeight = FontWeight.w100;
        } else if (fontWeightNumeric <= 200) {
          fontWeight = FontWeight.w200;
        } else if (fontWeightNumeric <= 300) {
          fontWeight = FontWeight.w300;
        } else if (fontWeightNumeric <= 400) {
          fontWeight = FontWeight.w400;
        } else if (fontWeightNumeric <= 500) {
          fontWeight = FontWeight.w500;
        } else if (fontWeightNumeric <= 600) {
          fontWeight = FontWeight.w600;
        } else if (fontWeightNumeric <= 700) {
          fontWeight = FontWeight.w700;
        } else if (fontWeightNumeric <= 800) {
          fontWeight = FontWeight.w800;
        } else {
          fontWeight = FontWeight.w900;
        }
      }
    }

    return fontWeight;
  }

  @ControllerProps(NodeProps.kTextDecorationLine)
  void textDecorationLine(String textDecorationLineString) {
    _isUnderlineTextDecorationSet = false;
    _isLineThroughTextDecorationSet = false;
    for (var textDecorationLineSubString
        in textDecorationLineString.split(" ")) {
      if ("underline" == textDecorationLineSubString) {
        _isUnderlineTextDecorationSet = true;
      } else if ("line-through" == textDecorationLineSubString) {
        _isLineThroughTextDecorationSet = true;
      }
    }
  }

  @ControllerProps(NodeProps.kPropShadowOffset)
  void textShadowOffset(VoltronMap offsetMap) {
    _textShadowOffsetDx = 0;
    _textShadowOffsetDy = 0;
    if (offsetMap.get(NodeProps.kPropShadowOffsetWidth) != null) {
      _textShadowOffsetDx = offsetMap.get(NodeProps.kPropShadowOffsetWidth);
    }
    if (offsetMap.get(NodeProps.kPropShadowOffsetHeight) != null) {
      _textShadowOffsetDy = offsetMap.get(NodeProps.kPropShadowOffsetHeight);
    }
  }

  @ControllerProps(NodeProps.kPropShadowRadius)
  void textShadowRadius(double textShadowRadius) {
    if (textShadowRadius != _textShadowRadius) {
      _textShadowRadius = textShadowRadius;
    }
  }

  @ControllerProps(NodeProps.kPropShadowColor)
  void setTextShadowColor(int textShadowColor) {
    if (textShadowColor != _textShadowColor) {
      _textShadowColor = textShadowColor;
    }
  }

  @ControllerProps(NodeProps.kLineHeight)
  void lineHeight(int lineHeight) {
    _lineHeight = (lineHeight == -1.0 ? null : lineHeight)?.toDouble();
  }

  @ControllerProps(NodeProps.kTextAlign)
  void setTextAlign(String textAlign) {
    _textAlign = parseTextAlign(textAlign);
  }

  static TextAlign parseTextAlign(String textAlign) {
    var align = TextAlign.start;
    if ("auto" == (textAlign)) {
      align = TextAlign.start;
    } else if ("left" == (textAlign)) {
      align = TextAlign.left;
    } else if ("right" == (textAlign)) {
      align = TextAlign.right;
    } else if ("center" == (textAlign)) {
      align = TextAlign.center;
    } else if ("justify" == (textAlign)) {
      align = TextAlign.justify;
    } else {
      LogUtils.e(_kTag, "Invalid textAlign: $textAlign");
    }
    return align;
  }

  @ControllerProps(NodeProps.kText)
  // ignore: use_setters_to_change_properties
  void text(String text) {
    _sourceText = text;
  }

  @ControllerProps(NodeProps.kWhiteSpace)
  // ignore: use_setters_to_change_properties
  void whiteSpace(String whiteSpace) {
    _whiteSpace = whiteSpace;
  }

  @ControllerProps(NodeProps.kTextOverflow)
  void setTextOverflow(String textOverflow) {
    _textOverflow = parseTextOverflow(textOverflow);
  }

  static TextOverflow parseTextOverflow(String textOverflow) {
    var v = TextOverflow.visible;
    if ("ellipsis" == (textOverflow)) {
      v = TextOverflow.ellipsis;
    } else if ("clip" == (textOverflow)) {
      v = TextOverflow.clip;
    } else if ('fade' == (textOverflow)) {
      v = TextOverflow.fade;
    } else {
      LogUtils.e(_kTag, "Invalid textOverflow: $textOverflow");
    }
    return v;
  }

  @ControllerProps(NodeProps.kOnClick)
  void clickEnable(bool flag) {
    if (flag) {
      _gestureTypes.add(NodeProps.kOnClick);
    }
  }

  @ControllerProps(NodeProps.kOnLongClick)
  void longClickEnable(bool flag) {
    if (flag) {
      _gestureTypes.add(NodeProps.kOnLongClick);
    }
  }

  @ControllerProps(NodeProps.kOnPressIn)
  void pressInEnable(bool flag) {
    if (flag) {
      _gestureTypes.add(NodeProps.kOnPressIn);
    }
  }

  @ControllerProps(NodeProps.kOnPressOut)
  void pressOutEnable(bool flag) {
    if (flag) {
      _gestureTypes.add(NodeProps.kOnPressOut);
    }
  }

  @ControllerProps(NodeProps.kOnTouchDown)
  void touchDownEnable(bool flag) {
    if (flag) {
      _gestureTypes.add(NodeProps.kOnTouchDown);
    }
  }

  @ControllerProps(NodeProps.kOnTouchMove)
  void touchUpEnable(bool flag) {
    if (flag) {
      _gestureTypes.add(NodeProps.kOnTouchMove);
    }
  }

  @ControllerProps(NodeProps.kOnTouchEnd)
  void touchEndEnable(bool flag) {
    if (flag) {
      _gestureTypes.add(NodeProps.kOnTouchEnd);
    }
  }

  @ControllerProps(NodeProps.kOnTouchCancel)
  void touchCancelable(bool flag) {
    if (flag) {
      _gestureTypes.add(NodeProps.kOnTouchCancel);
    }
  }

  @ControllerProps(NodeProps.kPropEnableScale)
  set enableScale(bool flag) {
    _enableScale = flag;
  }

  @ControllerProps(NodeProps.kNumberOfLines)
  void setNumberOfLines(int numberOfLines) {
    _numberOfLines = numberOfLines <= 0 ? 0 : numberOfLines;
  }

  int get childCount;

  RenderNode? getChildAt(int index);

  TextSpan createSpan({bool useChild = true}) {
    var curFontSize = _fontSize;

    var shadowList = <Shadow>[];
    if (_textShadowOffsetDx != 0 || _textShadowOffsetDy != 0) {
      shadowList.add(Shadow(
          blurRadius: _textShadowRadius,
          color: Color(_textShadowColor),
          offset: Offset(_textShadowOffsetDx, _textShadowOffsetDy)));
    }

    var childrenSpan = <TextSpan>[];

    if (useChild) {
      for (var i = 0; i < childCount; i++) {
        var node = getChildAt(i);
        if (node != null) {
          if (node is TextStyleNode) {
            var styleNode = node as TextStyleNode;
            childrenSpan.add(styleNode.createSpan(useChild: useChild));
          } else {
            throw StateError("${node.name} is not support in Text");
          }
        }
      }
    }

    var textDecoration = TextDecoration.none;
    if (_isUnderlineTextDecorationSet) {
      textDecoration = TextDecoration.underline;
    }
    if (_isLineThroughTextDecorationSet) {
      if (textDecoration != TextDecoration.none) {
        textDecoration = TextDecoration.combine(
            [TextDecoration.underline, TextDecoration.lineThrough]);
      } else {
        textDecoration = TextDecoration.lineThrough;
      }
    }

    if (!isEmpty(_text) || childrenSpan.isNotEmpty) {
      return TextSpan(
          text: _text,
          style: TextStyle(
              leadingDistribution: TextLeadingDistribution.even,
              color: Color(_color),
              letterSpacing: _letterSpacing,
              fontSize: curFontSize,
              fontStyle: _fontStyle,
              fontWeight: _fontWeight,
              fontFamily: _fontFamily,
              shadows: shadowList,
              height: _lineHeightFactor(),
              decoration: textDecoration),
          children: childrenSpan);
    }
    return TextSpan(text: "");
  }

  TextData createData(double width, FlexMeasureMode widthMode) {
    var text = span ?? TextSpan(text: "");
    return TextData(_numberOfLines ?? kMaxLineCount, text, _textAlign,
        _generateTextScale(), _textOverflow);
  }

  TextPainter createPainter(double width, FlexMeasureMode widthMode) {
    var unconstrainedWidth =
        widthMode == FlexMeasureMode.undefined || width < 0;
    var maxWidth = unconstrainedWidth ? double.infinity : width;
    var text = span ?? TextSpan(text: "");
    var painter = TextPainter(
        maxLines: _numberOfLines ?? kMaxLineCount,
        text: text,
        textDirection: TextDirection.ltr,
        textAlign: _textAlign,
        ellipsis: kEllipsis,
        textScaleFactor: _generateTextScale())
      ..layout(maxWidth: maxWidth);

    return painter;
  }

  double? _lineHeightFactor() {
    var lineHeight = _lineHeight;
    if (lineHeight == null) {
      return lineHeight;
    }
    return lineHeight / _fontSize;
  }

  double _generateTextScale() {
    var textScaleFactor = 1.0;
    if (fontScaleAdapter != null && _enableScale) {
      textScaleFactor = fontScaleAdapter?.getFontScale() ?? 1.0;
    }

    return textScaleFactor;
  }

  @override
  MethodPropProvider get provider => _sTextMethodProvider;
}

class TextMethodProvider extends StyleMethodPropProvider {
  TextMethodProvider() {
    pushMethodProp(
        NodeProps.kFontStyle,
        StyleMethodProp((consumer, value) {
          if (consumer is TextStyleNode && value is String) {
            consumer.fontStyle(value);
          }
        }, "normal"));
    pushMethodProp(
        NodeProps.kLetterSpacing,
        StyleMethodProp((consumer, value) {
          if (consumer is TextStyleNode && value is double) {
            consumer.letterSpacing(value);
          }
        }, -1.0));
    pushMethodProp(
        NodeProps.kColor,
        StyleMethodProp((consumer, value) {
          if (consumer is TextStyleNode && value is int) {
            consumer.color(value);
          }
        }, Colors.transparent.value));
    pushMethodProp(
        NodeProps.kFontSize,
        StyleMethodProp((consumer, value) {
          if (consumer is TextStyleNode && value is double) {
            consumer.fontSize(value);
          }
        }, NodeProps.kDefaultFontSizeSp));
    pushMethodProp(
        NodeProps.kNumberOfLines,
        StyleMethodProp((consumer, value) {
          if (consumer is TextStyleNode && value is int) {
            consumer.setNumberOfLines(value);
          }
        }, kMaxLineCount));
    pushMethodProp(
        NodeProps.kFontFamily,
        StyleMethodProp((consumer, value) {
          if (consumer is TextStyleNode && value is String) {
            consumer.fontFamily(value);
          }
        }, ""));
    pushMethodProp(
        NodeProps.kFontWeight,
        StyleMethodProp((consumer, value) {
          if (consumer is TextStyleNode && value is String) {
            consumer.fontWeight(value);
          }
        }, ""));
    pushMethodProp(
        NodeProps.kTextDecorationLine,
        StyleMethodProp((consumer, value) {
          if (consumer is TextStyleNode && value is String) {
            consumer.textDecorationLine(value);
          }
        }, ""));
    pushMethodProp(
        NodeProps.kPropShadowOffset,
        StyleMethodProp((consumer, value) {
          if (consumer is TextStyleNode && value is VoltronMap) {
            consumer.textShadowOffset(value);
          }
        }, null));
    pushMethodProp(
        NodeProps.kPropShadowRadius,
        StyleMethodProp((consumer, value) {
          if (consumer is TextStyleNode && value is double) {
            consumer.textShadowRadius(value);
          }
        }, 0));
    pushMethodProp(
        NodeProps.kPropShadowColor,
        StyleMethodProp((consumer, value) {
          if (consumer is TextStyleNode && value is int) {
            consumer.setTextShadowColor(value);
          }
        }, Colors.transparent.value));
    pushMethodProp(
        NodeProps.kLineHeight,
        StyleMethodProp((consumer, value) {
          if (consumer is TextStyleNode && value is int) {
            consumer.lineHeight(value);
          }
        }, -1));
    pushMethodProp(
        NodeProps.kTextAlign,
        StyleMethodProp((consumer, value) {
          if (consumer is TextStyleNode && value is String) {
            consumer.setTextAlign(value);
          }
        }, "left"));
    pushMethodProp(
        NodeProps.kText,
        StyleMethodProp((consumer, value) {
          if (consumer is TextStyleNode && value is String) {
            consumer.text(value);
          }
        }, ""));
    pushMethodProp(
        NodeProps.kTextOverflow,
        StyleMethodProp((consumer, value) {
          if (consumer is TextStyleNode && value is String) {
            consumer.setTextOverflow(value);
          }
        }, ""));
    pushMethodProp(
        NodeProps.kOnClick,
        StyleMethodProp((consumer, value) {
          if (consumer is TextStyleNode && value is bool) {
            consumer.clickEnable(value);
          }
        }, false));
    pushMethodProp(
        NodeProps.kOnLongClick,
        StyleMethodProp((consumer, value) {
          if (consumer is TextStyleNode && value is bool) {
            consumer.longClickEnable(value);
          }
        }, false));
    pushMethodProp(
        NodeProps.kOnPressIn,
        StyleMethodProp((consumer, value) {
          if (consumer is TextStyleNode && value is bool) {
            consumer.pressInEnable(value);
          }
        }, false));
    pushMethodProp(
        NodeProps.kOnPressOut,
        StyleMethodProp((consumer, value) {
          if (consumer is TextStyleNode && value is bool) {
            consumer.pressOutEnable(value);
          }
        }, false));
    pushMethodProp(
        NodeProps.kOnTouchDown,
        StyleMethodProp((consumer, value) {
          if (consumer is TextStyleNode && value is bool) {
            consumer.touchDownEnable(value);
          }
        }, false));
    pushMethodProp(
        NodeProps.kOnTouchMove,
        StyleMethodProp((consumer, value) {
          if (consumer is TextStyleNode && value is bool) {
            consumer.touchUpEnable(value);
          }
        }, false));
    pushMethodProp(
        NodeProps.kOnTouchEnd,
        StyleMethodProp((consumer, value) {
          if (consumer is TextStyleNode && value is bool) {
            consumer.touchEndEnable(value);
          }
        }, false));
    pushMethodProp(
        NodeProps.kOnTouchCancel,
        StyleMethodProp((consumer, value) {
          if (consumer is TextStyleNode && value is bool) {
            consumer.touchCancelable(value);
          }
        }, false));
    pushMethodProp(
        NodeProps.kPropEnableScale,
        StyleMethodProp((consumer, value) {
          if (consumer is TextStyleNode && value is bool) {
            consumer.enableScale = value;
          }
        }, false));
    pushMethodProp(
        NodeProps.kWhiteSpace,
        StyleMethodProp((consumer, value) {
          if (consumer is TextStyleNode && value is String) {
            consumer.whiteSpace(value);
          }
        }, "normal"));
  }
}

class TextData {
  final int maxLines;
  final InlineSpan text;
  final TextAlign textAlign;
  final String ellipsis = kEllipsis;
  final double textScaleFactor;
  final TextOverflow textOverflow;

  TextData(this.maxLines, this.text, this.textAlign, this.textScaleFactor,
      this.textOverflow);

  @override
  // ignore: avoid_equals_and_hash_code_on_mutable_classes
  bool operator ==(Object other) {
    return other is TextData &&
        maxLines == other.maxLines &&
        text == other.text &&
        textAlign == other.textAlign &&
        ellipsis == other.ellipsis &&
        textScaleFactor == other.textScaleFactor &&
        textOverflow == other.textOverflow;
  }

  @override
  // ignore: avoid_equals_and_hash_code_on_mutable_classes
  int get hashCode =>
      maxLines.hashCode |
      text.hashCode |
      textAlign.hashCode |
      ellipsis.hashCode |
      textScaleFactor.hashCode |
      textOverflow.hashCode;
}
