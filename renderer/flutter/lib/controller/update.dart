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

import 'dart:collection';

import '../common.dart';
import '../render.dart';
import '../style.dart';
import '../util.dart';
import 'props.dart';

class ControllerUpdateUtil {
  static const String kTag = "ControllerUpdateUtil";
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
          LogUtils.e(kTag,
              "update controller($propertyName) prop($prop) to ($value) error:$e");
        }
        if (value is VoltronMap && prop == NodeProps.kStyle) {
          updateProps(t, node, value);
        }
      } else {
        if (value is VoltronMap && prop == NodeProps.kStyle) {
          updateProps(t, node, value);
        } else {
          t.setCustomProp(node, prop, value);
        }
      }
    }
  }
}
