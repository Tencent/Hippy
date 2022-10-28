//
// Tencent is pleased to support the open source community by making
// Hippy available.
//
// Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

import 'package:voltron_renderer/common.dart';

extension VoltronMapParsing on Map {
  VoltronMap toVoltronMap() {
    var voltronMap = VoltronMap();
    for (var key in keys) {
      var value = this[key];
      if (value is Map) {
        voltronMap.push(key, value.toVoltronMap());
      } else if (value is List) {
        voltronMap.push(key, value.toVoltronArray());
      } else if (value is VoltronMap) {
        voltronMap.push(key, value.toDeepVoltronMap());
      } else if (value is VoltronArray) {
        voltronMap.push(key, value.toDeepVoltronArray());
      } else if (value is bool || value is String || value is num) {
        voltronMap.push(key, value);
      } else {
        throw 'type: ${value.runtimeType} is not support';
      }
    }
    return voltronMap;
  }

  Map toDeepMap() {
    var m = {};
    for (var key in keys) {
      var value = this[key];
      if (value is Map) {
        m[key] = value.toDeepMap();
      } else if (value is List) {
        m[key] = value.toDeepList();
      } else if (value is VoltronMap) {
        m[key] = value.toMap();
      } else if (value is VoltronArray) {
        m[key] = value.toList();
      } else {
        m[key] = value;
      }
    }
    return m;
  }
// ···
}

extension VoltronArrayParsing on List {
  VoltronArray toVoltronArray() {
    var voltronArray = VoltronArray();
    for (var element in this) {
      if (element is Map) {
        voltronArray.push(element.toVoltronMap());
      } else if (element is List) {
        voltronArray.push(element.toVoltronArray());
      } else if (element is VoltronMap) {
        voltronArray.push(element.toDeepVoltronMap());
      } else if (element is VoltronArray) {
        voltronArray.push(element.toDeepVoltronArray());
      } else if (element is bool || element is String || element is num) {
        voltronArray.push(element);
      } else {
        throw 'type: ${element.runtimeType} is not support';
      }
    }
    return voltronArray;
  }

  List toDeepList() {
    var l = [];
    for (var element in this) {
      if (element is Map) {
        l.add(element.toDeepMap());
      } else if (element is List) {
        l.add(element.toDeepList());
      } else if (element is VoltronMap) {
        l.add(element.toMap());
      } else if (element is VoltronArray) {
        l.add(element.toList());
      } else {
        l.add(element);
      }
    }
    return l;
  }
// ···
}

extension VoltronObjectParsing on Object {
  Object toVoltronObject () {
    var temp = this;
    if (temp is Map) {
      temp = temp.toVoltronMap();
    } else if (temp is List) {
      temp = temp.toVoltronArray();
    } else if (temp is VoltronMap) {
      temp = temp.toDeepVoltronMap();
    } else if (temp is VoltronArray) {
      temp = temp.toDeepVoltronArray();
    }
    return temp;
  }

  Object toOriginObject () {
    var temp = this;
    if (temp is VoltronMap) {
      temp = temp.toMap();
    } else if (temp is VoltronArray) {
      temp = temp.toList();
    } else if (temp is Map) {
      temp = temp.toDeepMap();
    } else if (temp is List) {
      temp = temp.toDeepList();
    }
    return temp;
  }
}
