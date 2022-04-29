import 'package:flutter/material.dart';
import 'package:voltron_renderer/style.dart';

import '../common.dart';
import '../controller.dart';
import '../util.dart';

const int kDefaultTextShadowColor = 0x55000000;
const String kEllipsis = "\u2026";
const int kMaxLineCount = 100000;

final TextMethodProvider _sTextMethodProvider = TextMethodProvider();

class TextVirtualNode extends VirtualNode {
  static const _kTag = "TextVirtualNode";

  final int id;
  final int pid;
  final int index;

  TextVirtualNode(this.id, this.pid, this.index) : super(id, pid, index);

  // 文本转换后的span，组合各种css样式
  TextSpan? span;
  bool _dirty = false;
  double lastLayoutWidth = 0.0;

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
  double customTextScale = 1.0;

  // 文本阴影属性
  double _textShadowOffsetDx = 0;
  double _textShadowOffsetDy = 0;
  double _textShadowRadius = 1;
  int _textShadowColor = kDefaultTextShadowColor;

  // 下划线
  bool _isUnderlineTextDecorationSet = false;

  // 删除线
  bool _isLineThroughTextDecorationSet = false;

  // 下划线样式
  TextDecorationStyle _textDecorationStyle = TextDecorationStyle.solid;

  // 下划线颜色
  int _textDecorationColor = Colors.black.value;

  // 系统文本缩放尺寸
  bool _enableScale = false;

  bool get enableScale => _enableScale;

  String get _text {
    if (_whiteSpace == null || _whiteSpace == 'normal' || _whiteSpace == 'nowrap') {
      // 连续的空白符会被合并，换行符会被当作空白符来处理
      return _sourceText
              ?.replaceAll(RegExp(r' +'), ' ')
              .replaceAll('\n', ' ')
              .replaceAll(RegExp(r'<br\s*/?>'), ' ') ??
          '';
    }
    if (_whiteSpace == 'pre-line') {
      // 连续的空白符会被合并。在遇到换行符或者<br>元素，才换行
      return _sourceText?.replaceAll(RegExp(r' +'), ' ').replaceAll(RegExp(r'<br\s*/?>'), '\n') ??
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
      _dirty = true;
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
      _dirty = true;
    }
  }

  @ControllerProps(NodeProps.kColor)
  // ignore: use_setters_to_change_properties
  void color(int color) {
    _color = color;
    _dirty = true;
  }

  @ControllerProps(NodeProps.kFontSize)
  // ignore: use_setters_to_change_properties
  void fontSize(double fontSize) {
    _fontSize = fontSize;
    _dirty = true;
  }

  @ControllerProps(NodeProps.kFontFamily)
  // ignore: use_setters_to_change_properties
  void fontFamily(String fontFamily) {
    _fontFamily = fontFamily;
    _dirty = true;
  }

