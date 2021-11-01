import '../../../common/voltron_map.dart';
import '../../../dom/prop.dart';
import '../../../engine/engine_context.dart';
import 'model.dart';

class MatchedStyles implements InspectorModel {
  final int nodeId;
  final EngineContext context;
  MatchedStyles(this.context, this.nodeId);

  CSSStyle? _getInlineStyle(EngineContext context, int nodeId) {
    final domNodeDomainData = context.domManager.getNode(nodeId)?.domainData;
    if (domNodeDomainData == null) {
      return null;
    }

    return CSSUtil.getCSSStyle(domNodeDomainData.style, domNodeDomainData.id);
  }

  // TODO: 优化样式的转换
  Map toJson() {
    final inlineStyle = _getInlineStyle(context, nodeId);
    return {
      'inlineStyle': inlineStyle,
    };
  }
}

class InlineStyles implements InspectorModel {
  final int nodeId;
  final EngineContext context;
  InlineStyles(this.context, this.nodeId);

  CSSStyle? _getInlineStyle(EngineContext context, int nodeId) {
    final domNodeDomainData = context.domManager.getNode(nodeId)?.domainData;
    final style =
        domNodeDomainData?.attributes.get<VoltronMap>(NodeProps.style);
    if (domNodeDomainData == null || style == null) {
      return null;
    }

    return CSSUtil.getCSSStyle(style, domNodeDomainData.id);
  }

  // TODO: 优化样式的转换
  Map toJson() {
    final inlineStyle = _getInlineStyle(context, nodeId);
    return {
      'inlineStyle': inlineStyle,
      'attributesStyle': null,
    };
  }
}

class ComputedStyle implements InspectorModel {
  final int nodeId;
  final EngineContext context;

  /// 不需要添加属性style的list
  final List<String> _propertyStyleNotRequiredList = [
    NodeProps.width,
    NodeProps.height,
  ];

  ComputedStyle(this.context, this.nodeId);

  /// 获取属性的style
  List<CSSComputedStyleProperty>? _getPropertyStyleList(VoltronMap? style) {
    if (style == null) {
      return null;
    }

    final styleList = <CSSComputedStyleProperty>[];
    for (final entry in style.entrySet()) {
      final key = entry.key;
      final isRequired = CSSUtil.valueTransformStrategy.containsKey(key) &&
          !_propertyStyleNotRequiredList.contains(key);
      if (!isRequired) {
        continue;
      }
      styleList.add(CSSComputedStyleProperty(
        name: CSSUtil.kebabize(key),
        value: entry.value.toString(),
      ));
    }
    return styleList;
  }

  /// 获取显示盒子模型所需的属性Map(key: 属性名称，value: 默认值）
  Map<String, dynamic> _getBoxModelRequirePropertyMap() {
    final lengthDefaultValue = '0';
    final displayDefaultValue = 'block';
    final positionDefaultValue = 'relative';
    final propertyMap = {
      NodeProps.paddingTop: lengthDefaultValue,
      NodeProps.paddingRight: lengthDefaultValue,
      NodeProps.paddingBottom: lengthDefaultValue,
      NodeProps.paddingLeft: lengthDefaultValue,
      NodeProps.borderTopWidth: lengthDefaultValue,
      NodeProps.borderRightWidth: lengthDefaultValue,
      NodeProps.borderBottomWidth: lengthDefaultValue,
      NodeProps.borderLeftWidth: lengthDefaultValue,
      NodeProps.marginTop: lengthDefaultValue,
      NodeProps.marginRight: lengthDefaultValue,
      NodeProps.marginBottom: lengthDefaultValue,
      NodeProps.marginLeft: lengthDefaultValue,
      // display和position是显示盒子模型的关键，协议返回的数据缺了这两个属性其中之一就无法显示
      NodeProps.display: displayDefaultValue,
      NodeProps.position: positionDefaultValue,
    };

    return propertyMap;
  }

  /// 获取盒子模型的style
  List<CSSComputedStyleProperty>? _getBoxModelStyleList(
      VoltronMap? style, EngineContext context, int nodeId) {
    final boundingClientRect =
        context.renderManager.getBoundingClientRect(context.engineId, nodeId);
    if (style == null || boundingClientRect == null) {
      return null;
    }

    final styleList = <CSSComputedStyleProperty>[];
    final boxModelRequirePropertyMap = _getBoxModelRequirePropertyMap();
    for (final property in boxModelRequirePropertyMap.entries) {
      final key = property.key;
      final value = property.value;
      if (!style.containsKey(key)) {
        styleList.add(CSSComputedStyleProperty(
          name: CSSUtil.kebabize(key),
          value: value,
        ));
      }
    }
    styleList.add(CSSComputedStyleProperty(
      name: CSSUtil.kebabize(NodeProps.width),
      value: boundingClientRect.width.toString(),
    ));
    styleList.add(CSSComputedStyleProperty(
      name: CSSUtil.kebabize(NodeProps.height),
      value: boundingClientRect.height.toString(),
    ));
    return styleList;
  }

