import '../util.dart';
import 'flex_define.dart';
import 'flex_node.dart';
import 'flex_spacing.dart';
import 'prop.dart';

class _ProxyStyleProvider extends MethodPropProvider {
  static StyleMethodPropProvider sStyleProvider = StyleMethodPropProvider();

  _ProxyStyleProvider(MethodPropProvider? extraProvider) {
    pushProvider(sStyleProvider);
    pushProvider(extraProvider);
  }

  void pushProvider(MethodPropProvider? provider) {
    if (provider != null) {
      provider.styleMethodMap.forEach(pushMethodProp);
    }
  }
}

class StyleNode extends FlexNode with StyleMethodPropConsumer {
  bool shouldNotifyOnLayout = false;
  final String name;

  final _ProxyStyleProvider _provider;

  StyleNode(this.name, {MethodPropProvider? extraProvider})
      : _provider = _ProxyStyleProvider(extraProvider);

  void setPropFloat(String name, double value) {
    switch (name) {
      case NodeProps.width:
        styleWidth = value;
        break;
      case NodeProps.minWidth:
        styleMinWidth = value;
        break;
      case NodeProps.maxWidth:
        styleMinWidth = value;
        break;
      case NodeProps.height:
        styleHeight = value;
        break;
      case NodeProps.minHeight:
        styleMinHeight = value;
        break;
      case NodeProps.maxHeight:
        styleMaxHeight = value;
        break;
      case NodeProps.flex:
        flex = value;
        break;
      case NodeProps.flexGrow:
        flexGrow = value;
        break;
      case NodeProps.flexShrink:
        flexShrink = value;
        break;
      case NodeProps.flexBasis:
        flexBasis = value;
        break;
      case NodeProps.margin:
        setMargin(FlexSpacing.all, value);
        break;
      case NodeProps.marginVertical:
        setMargin(FlexSpacing.vertical, value);
        break;
      case NodeProps.marginHorizontal:
        setMargin(FlexSpacing.horizontal, value);
        break;
      case NodeProps.marginLeft:
        setMargin(FlexSpacing.left, value);
        break;
      case NodeProps.marginRight:
        setMargin(FlexSpacing.right, value);
        break;
      case NodeProps.marginTop:
        setMargin(FlexSpacing.top, value);
        break;
      case NodeProps.marginBottom:
        setMargin(FlexSpacing.bottom, value);
        break;
      case NodeProps.padding:
        setPadding(FlexSpacing.all, value);
        break;
      case NodeProps.paddingVertical:
        setPadding(FlexSpacing.vertical, value);
        break;
      case NodeProps.paddingHorizontal:
        setPadding(FlexSpacing.horizontal, value);
        break;
      case NodeProps.paddingLeft:
        setPadding(FlexSpacing.left, value);
        break;
      case NodeProps.paddingRight:
        setPadding(FlexSpacing.right, value);
        break;
      case NodeProps.paddingTop:
        setPadding(FlexSpacing.top, value);
        break;
      case NodeProps.paddingBottom:
        setPadding(FlexSpacing.bottom, value);
        break;
      case NodeProps.borderWidth:
        setBorder(FlexSpacing.all, value);
        break;
      case NodeProps.borderLeftWidth:
        setBorder(FlexSpacing.left, value);
        break;
      case NodeProps.borderRightWidth:
        setBorder(FlexSpacing.right, value);
        break;
      case NodeProps.borderTopWidth:
        setBorder(FlexSpacing.top, value);
        break;
      case NodeProps.borderBottomWidth:
        setBorder(FlexSpacing.bottom, value);
        break;
      case NodeProps.left:
        setPosition(FlexSpacing.left, value);
        break;
      case NodeProps.right:
        setPosition(FlexSpacing.right, value);
        break;
      case NodeProps.top:
        setPosition(FlexSpacing.top, value);
        break;
      case NodeProps.bottom:
        setPosition(FlexSpacing.bottom, value);
        break;
      default:
        break;
    }
  }

