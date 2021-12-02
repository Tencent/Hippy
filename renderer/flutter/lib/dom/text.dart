import 'dart:ui';

import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';

import '../adapter/font.dart';
import '../common/voltron_map.dart';
import '../controller/props.dart';
import '../engine/engine_context.dart';
import '../flexbox/flex_define.dart';
import '../flexbox/flex_node.dart';
import '../flexbox/flex_output.dart';
import '../flexbox/flex_spacing.dart';
import '../util/log_util.dart';
import '../util/string_util.dart';
import 'dom_node.dart';
import 'prop.dart';
import 'style_node.dart';

int textMeasure(FlexNodeAPI node, double width, FlexMeasureMode widthMode,
    double height, FlexMeasureMode heightMode) {
  if (node is! TextNode) {
    return FlexOutput.makeDouble(width, height);
  }
  var reactCSSNode = node;
  TextPainter? painter;
  var exception = false;

  try {
    painter = reactCSSNode.createPainter(width, widthMode);
  } catch (e) {
    LogUtils.e("TextNode", "text createLayout error:%e");
    exception = true;
  }

  if (exception || painter == null) {
    LogUtils.d("TextNode",
        "measure error:" " w: $width h: $height s:${reactCSSNode._fontSize} ");
    return FlexOutput.makeDouble(width, height);
  } else {
    LogUtils.d(
        "TextNode", "measure:" " w: ${painter.width} h: ${painter.height}");
    return FlexOutput.makeDouble(painter.width, painter.height);
  }
}

class TextNode extends StyleNode {
  static const tag = "TextNode";
  static TextMethodProvider sTextMethodProvider = TextMethodProvider();
  static const int defaultTextShadowColor = 0x55000000;
  static const String ellipsis = "\u2026";
  static const int maxLineCount = 100000;

  TextSpan? _span;
  String? _sourceText;

  int? _numberOfLines;
  double _fontSize = NodeProps.fontSizeSp;
  double? _lineHeight;
  double? _letterSpacing;

  int _color = Colors.black.value;

  String? _fontFamily;
  TextAlign _textAlign = TextAlign.start;

  double _textShadowOffsetDx = 0;
  double _textShadowOffsetDy = 0;
  double _textShadowRadius = 1;
  int _textShadowColor = defaultTextShadowColor;

  bool _isUnderlineTextDecorationSet = false;
  bool _isLineThroughTextDecorationSet = false;

  FontStyle _fontStyle = FontStyle.normal;
  FontWeight? _fontWeight;

  late bool _isVirtual;
  bool _enableScale = false;

  final List<String> _gestureTypes = [];

  FontScaleAdapter? _fontScaleAdapter;

  TextNode(int instanceId, int id, String name, String tagName, bool isVirtual)
      : super(instanceId, id, name, tagName) {
    _isVirtual = isVirtual;
    if (!_isVirtual) {
      measureFunction = textMeasure;
    }
  }

  @override
  bool get enableScale => true;

  @override
  bool get isChildVirtual => true;

  TextSpan? get span => _span;

  String? _whiteSpace;

  TextOverflow _textOverflow = TextOverflow.visible;

  String? get _text {
    if (_whiteSpace == null ||
        _whiteSpace == 'normal' ||
        _whiteSpace == 'nowrap') {
      // 连续的空白符会被合并，换行符会被当作空白符来处理
      return _sourceText
          ?.replaceAll(RegExp(r' +'), ' ')
          .replaceAll('\n', ' ')
          .replaceAll(RegExp(r'<br\s*/?>'), ' ');
    }
    if (_whiteSpace == 'pre-line') {
      // 连续的空白符会被合并。在遇到换行符或者<br>元素，才换行
      return _sourceText
          ?.replaceAll(RegExp(r' +'), ' ')
          .replaceAll(RegExp(r'<br\s*/?>'), '\n');
    }
    if (_whiteSpace == 'pre') {
      // 连续的空白符会被保留。在遇到换行符或者<br>元素，才换行
      return _sourceText?.replaceAll(RegExp(r'<br\s*/?>'), '\n');
    }
    return _sourceText;
  }

  static int _parseArgument(String weight) {
    return weight.length == 3 &&
            weight.endsWith("00") &&
            weight.codeUnitAt(0) <= '9'.codeUnitAt(0) &&
            weight.codeUnitAt(0) >= '1'.codeUnitAt(0)
        ? 100 * (weight.codeUnitAt(0) - '0'.codeUnitAt(0))
        : -1;
  }