  // TODO: 优化样式的转换
  Map toJson() {
    final style = context.domManager.getNode(nodeId)?.domainData.style;
    final propertyStyleList = _getPropertyStyleList(style);
    final boxModelStyleList = _getBoxModelStyleList(style, context, nodeId);
    return {
      'computedStyle': [
        if (propertyStyleList != null) ...propertyStyleList,
        if (boxModelStyleList != null) ...boxModelStyleList,
      ],
    };
  }
}

class StyleTexts implements InspectorModel {
  final EngineContext context;
  final List editList;
  StyleTexts(this.context, this.editList);

  CSSStyle? _getStyle(EngineContext context, Map<String, dynamic> edit) {
    final int nodeId = edit['styleSheetId'];
    final node = context.domManager.getNode(nodeId);
    final viewModel = context.getInstance(context.engineId);
    if (node == null || viewModel == null) {
      return null;
    }

    final newNodeProps = VoltronMap.copy(node.totalProps);
    final style = newNodeProps.get<VoltronMap>(NodeProps.style) ?? VoltronMap();
    final String text = edit['text'] ?? '';
    final textList = text.split(';');
    for (final item in textList) {
      final propertyList = item.trim().split(':');
      if (propertyList.length != 2) {
        continue;
      }

      final key = CSSUtil.camelize(propertyList[0].trim());
      final value = propertyList[1].trim();
      final strategy = CSSUtil.valueTransformStrategy[key];
      final formatValue = strategy?.call(value);
      if (formatValue != null) {
        style.push(key, formatValue);
      }
    }
    newNodeProps.push(NodeProps.style, style);
    context.domManager.updateNode(nodeId, newNodeProps, viewModel);
    return CSSUtil.getCSSStyle(style, nodeId);
  }

  List<CSSStyle> _getStyleList(EngineContext context, List editList) {
    final styleList = <CSSStyle>[];
    for (final edit in editList) {
      final cssStyle = _getStyle(context, edit);
      if (cssStyle == null) {
        continue;
      }
      styleList.add(cssStyle);
    }

    /// 更新样式集合不为空，就批量更新节点样式
    if (styleList.isNotEmpty) {
      context.domManager.batch(canInvokeHook: false);
    }
    return styleList;
  }

  // TODO: 优化样式的转换
  Map toJson() {
    final styleList = _getStyleList(context, editList);
    return {'styles': styleList};
  }
}

/// https://chromedevtools.github.io/devtools-protocol/tot/CSS/#type-CSSStyle
class CSSStyle implements InspectorModel {
  int? styleSheetId;
  List<CSSProperty> cssProperties;
  List<ShorthandEntry> shorthandEntries;
  String? cssText;
  SourceRange? range;

  CSSStyle({
    this.styleSheetId,
    required this.cssProperties,
    required this.shorthandEntries,
    this.cssText,
    this.range,
  });

  @override
  Map toJson() {
    return {
      if (styleSheetId != null) 'styleSheetId': styleSheetId,
      'cssProperties': cssProperties,
      'shorthandEntries': shorthandEntries,
      if (cssText != null) 'cssText': cssText,
      if (range != null) 'range': range,
    };
  }
}

/// https://chromedevtools.github.io/devtools-protocol/tot/CSS/#type-CSSProperty
class CSSProperty implements InspectorModel {
  String name;
  String value;
  bool? important;
  bool? implicit;
  String? text;
  bool? parsedOk;
  bool? disabled;
  SourceRange? range;

  CSSProperty({
    required this.name,
    required this.value,
    this.important = false,
    this.implicit = false,
    this.text,
    this.parsedOk = true,
    this.disabled,
    this.range,
  });

  Map toJson() {
    return {
      'name': name,
      'value': value,
      if (important != null) 'important': important,
      if (implicit != null) 'implicit': implicit,
      if (text != null) 'text': text,
      if (parsedOk != null) 'parsedOk': parsedOk,
      if (disabled != null) 'disabled': disabled,
      if (range != null) 'range': range,
    };
  }
}

/// https://chromedevtools.github.io/devtools-protocol/tot/CSS/#type-SourceRange
class SourceRange implements InspectorModel {
  int startLine;
  int startColumn;
  int endLine;
  int endColumn;

  SourceRange({
    required this.startLine,
    required this.startColumn,
    required this.endLine,
    required this.endColumn,
  });

  Map toJson() {
    return {
      'startLine': startLine,
      'startColumn': startColumn,
      'endLine': endLine,
      'endColumn': endColumn,
    };
  }
}

