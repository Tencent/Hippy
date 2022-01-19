//
// Tencent is pleased to support the open source community by making
// Hippy available.
//
// Copyright (C) 2019 THL A29 Limited, a Tencent company.
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

import '../common.dart';
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
          if (value is VoltronMap && key == NodeProps.kStyle) {
            updateStyle(t, value);
          }
        }
      });
    }
  }

  static void updateStyleProp<T extends StyleMethodPropConsumer>(
      T t, String key, Object value) {
    final provider = t.provider;
    final Map<String, StyleMethodProp>? methodMap = provider.styleMethodMap;

    if (methodMap != null) {
      var styleMethodHolder = methodMap[key];
      if (styleMethodHolder != null) {
        var realValue = checkValueType(value, styleMethodHolder.defaultValue);
        if (realValue != null) {
          styleMethodHolder.method(t, realValue);
        } else {
          styleMethodHolder.method(t, styleMethodHolder.defaultValue);
        }
      } else {
        if (value is VoltronMap && key == NodeProps.kStyle) {
          updateStyle(t, value);
        }
      }
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