  @ControllerProps(NodeProps.fontStyle)
  void fontStyle(String fontStyleString) {
    var fontStyle = parseFontStyle(fontStyleString);
    if (fontStyle != _fontStyle) {
      _fontStyle = fontStyle;
      markUpdated();
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

  @ControllerProps(NodeProps.letterSpacing)
  void letterSpacing(double letterSpace) {
    if (letterSpace != -1.0) {
      _letterSpacing = letterSpace;
      markUpdated();
    }
  }

  @ControllerProps(NodeProps.color)
  void color(int color) {
    _color = color;
    markUpdated();
  }

  @ControllerProps(NodeProps.fontSize)
  void fontSize(double fontSize) {
    _fontSize = fontSize;
    markUpdated();
  }

  @ControllerProps(NodeProps.fontFamily)
  void fontFamily(String fontFamily) {
    _fontFamily = fontFamily;
    markUpdated();
  }

  @ControllerProps(NodeProps.fontWeight)
  void fontWeight(String weight) {
    var fontWeight = parseFontWeight(weight);

    if (fontWeight != _fontWeight) {
      _fontWeight = fontWeight;
      markUpdated();
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

  @ControllerProps(NodeProps.textDecorationLine)
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
    markUpdated();
  }

  @ControllerProps(NodeProps.propShadowOffset)
  void textShadowOffset(VoltronMap offsetMap) {
    _textShadowOffsetDx = 0;
    _textShadowOffsetDy = 0;
    if (offsetMap.get(NodeProps.propShadowOffsetWidth) != null) {
      _textShadowOffsetDx = offsetMap.get(NodeProps.propShadowOffsetWidth);
    }
    if (offsetMap.get(NodeProps.propShadowOffsetHeight) != null) {
      _textShadowOffsetDy = offsetMap.get(NodeProps.propShadowOffsetHeight);
    }

    markUpdated();
  }

  @ControllerProps(NodeProps.propShadowRadius)
  void textShadowRadius(double textShadowRadius) {
    if (textShadowRadius != _textShadowRadius) {
      _textShadowRadius = textShadowRadius;
      markUpdated();
    }
  }

  @ControllerProps(NodeProps.propShadowColor)
  void setTextShadowColor(int textShadowColor) {
    if (textShadowColor != _textShadowColor) {
      _textShadowColor = textShadowColor;
      markUpdated();
    }
  }

  @ControllerProps(NodeProps.lineHeight)
  void lineHeight(int lineHeight) {
    _lineHeight = (lineHeight == -1.0 ? null : lineHeight)?.toDouble();
    markUpdated();
  }

  @ControllerProps(NodeProps.textAlign)
  void setTextAlign(String textAlign) {
    _textAlign = parseTextAlign(textAlign);
    markUpdated();
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
      LogUtils.e(tag, "Invalid textAlign: $textAlign");
    }
    return align;
  }

  @ControllerProps(NodeProps.text)
  void text(String text) {
    _sourceText = text;
    markUpdated();
  }

  @ControllerProps(NodeProps.whiteSpace)
  void whiteSpace(String whiteSpace) {
    _whiteSpace = whiteSpace;
    markUpdated();
  }

  @ControllerProps(NodeProps.textOverflow)
  void setTextOverflow(String textOverflow) {
    _textOverflow = parseTextOverflow(textOverflow);
    markUpdated();
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
      LogUtils.e(tag, "Invalid textOverflow: $textOverflow");
    }
    return v;
  }

  @ControllerProps(NodeProps.onClick)
  void clickEnable(bool flag) {
    if (flag) {
      _gestureTypes.add(NodeProps.onClick);
    }
  }

  @ControllerProps(NodeProps.onLongClick)
  void longClickEnable(bool flag) {
    if (flag) {
      _gestureTypes.add(NodeProps.onLongClick);
    }
  }

  @ControllerProps(NodeProps.onPressIn)
  void pressInEnable(bool flag) {
    if (flag) {
      _gestureTypes.add(NodeProps.onPressIn);
    }
  }

  @ControllerProps(NodeProps.onPressOut)
  void pressOutEnable(bool flag) {
    if (flag) {
      _gestureTypes.add(NodeProps.onPressOut);
    }
  }

  @ControllerProps(NodeProps.onTouchDown)
  void touchDownEnable(bool flag) {
    if (flag) {
      _gestureTypes.add(NodeProps.onTouchDown);
    }
  }

  @ControllerProps(NodeProps.onTouchMove)
  void touchUpEnable(bool flag) {
    if (flag) {
      _gestureTypes.add(NodeProps.onTouchMove);
    }
  }

  @ControllerProps(NodeProps.onTouchEnd)
  void touchEndEnable(bool flag) {
    if (flag) {
      _gestureTypes.add(NodeProps.onTouchEnd);
    }
  }

  @ControllerProps(NodeProps.onTouchCancel)
  void touchCancelable(bool flag) {
    if (flag) {
      _gestureTypes.add(NodeProps.onTouchCancel);
    }
  }

  @ControllerProps(NodeProps.propEnableScale)
  set enableScale(bool flag) {
    _enableScale = flag;
    markUpdated();
  }

  @override
  void markUpdated() {
    super.markUpdated();
    if (!_isVirtual) {
      super.dirty();
    }
  }

  @override
  bool isVirtual() {
    return _isVirtual;
  }

  @ControllerProps(NodeProps.numberOfLines)
  void setNumberOfLines(int numberOfLines) {
    _numberOfLines = numberOfLines <= 0 ? 0 : numberOfLines;
    markUpdated();
  }

  @override
  void layoutBefore(EngineContext context) {
    super.layoutBefore(context);
    if (_fontScaleAdapter == null && _enableScale) {
      _fontScaleAdapter = context.globalConfigs.fontScaleAdapter;
    }
    if (_isVirtual) {
      return;
    }

    _span = createSpan(_text ?? '', true);
  }

  TextSpan createSpan(String text, bool useChild) {
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
        if (node is TextNode) {
          childrenSpan.add(node.createSpan(node._text ?? '', useChild));
        } else {
          throw StateError("${node.name} is not support in Text");
        }

        node.markUpdateSeen();
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

    if (!isEmpty(text) || childrenSpan.isNotEmpty) {
      return TextSpan(
          text: text,
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

  void layoutAfter(EngineContext context) {
    if (!isVirtual()) {
      var textData = createData(
          layoutWidth -
              getPadding(FlexSpacing.left) -
              getPadding(FlexSpacing.right),
          FlexMeasureMode.EXACTLY);
      data = textData;
    }
  }

  @override
  void updateData(EngineContext context) {
    if (!isVirtual()) {
      // todo update textPadding
      // context.domManager.addUITask(() {
      //   context.renderManager.updateExtra(
      //       rootId,
      //       id,
      //       TextExtra(
      //           data,
      //           getPadding(FlexSpacing.start),
      //           getPadding(FlexSpacing.end),
      //           getPadding(FlexSpacing.bottom),
      //           getPadding(FlexSpacing.top)));
      // });
    }
  }

  TextData createData(double width, FlexMeasureMode widthMode) {
    var span = _span;
    var text = span == null ? TextSpan(text: "") : span;
    return TextData(_numberOfLines ?? maxLineCount, text, _textAlign,
        _generateTextScale(), _textOverflow);
  }

  TextPainter createPainter(double width, FlexMeasureMode widthMode) {
    var unconstrainedWidth =
        widthMode == FlexMeasureMode.UNDEFINED || width < 0;
    var maxWidth = unconstrainedWidth ? double.infinity : width;
    var span = _span;
    var text = span == null ? TextSpan(text: "") : span;
    var painter = TextPainter(
        maxLines: _numberOfLines ?? maxLineCount,
        text: text,
        textDirection: TextDirection.ltr,
        textAlign: _textAlign,
        ellipsis: ellipsis,
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
    var fontScaleAdapter = _fontScaleAdapter;
    if (fontScaleAdapter != null && _enableScale) {
      textScaleFactor = fontScaleAdapter.getFontScale();
    }

    return textScaleFactor;
  }

  @override
  MethodPropProvider get provider => sTextMethodProvider;
}

class TextExtra {
  final Object extra;
  final double leftPadding;
  final double rightPadding;
  final double bottomPadding;
  final double topPadding;

  const TextExtra(this.extra, this.leftPadding, this.rightPadding,
      this.bottomPadding, this.topPadding);
}

class TextMethodProvider extends StyleMethodPropProvider {
  TextMethodProvider() {
    pushMethodProp(
        NodeProps.fontStyle,
        StyleMethodProp((consumer, value) {
          if (consumer is TextNode && value is String) {
            consumer.fontStyle(value);
          }
        }, "normal"));
    pushMethodProp(
        NodeProps.letterSpacing,
        StyleMethodProp((consumer, value) {
          if (consumer is TextNode && value is double) {
            consumer.letterSpacing(value);
          }
        }, -1.0));
    pushMethodProp(
        NodeProps.color,
        StyleMethodProp((consumer, value) {
          if (consumer is TextNode && value is int) {
            consumer.color(value);
          }
        }, Colors.transparent.value));
    pushMethodProp(
        NodeProps.fontSize,
        StyleMethodProp((consumer, value) {
          if (consumer is TextNode && value is double) {
            consumer.fontSize(value);
          }
        }, NodeProps.fontSizeSp));
    pushMethodProp(
        NodeProps.numberOfLines,
        StyleMethodProp((consumer, value) {
          if (consumer is TextNode && value is int) {
            consumer.setNumberOfLines(value);
          }
        }, TextNode.maxLineCount));
    pushMethodProp(
        NodeProps.fontFamily,
        StyleMethodProp((consumer, value) {
          if (consumer is TextNode && value is String) {
            consumer.fontFamily(value);
          }
        }, ""));
    pushMethodProp(
        NodeProps.fontWeight,
        StyleMethodProp((consumer, value) {
          if (consumer is TextNode && value is String) {
            consumer.fontWeight(value);
          }
        }, ""));
    pushMethodProp(
        NodeProps.textDecorationLine,
        StyleMethodProp((consumer, value) {
          if (consumer is TextNode && value is String) {
            consumer.textDecorationLine(value);
          }
        }, ""));
    pushMethodProp(
        NodeProps.propShadowOffset,
        StyleMethodProp((consumer, value) {
          if (consumer is TextNode && value is VoltronMap) {
            consumer.textShadowOffset(value);
          }
        }, null));
    pushMethodProp(
        NodeProps.propShadowRadius,
        StyleMethodProp((consumer, value) {
          if (consumer is TextNode && value is double) {
            consumer.textShadowRadius(value);
          }
        }, 0));
    pushMethodProp(
        NodeProps.propShadowColor,
        StyleMethodProp((consumer, value) {
          if (consumer is TextNode && value is int) {
            consumer.setTextShadowColor(value);
          }
        }, Colors.transparent.value));
    pushMethodProp(
        NodeProps.lineHeight,
        StyleMethodProp((consumer, value) {
          if (consumer is TextNode && value is int) {
            consumer.lineHeight(value);
          }
        }, -1));
    pushMethodProp(
        NodeProps.textAlign,
        StyleMethodProp((consumer, value) {
          if (consumer is TextNode && value is String) {
            consumer.setTextAlign(value);
          }
        }, "left"));
    pushMethodProp(
        NodeProps.text,
        StyleMethodProp((consumer, value) {
          if (consumer is TextNode && value is String) {
            consumer.text(value);
          }
        }, ""));
    pushMethodProp(
        NodeProps.textOverflow,
        StyleMethodProp((consumer, value) {
          if (consumer is TextNode && value is String) {
            consumer.setTextOverflow(value);
          }
        }, ""));
    pushMethodProp(
        NodeProps.onClick,
        StyleMethodProp((consumer, value) {
          if (consumer is TextNode && value is bool) {
            consumer.clickEnable(value);
          }
        }, false));
    pushMethodProp(
        NodeProps.onLongClick,
        StyleMethodProp((consumer, value) {
          if (consumer is TextNode && value is bool) {
            consumer.longClickEnable(value);
          }
        }, false));
    pushMethodProp(
        NodeProps.onPressIn,
        StyleMethodProp((consumer, value) {
          if (consumer is TextNode && value is bool) {
            consumer.pressInEnable(value);
          }
        }, false));
    pushMethodProp(
        NodeProps.onPressOut,
        StyleMethodProp((consumer, value) {
          if (consumer is TextNode && value is bool) {
            consumer.pressOutEnable(value);
          }
        }, false));
    pushMethodProp(
        NodeProps.onTouchDown,
        StyleMethodProp((consumer, value) {
          if (consumer is TextNode && value is bool) {
            consumer.touchDownEnable(value);
          }
        }, false));
    pushMethodProp(
        NodeProps.onTouchMove,
        StyleMethodProp((consumer, value) {
          if (consumer is TextNode && value is bool) {
            consumer.touchUpEnable(value);
          }
        }, false));
    pushMethodProp(
        NodeProps.onTouchEnd,
        StyleMethodProp((consumer, value) {
          if (consumer is TextNode && value is bool) {
            consumer.touchEndEnable(value);
          }
        }, false));
    pushMethodProp(
        NodeProps.onTouchCancel,
        StyleMethodProp((consumer, value) {
          if (consumer is TextNode && value is bool) {
            consumer.touchCancelable(value);
          }
        }, false));
    pushMethodProp(
        NodeProps.propEnableScale,
        StyleMethodProp((consumer, value) {
          if (consumer is TextNode && value is bool) {
            consumer.enableScale = value;
          }
        }, false));
    pushMethodProp(
        NodeProps.whiteSpace,
        StyleMethodProp((consumer, value) {
          if (consumer is TextNode && value is String) {
            consumer.whiteSpace(value);
          }
        }, "normal"));
  }
}

class TextData {
  final int maxLines;
  final InlineSpan text;
  final TextAlign textAlign;
  final String ellipsis = TextNode.ellipsis;
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