  void setPropString(String name, String? value) {
    switch (name) {
      case NodeProps.flexDirection:
        styleCssDirection = value == null
            ? FlexCSSDirection.COLUMN
            : enumValueFromString<FlexCSSDirection>(
                    replaceKey(value), FlexCSSDirection.values) ??
                FlexCSSDirection.COLUMN;
        break;
      case NodeProps.flexWrap:
        wrap = value == null
            ? FlexWrap.NOWRAP
            : enumValueFromString<FlexWrap>(
                    replaceKey(value), FlexWrap.values) ??
                FlexWrap.NOWRAP;
        break;
      case NodeProps.alignSelf:
        alignSelf = value == null
            ? FlexAlign.AUTO
            : enumValueFromString<FlexAlign>(
                    replaceKey(value), FlexAlign.values) ??
                FlexAlign.AUTO;
        break;
      case NodeProps.alignItems:
        alignItems = value == null
            ? FlexAlign.STRETCH
            : enumValueFromString<FlexAlign>(
                    replaceKey(value), FlexAlign.values) ??
                FlexAlign.STRETCH;
        break;
      case NodeProps.justifyContent:
        justifyContent = value == null
            ? FlexJustify.FLEX_START
            : enumValueFromString<FlexJustify>(
                    replaceKey(value), FlexJustify.values) ??
                FlexJustify.FLEX_START;
        break;
      case NodeProps.overflow:
        overflow = value == null
            ? FlexOverflow.VISIBLE
            : enumValueFromString<FlexOverflow>(
                    replaceKey(value), FlexOverflow.values) ??
                FlexOverflow.VISIBLE;
        break;
      case NodeProps.display:
        if (value == "none") {
          display = FlexDisplay.DISPLAY_NONE;
        } else {
          display = FlexDisplay.DISPLAY_FLEX;
        }
        break;
      case NodeProps.position:
        var positionType = value == null
            ? FlexPositionType.RELATIVE
            : enumValueFromString<FlexPositionType>(
                    value.toUpperCase(), FlexPositionType.values) ??
                FlexPositionType.RELATIVE;
        this.positionType = positionType;
        break;
      default:
        break;
    }
  }

  String replaceKey(String key, [bool needReplaceCross = true]) {
    if (needReplaceCross) {
      return key.toUpperCase().replaceAll("-", "_");
    }
    return key.toUpperCase();
  }

  @override
  MethodPropProvider get provider => _provider;
}

class FloatStyleMethodProp extends StyleMethodProp {
  FloatStyleMethodProp(String type, [double defaultValue = undefined])
      : super(((consumer, value) {
          if (consumer is StyleNode && value is double) {
            consumer.setPropFloat(type, value);
          }
        }), defaultValue);
}

class StringStyleMethodProp extends StyleMethodProp {
  StringStyleMethodProp(String type, [String defaultValue = ""])
      : super(((consumer, value) {
          if (consumer is StyleNode) {
            consumer.setPropString(type, value?.toString());
          }
        }), defaultValue);
}

class StyleMethodPropProvider extends MethodPropProvider {
  StyleMethodPropProvider() {
    pushFloatMethodProp(NodeProps.width);
    pushFloatMethodProp(NodeProps.minWidth);
    pushFloatMethodProp(NodeProps.maxWidth);
    pushFloatMethodProp(NodeProps.height);
    pushFloatMethodProp(NodeProps.minHeight);
    pushFloatMethodProp(NodeProps.maxHeight);
    pushFloatMethodProp(NodeProps.flex);
    pushFloatMethodProp(NodeProps.flexGrow);
    pushFloatMethodProp(NodeProps.flexShrink);
    pushFloatMethodProp(NodeProps.flexBasis);
    pushFloatMethodProp(NodeProps.margin);
    pushFloatMethodProp(NodeProps.marginVertical);
    pushFloatMethodProp(NodeProps.marginHorizontal);
    pushFloatMethodProp(NodeProps.marginLeft);
    pushFloatMethodProp(NodeProps.marginRight);
    pushFloatMethodProp(NodeProps.marginTop);
    pushFloatMethodProp(NodeProps.marginBottom);
    pushFloatMethodProp(NodeProps.padding);
    pushFloatMethodProp(NodeProps.paddingVertical);
    pushFloatMethodProp(NodeProps.paddingHorizontal);
    pushFloatMethodProp(NodeProps.paddingLeft);
    pushFloatMethodProp(NodeProps.paddingRight);
    pushFloatMethodProp(NodeProps.paddingTop);
    pushFloatMethodProp(NodeProps.paddingBottom);
    pushFloatMethodProp(NodeProps.borderWidth);
    pushFloatMethodProp(NodeProps.borderLeftWidth);
    pushFloatMethodProp(NodeProps.borderRightWidth);
    pushFloatMethodProp(NodeProps.borderTopWidth);
    pushFloatMethodProp(NodeProps.borderBottomWidth);
    pushFloatMethodProp(NodeProps.left);
    pushFloatMethodProp(NodeProps.right);
    pushFloatMethodProp(NodeProps.top);
    pushFloatMethodProp(NodeProps.bottom);

    pushStringMethodProp(NodeProps.position);
    pushStringMethodProp(NodeProps.flexDirection);
    pushStringMethodProp(NodeProps.flexWrap);
    pushStringMethodProp(NodeProps.alignSelf);
    pushStringMethodProp(NodeProps.alignItems);
    pushStringMethodProp(NodeProps.justifyContent);
    pushStringMethodProp(NodeProps.overflow);
    pushStringMethodProp(NodeProps.display);
    pushStringMethodProp(NodeProps.whiteSpace);

    pushMethodProp(
        NodeProps.onLayout,
        StyleMethodProp((consumer, value) {
          if (consumer is StyleNode && value is bool) {
            consumer.shouldNotifyOnLayout = value;
          }
        }, false));
  }

  void pushFloatMethodProp(String type) {
    pushMethodProp(type, FloatStyleMethodProp(type));
  }

  void pushStringMethodProp(String type) {
    pushMethodProp(type, StringStyleMethodProp(type));
  }
}
