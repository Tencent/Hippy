import '../util.dart';
import 'flex_define.dart';
import 'flex_node.dart';
import 'flex_spacing.dart';
import 'prop.dart';

class _ProxyStyleProvider extends MethodPropProvider {
  static StyleMethodPropProvider kStyleProvider = StyleMethodPropProvider();

  _ProxyStyleProvider(MethodPropProvider? extraProvider) {
    pushProvider(kStyleProvider);
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
      case NodeProps.kWidth:
        styleWidth = value;
        break;
      case NodeProps.kMinWidth:
        styleMinWidth = value;
        break;
      case NodeProps.kMaxWidth:
        styleMinWidth = value;
        break;
      case NodeProps.kHeight:
        styleHeight = value;
        break;
      case NodeProps.kMinHeight:
        styleMinHeight = value;
        break;
      case NodeProps.kMaxHeight:
        styleMaxHeight = value;
        break;
      case NodeProps.kFlex:
        flex = value;
        break;
      case NodeProps.kFlexGrow:
        flexGrow = value;
        break;
      case NodeProps.kFlexShrink:
        flexShrink = value;
        break;
      case NodeProps.kFlexBasis:
        flexBasis = value;
        break;
      case NodeProps.kMargin:
        setMargin(FlexStyleEdge.all, value);
        break;
      case NodeProps.kMarginVertical:
        setMargin(FlexStyleEdge.vertical, value);
        break;
      case NodeProps.kMarginHorizontal:
        setMargin(FlexStyleEdge.horizontal, value);
        break;
      case NodeProps.kMarginLeft:
        setMargin(FlexStyleEdge.left, value);
        break;
      case NodeProps.kMarginRight:
        setMargin(FlexStyleEdge.right, value);
        break;
      case NodeProps.kMarginTop:
        setMargin(FlexStyleEdge.top, value);
        break;
      case NodeProps.kMarginBottom:
        setMargin(FlexStyleEdge.bottom, value);
        break;
      case NodeProps.kPadding:
        setPadding(FlexStyleEdge.all, value);
        break;
      case NodeProps.kPaddingVertical:
        setPadding(FlexStyleEdge.vertical, value);
        break;
      case NodeProps.kPaddingHorizontal:
        setPadding(FlexStyleEdge.horizontal, value);
        break;
      case NodeProps.kPaddingLeft:
        setPadding(FlexStyleEdge.left, value);
        break;
      case NodeProps.kPaddingRight:
        setPadding(FlexStyleEdge.right, value);
        break;
      case NodeProps.kPaddingTop:
        setPadding(FlexStyleEdge.top, value);
        break;
      case NodeProps.kPaddingBottom:
        setPadding(FlexStyleEdge.bottom, value);
        break;
      case NodeProps.kBorderWidth:
        setBorder(FlexStyleEdge.all, value);
        break;
      case NodeProps.kBorderLeftWidth:
        setBorder(FlexStyleEdge.left, value);
        break;
      case NodeProps.kBorderRightWidth:
        setBorder(FlexStyleEdge.right, value);
        break;
      case NodeProps.kBorderTopWidth:
        setBorder(FlexStyleEdge.top, value);
        break;
      case NodeProps.kBorderBottomWidth:
        setBorder(FlexStyleEdge.bottom, value);
        break;
      case NodeProps.kLeft:
        setPosition(FlexStyleEdge.left, value);
        break;
      case NodeProps.kRight:
        setPosition(FlexStyleEdge.right, value);
        break;
      case NodeProps.kTop:
        setPosition(FlexStyleEdge.top, value);
        break;
      case NodeProps.kBottom:
        setPosition(FlexStyleEdge.bottom, value);
        break;
      default:
        break;
    }
  }

  void setPropString(String name, String? value) {
    switch (name) {
      case NodeProps.kFlexDirection:
        styleCssDirection = value == null
            ? FlexCSSDirection.column
            : flexCssDirectionFromValue(value) ?? FlexCSSDirection.column;
        break;
      case NodeProps.kFlexWrap:
        wrap = value == null
            ? FlexWrap.noWrap
            : flexWrapFromValue(value) ?? FlexWrap.noWrap;
        break;
      case NodeProps.kAlignSelf:
        alignSelf = value == null
            ? FlexAlign.auto
            : flexAlignFromValue(value) ?? FlexAlign.auto;
        break;
      case NodeProps.kAlignItems:
        alignItems = value == null
            ? FlexAlign.stretch
            : flexAlignFromValue(value) ?? FlexAlign.stretch;
        break;
      case NodeProps.kJustifyContent:
        justifyContent = value == null
            ? FlexJustify.flexStart
            : flexJustifyFromValue(value) ?? FlexJustify.flexStart;
        break;
      case NodeProps.kOverflow:
        overflow = value == null
            ? FlexOverflow.visible
            : flexOverflowFromValue(value) ?? FlexOverflow.visible;
        break;
      case NodeProps.kDisplay:
        if (value == "none") {
          display = FlexDisplay.displayNode;
        } else {
          display = FlexDisplay.displayFlex;
        }
        break;
      case NodeProps.kPosition:
        var positionType = value == null
            ? FlexPositionType.relative
            : flexPositionTypeFromValue(value) ?? FlexPositionType.relative;
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
    pushFloatMethodProp(NodeProps.kWidth);
    pushFloatMethodProp(NodeProps.kMinWidth);
    pushFloatMethodProp(NodeProps.kMaxWidth);
    pushFloatMethodProp(NodeProps.kHeight);
    pushFloatMethodProp(NodeProps.kMinHeight);
    pushFloatMethodProp(NodeProps.kMaxHeight);
    pushFloatMethodProp(NodeProps.kFlex);
    pushFloatMethodProp(NodeProps.kFlexGrow);
    pushFloatMethodProp(NodeProps.kFlexShrink);
    pushFloatMethodProp(NodeProps.kFlexBasis);
    pushFloatMethodProp(NodeProps.kMargin);
    pushFloatMethodProp(NodeProps.kMarginVertical);
    pushFloatMethodProp(NodeProps.kMarginHorizontal);
    pushFloatMethodProp(NodeProps.kMarginLeft);
    pushFloatMethodProp(NodeProps.kMarginRight);
    pushFloatMethodProp(NodeProps.kMarginTop);
    pushFloatMethodProp(NodeProps.kMarginBottom);
    pushFloatMethodProp(NodeProps.kPadding);
    pushFloatMethodProp(NodeProps.kPaddingVertical);
    pushFloatMethodProp(NodeProps.kPaddingHorizontal);
    pushFloatMethodProp(NodeProps.kPaddingLeft);
    pushFloatMethodProp(NodeProps.kPaddingRight);
    pushFloatMethodProp(NodeProps.kPaddingTop);
    pushFloatMethodProp(NodeProps.kPaddingBottom);
    pushFloatMethodProp(NodeProps.kBorderWidth);
    pushFloatMethodProp(NodeProps.kBorderLeftWidth);
    pushFloatMethodProp(NodeProps.kBorderRightWidth);
    pushFloatMethodProp(NodeProps.kBorderTopWidth);
    pushFloatMethodProp(NodeProps.kBorderBottomWidth);
    pushFloatMethodProp(NodeProps.kLeft);
    pushFloatMethodProp(NodeProps.kRight);
    pushFloatMethodProp(NodeProps.kTop);
    pushFloatMethodProp(NodeProps.kBottom);

    pushStringMethodProp(NodeProps.kPosition);
    pushStringMethodProp(NodeProps.kFlexDirection);
    pushStringMethodProp(NodeProps.kFlexWrap);
    pushStringMethodProp(NodeProps.kAlignSelf);
    pushStringMethodProp(NodeProps.kAlignItems);
    pushStringMethodProp(NodeProps.kJustifyContent);
    pushStringMethodProp(NodeProps.kOverflow);
    pushStringMethodProp(NodeProps.kDisplay);
    pushStringMethodProp(NodeProps.kWhiteSpace);

    pushMethodProp(
        NodeProps.kOnLayout,
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
