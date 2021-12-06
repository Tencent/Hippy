import '../common/voltron_map.dart';
import 'prop.dart';

class DomUpdateUtil {
  static void updateStyle<T extends StyleMethodPropConsumer>(
      T? t, VoltronMap? paramsMap) {
    if (paramsMap == null || t == null) {
      return;
    }

    final provider = t.provider;
    final Map<String, StyleMethodProp>? methodMap = provider.styleMethodMap;

    if (methodMap != null) {
      paramsMap.data.forEach((key, value) {
        var styleMethodHolder = methodMap[key];
        if (styleMethodHolder != null) {
          var realValue = checkValueType(value, styleMethodHolder.defaultValue);
          if (realValue != null) {
            styleMethodHolder.method(t, realValue);
          } else {
            styleMethodHolder.method(t, styleMethodHolder.defaultValue);
          }
        } else {
          if (value is VoltronMap && key == NodeProps.style) {
            updateStyle(t, value);
          }
        }
      });
    }
  }
}

Object? checkValueType(Object? value, Object? defaultValue) {
  if (value.runtimeType == defaultValue.runtimeType) {
    return value;
  }

  if (value is num && defaultValue is num) {
    if (defaultValue is double) {
      return value.toDouble();
    } else if (defaultValue is int) {
      return value.toInt();
    }
  }

  if (defaultValue == null) {
    return value;
  }

  return null;
}