/// https://chromedevtools.github.io/devtools-protocol/tot/CSS/#type-ShorthandEntry
class ShorthandEntry implements InspectorModel {
  String name;
  String value;
  bool? important;

  ShorthandEntry({
    required this.name,
    required this.value,
    this.important = false,
  });

  Map toJson() {
    return {
      'name': name,
      'value': value,
      if (important != null) 'important': important,
    };
  }
}

/// https://chromedevtools.github.io/devtools-protocol/tot/CSS/#type-CSSComputedStyleProperty
class CSSComputedStyleProperty implements InspectorModel {
  String name;
  String value;

  CSSComputedStyleProperty({required this.name, required this.value});

  Map toJson() {
    return {
      'name': name,
      'value': value,
    };
  }
}

/// CSS工具类
class CSSUtil {
  // a-b to aB
  static String camelize(String str) {
    final regExp = RegExp(r'-(\w)');
    return str.replaceAllMapped(regExp, (match) {
      final subStr = match[0]?.substring(1) ?? '';
      return subStr.isNotEmpty ? subStr.toUpperCase() : '';
    });
  }

  /// aB to a-b
  static String kebabize(String str) {
    final regExp = RegExp(r'[A-Z]');
    return str.replaceAllMapped(
        regExp, (match) => '-${match[0]?.toLowerCase()}');
  }

  /// https://chromedevtools.github.io/devtools-protocol/tot/CSS/#type-CSSStyle
  static CSSStyle getCSSStyle(VoltronMap style, int nodeId) {
    var totalCSSText = '';
    final cssPropertyList = <CSSProperty>[];
    for (final entry in style.entrySet()) {
      final key = entry.key;
      if (!valueTransformStrategy.containsKey(key)) {
        continue;
      }

      final kebabName = kebabize(key);
      final value = entry.value.toString();
      final cssText = '$kebabName: $value';
      final cssProperty = CSSProperty(
        name: kebabName,
        value: value,
        range: SourceRange(
          startLine: 0,
          startColumn: totalCSSText.length,
          endLine: 0,
          endColumn: totalCSSText.length + cssText.length + 1,
        ),
      );
      cssPropertyList.add(cssProperty);
      totalCSSText += '$cssText; ';
    }
    final range = SourceRange(
        startLine: 0,
        startColumn: 0,
        endLine: 0,
        endColumn: totalCSSText.length);
    return CSSStyle(
      styleSheetId: nodeId,
      cssProperties: cssPropertyList,
      shorthandEntries: <ShorthandEntry>[],
      cssText: totalCSSText,
      range: range,
    );
  }

  /// 转换为double值
  static double? _getDoubleValue(String value) {
    return double.tryParse(value);
  }

  /// 转换为指定的枚举值, 当输入的值不在枚举的范围内，就默认返回第一个枚举值
  static String? Function(String) _getEnumValue(List<String> options) {
    return (value) {
      if (options.isEmpty) {
        return null;
      }

      if (options.contains(value)) {
        return value;
      }
      return options[0];
    };
  }