  @ControllerProps(NodeProps.kFontWeight)
  void fontWeight(String weight) {
    var fontWeight = parseFontWeight(weight);

    if (fontWeight != _fontWeight) {
      _fontWeight = fontWeight;
      _dirty = true;
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
    for (var textDecorationLineSubString in textDecorationLineString.split(" ")) {
      if ("underline" == textDecorationLineSubString) {
        _isUnderlineTextDecorationSet = true;
      } else if ("line-through" == textDecorationLineSubString) {
        _isLineThroughTextDecorationSet = true;
      }
    }
    _dirty = true;
  }

  @ControllerProps(NodeProps.kTextDecorationStyle)
  void textDecorationStyle(String textDecorationStyleString) {
    final propertyMap = {
      'solid': TextDecorationStyle.solid,
      'dashed': TextDecorationStyle.dashed,
      'dotted': TextDecorationStyle.dotted,
      'double': TextDecorationStyle.double,
      'wavy': TextDecorationStyle.wavy,
    };

    _textDecorationStyle = propertyMap[textDecorationStyleString] ?? TextDecorationStyle.solid;
    _dirty = true;
  }

  @ControllerProps(NodeProps.kTextDecorationColor)
  void textDecorationColor(int textDecorationColor) {
    _textDecorationColor = textDecorationColor;
    _dirty = true;
  }

  @ControllerProps(NodeProps.kPropShadowOffset)
  void textShadowOffset(VoltronMap offsetMap) {
    _textShadowOffsetDx = offsetMap.get(NodeProps.kPropShadowOffsetWidth)?.toDouble() ?? 0.0;
    _textShadowOffsetDy = offsetMap.get(NodeProps.kPropShadowOffsetHeight)?.toDouble() ?? 0.0;
    _dirty = true;
  }

  @ControllerProps(NodeProps.kPropShadowRadius)
  void textShadowRadius(double textShadowRadius) {
    if (textShadowRadius != _textShadowRadius) {
      _textShadowRadius = textShadowRadius;
      _dirty = true;
    }
  }

  @ControllerProps(NodeProps.kPropShadowColor)
  void setTextShadowColor(int textShadowColor) {
    if (textShadowColor != _textShadowColor) {
      _textShadowColor = textShadowColor;
      _dirty = true;
    }
  }

  @ControllerProps(NodeProps.kLineHeight)
  void lineHeight(int lineHeight) {
    _lineHeight = (lineHeight == -1.0 ? null : lineHeight)?.toDouble();
    _dirty = true;
  }

  @ControllerProps(NodeProps.kTextAlign)
  void setTextAlign(String textAlign) {
    _textAlign = parseTextAlign(textAlign);
    _dirty = true;
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
    _dirty = true;
  }

  @ControllerProps(NodeProps.kWhiteSpace)
  // ignore: use_setters_to_change_properties
  void whiteSpace(String whiteSpace) {
    _whiteSpace = whiteSpace;
    _dirty = true;
  }

  @ControllerProps(NodeProps.kTextOverflow)
  void setTextOverflow(String textOverflow) {
    _textOverflow = parseTextOverflow(textOverflow);
    _dirty = true;
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

  @ControllerProps(NodeProps.kPropEnableScale)
  set enableScale(bool flag) {
    _enableScale = flag;
    _dirty = true;
  }

  @ControllerProps(NodeProps.kNumberOfLines)
  void setNumberOfLines(int numberOfLines) {
    _numberOfLines = numberOfLines <= 0 ? 0 : numberOfLines;
    _dirty = true;
  }

  TextSpan createSpan({bool useChild = true}) {
    var curFontSize = _fontSize;

    var shadowList = <Shadow>[];
    if (_textShadowOffsetDx != 0 || _textShadowOffsetDy != 0) {
      shadowList.add(
        Shadow(
          blurRadius: _textShadowRadius,
          color: Color(_textShadowColor),
          offset: Offset(_textShadowOffsetDx, _textShadowOffsetDy),
        ),
      );
    }

    var childrenSpan = <TextSpan>[];

    if (useChild) {
      for (var i = 0; i < childCount; i++) {
        var node = getChildAt(i);
        if (node != null) {
          if (node is TextVirtualNode) {
            var styleNode = node;
            childrenSpan.add(styleNode.createSpan(useChild: useChild));
          } else {
            // throw StateError("${node.name} is not support in Text");
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
          [
            TextDecoration.underline,
            TextDecoration.lineThrough,
          ],
        );
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
          decoration: textDecoration,
          decorationStyle: _textDecorationStyle,
          decorationColor: Color(_textDecorationColor),
        ),
        children: childrenSpan,
      );
    }
    return const TextSpan(text: "");
  }

  TextData createData(double width, FlexMeasureMode widthMode) {
    if (span == null || _dirty) {
      span = createSpan(useChild: true);
      _dirty = false;
    }
    lastLayoutWidth = width;
    return TextData(
      _numberOfLines ?? kMaxLineCount,
      span!,
      _textAlign,
      _generateTextScale(),
      _textOverflow,
    );
  }

  TextData createLayout() {
    return createData(lastLayoutWidth, FlexMeasureMode.exactly);
  }

  TextPainter createPainter(double width, FlexMeasureMode widthMode) {
    var unconstrainedWidth = widthMode == FlexMeasureMode.undefined || width < 0;
    var maxWidth = unconstrainedWidth ? double.infinity : width;
    if (span == null || _dirty) {
      span = createSpan(useChild: true);
      _dirty = false;
    }
    var painter = TextPainter(
      maxLines: _numberOfLines ?? kMaxLineCount,
      text: span,
      textDirection: TextDirection.ltr,
      textAlign: _textAlign,
      ellipsis: kEllipsis,
      textScaleFactor: _generateTextScale(),
    )..layout(maxWidth: maxWidth);

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
    if (_enableScale) {
      textScaleFactor = customTextScale;
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
          if (consumer is TextVirtualNode && value is String) {
            consumer.fontStyle(value);
          }
        }, "normal"));
    pushMethodProp(
        NodeProps.kLetterSpacing,
        StyleMethodProp((consumer, value) {
          if (consumer is TextVirtualNode && value is double) {
            consumer.letterSpacing(value);
          }
        }, -1.0));
    pushMethodProp(
        NodeProps.kColor,
        StyleMethodProp((consumer, value) {
          if (consumer is TextVirtualNode && value is int) {
            consumer.color(value);
          }
        }, Colors.transparent.value));
    pushMethodProp(
        NodeProps.kFontSize,
        StyleMethodProp((consumer, value) {
          if (consumer is TextVirtualNode && value is double) {
            consumer.fontSize(value);
          }
        }, NodeProps.kDefaultFontSizeSp));
    pushMethodProp(
        NodeProps.kNumberOfLines,
        StyleMethodProp((consumer, value) {
          if (consumer is TextVirtualNode && value is int) {
            consumer.setNumberOfLines(value);
          }
        }, kMaxLineCount));
    pushMethodProp(
        NodeProps.kFontFamily,
        StyleMethodProp((consumer, value) {
          if (consumer is TextVirtualNode && value is String) {
            consumer.fontFamily(value);
          }
        }, ""));
    pushMethodProp(
        NodeProps.kFontWeight,
        StyleMethodProp((consumer, value) {
          if (consumer is TextVirtualNode && value is String) {
            consumer.fontWeight(value);
          }
        }, ""));
    pushMethodProp(
        NodeProps.kTextDecorationLine,
        StyleMethodProp((consumer, value) {
          if (consumer is TextVirtualNode && value is String) {
            consumer.textDecorationLine(value);
          }
        }, ""));
    pushMethodProp(
        NodeProps.kTextDecorationStyle,
        StyleMethodProp((consumer, value) {
          if (consumer is TextVirtualNode && value is String) {
            consumer.textDecorationStyle(value);
          }
        }, ""));
    pushMethodProp(
        NodeProps.kTextDecorationColor,
        StyleMethodProp((consumer, value) {
          if (consumer is TextVirtualNode && value is int) {
            consumer.textDecorationColor(value);
          }
        }, Colors.black.value));
    pushMethodProp(
        NodeProps.kPropShadowOffset,
        StyleMethodProp((consumer, value) {
          if (consumer is TextVirtualNode && value is VoltronMap) {
            consumer.textShadowOffset(value);
          }
        }, null));
    pushMethodProp(
        NodeProps.kPropShadowRadius,
        StyleMethodProp((consumer, value) {
          if (consumer is TextVirtualNode && value is double) {
            consumer.textShadowRadius(value);
          }
        }, 0));
    pushMethodProp(
        NodeProps.kPropShadowColor,
        StyleMethodProp((consumer, value) {
          if (consumer is TextVirtualNode && value is int) {
            consumer.setTextShadowColor(value);
          }
        }, Colors.transparent.value));
    pushMethodProp(
        NodeProps.kLineHeight,
        StyleMethodProp((consumer, value) {
          if (consumer is TextVirtualNode && value is int) {
            consumer.lineHeight(value);
          }
        }, -1));
    pushMethodProp(
        NodeProps.kTextAlign,
        StyleMethodProp((consumer, value) {
          if (consumer is TextVirtualNode && value is String) {
            consumer.setTextAlign(value);
          }
        }, "left"));
    pushMethodProp(
        NodeProps.kText,
        StyleMethodProp((consumer, value) {
          if (consumer is TextVirtualNode && value is String) {
            consumer.text(value);
          }
        }, ""));
    pushMethodProp(
        NodeProps.kTextOverflow,
        StyleMethodProp((consumer, value) {
          if (consumer is TextVirtualNode && value is String) {
            consumer.setTextOverflow(value);
          }
        }, ""));
    pushMethodProp(
        NodeProps.kPropEnableScale,
        StyleMethodProp((consumer, value) {
          if (consumer is TextVirtualNode && value is bool) {
            consumer.enableScale = value;
          }
        }, false));
    pushMethodProp(
        NodeProps.kWhiteSpace,
        StyleMethodProp((consumer, value) {
          if (consumer is TextVirtualNode && value is String) {
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

  TextData(
    this.maxLines,
    this.text,
    this.textAlign,
    this.textScaleFactor,
    this.textOverflow,
  );

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
