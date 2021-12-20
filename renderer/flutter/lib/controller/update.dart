import 'dart:collection';

import '../common.dart';
import '../render.dart';
import '../style.dart';
import '../util.dart';
import 'props.dart';

class ControllerUpdateUtil {
  static const String tag = "ControllerUpdateUtil";
  static HashMap<String, ControllerMethodPropProvider> sPropsMethodMap =
      HashMap();

  static void updateProps<T extends ControllerMethodPropConsumer>(
      T? t, RenderNode node, VoltronMap? paramsMap) {
    if (paramsMap == null || t == null) {
      return;
    }

    final propertyName = t.name;
    var provider = sPropsMethodMap[propertyName];
    if (provider == null) {
      provider = t.generateProvider();
      sPropsMethodMap[propertyName] = provider;
    }

    final methodMap = provider.renderMethodMap;
    final props = paramsMap.keySet();
    for (var prop in props) {
      final value = paramsMap.get(prop);
      var propMethodHolder = methodMap[prop];
      if (propMethodHolder != null) {
        final realValue = checkValueType(value, propMethodHolder.defaultValue);
        try {
          if (realValue != null) {
            Function.apply(
                propMethodHolder.method, [node.renderViewModel, realValue]);
          } else {
            Function.apply(propMethodHolder.method,
                [node.renderViewModel, propMethodHolder.defaultValue]);
          }
        } catch (e) {
          LogUtils.e(tag,
              "update controller($propertyName) prop($prop) to ($value) error:$e");
        }
        if (value is VoltronMap && prop == NodeProps.style) {
          updateProps(t, node, value);
        }
      } else {
        if (value is VoltronMap && prop == NodeProps.style) {
          updateProps(t, node, value);
        } else {
          t.setCustomProp(node, prop, value);
        }
      }
    }
  }
}