  /// 转换策略
  static final valueTransformStrategy = {
    // flex
    NodeProps.display: _getEnumValue(['flex', 'none']),
    NodeProps.flex: _getDoubleValue,
    NodeProps.flexDirection:
        _getEnumValue(['column', 'column-reverse', 'row', 'row-reverse']),
    NodeProps.flexWrap: _getEnumValue(['nowrap', 'wrap', 'wrap-reverse']),
    NodeProps.alignItems: _getEnumValue(
        ['flex-start', 'center', 'flex-end', 'stretch', 'center', 'baseline']),
    NodeProps.alignSelf: _getEnumValue([
      'auto',
      'flex-start',
      'center',
      'flex-end',
      'stretch',
      'center',
      'baseline'
    ]),
    NodeProps.justifyContent: _getEnumValue([
      'flex-start',
      'center',
      'flex-end',
      'space-between',
      'space-around',
      'space-evenly'
    ]),
    NodeProps.flexGrow: _getDoubleValue,
    NodeProps.flexShrink: _getDoubleValue,
    NodeProps.flexBasis: _getDoubleValue,
    // box
    // NodeProps.boxSizing: checkObj.createCheckEnum(['border-box']), // TODO
    NodeProps.width: _getDoubleValue,
    NodeProps.height: _getDoubleValue,
    NodeProps.maxWidth: _getDoubleValue,
    NodeProps.minWidth: _getDoubleValue,
    NodeProps.maxHeight: _getDoubleValue,
    NodeProps.minHeight: _getDoubleValue,
    NodeProps.marginTop: _getDoubleValue,
    NodeProps.marginRight: _getDoubleValue,
    NodeProps.marginBottom: _getDoubleValue,
    NodeProps.marginLeft: _getDoubleValue,
    NodeProps.paddingTop: _getDoubleValue,
    NodeProps.paddingRight: _getDoubleValue,
    NodeProps.paddingBottom: _getDoubleValue,
    NodeProps.paddingLeft: _getDoubleValue,
    NodeProps.borderWidth: _getDoubleValue,
    NodeProps.borderColor: _getDoubleValue,
    // NodeProps.borderStyle: checkObj.createCheckEnum(['', 'solid', 'dotted', 'dashed']), // TODO
    NodeProps.borderTopWidth: _getDoubleValue,
    NodeProps.borderRightWidth: _getDoubleValue,
    NodeProps.borderBottomWidth: _getDoubleValue,
    NodeProps.borderLeftWidth: _getDoubleValue,
    NodeProps.borderTopColor: _getDoubleValue,
    NodeProps.borderRightColor: _getDoubleValue,
    NodeProps.borderBottomColor: _getDoubleValue,
    NodeProps.borderLeftColor: _getDoubleValue,
    // NodeProps.borderTopStyle: checkObj.createCheckEnum(['', 'solid', 'dotted', 'dashed']), // TODO
    // NodeProps.borderRightStyle: checkObj.createCheckEnum(['', 'solid', 'dotted', 'dashed']), // TODO
    // NodeProps.borderBottomStyle: checkObj.createCheckEnum(['', 'solid', 'dotted', 'dashed']), // TODO
    // NodeProps.borderLeftStyle: checkObj.createCheckEnum(['', 'solid', 'dotted', 'dashed']), // TODO
    NodeProps.borderRadius: _getDoubleValue,
    NodeProps.borderTopLeftRadius: _getDoubleValue,
    NodeProps.borderTopRightRadius: _getDoubleValue,
    NodeProps.borderBottomLeftRadius: _getDoubleValue,
    NodeProps.borderBottomRightRadius: _getDoubleValue,
    NodeProps.overflow: _getEnumValue(['hidden', 'visible', 'scroll']),
    // NodeProps.overflowX: checkObj.createCheckEnum(['hidden', 'visible', 'scroll']), // TODO
    // NodeProps.overflowY: checkObj.createCheckEnum(['hidden', 'visible', 'scroll']), // TODO
    // position
    NodeProps.position: _getEnumValue(['relative', 'absolute']),
    NodeProps.top: _getDoubleValue,
    NodeProps.right: _getDoubleValue,
    NodeProps.bottom: _getDoubleValue,
    NodeProps.left: _getDoubleValue,
    NodeProps.zIndex: _getDoubleValue,
    // transform
    // NodeProps.transform: checkObj.checkTransform, // TODO
    // NodeProps.transformOrigin: checkObj.checkTransformOrigin, // TODO
    // NodeProps.perspective: checkObj.checkPerspective, // TODO
    // transition
    // NodeProps.transition: checkObj.checkReturn, // TODO
    // animation
    // NodeProps.animation: checkObj.checkReturn, // TODO
    // background
    NodeProps.backgroundColor: _getDoubleValue,
    // NodeProps. backgroundImage: checkObj.checkBackgroundImage, // TODO
    NodeProps.backgroundSize:
        _getEnumValue(['auto', 'contain', 'cover', 'fit']),
    NodeProps.backgroundRepeat:
        _getEnumValue(['no-repeat', 'repeat', 'repeat-x', 'repeat-y']),
    NodeProps.backgroundPositionX: _getEnumValue(['left', 'center', 'right']),
    NodeProps.backgroundPositionY: _getEnumValue(['top', 'center', 'bottom']),
    // opacity
    NodeProps.opacity: _getDoubleValue,
    // font
    NodeProps.color: _getDoubleValue,
    NodeProps.fontSize: _getDoubleValue,
    NodeProps.fontStyle: _getEnumValue(['normal', 'italic']),
    NodeProps.fontWeight: _getEnumValue([
      'normal',
      'bold',
      '100',
      '200',
      '300',
      '400',
      '500',
      '600',
      '700',
      '800',
      '900'
    ]),
    // NodeProps.textDecoration: checkObj.createCheckEnum(['none', 'underline', 'line-through']), // TODO
    NodeProps.textAlign: _getEnumValue(['left', 'center', 'right']),
    // NodeProps.fontFamily: checkObj.checkReturn, // TODO
    NodeProps.textOverflow: _getEnumValue(['clip', 'ellipsis', 'fade']),
    NodeProps.lineHeight: _getDoubleValue,
    NodeProps.whiteSpace: _getEnumValue(['normal', 'pre', 'pre-line']),
    // custom
    NodeProps.resizeMode:
        _getEnumValue(['cover', 'contain', 'stretch', 'repeat', 'center']),
    // NodeProps.boxShadow: checkObj.checkBoxShadow, // TODO
  };
}
