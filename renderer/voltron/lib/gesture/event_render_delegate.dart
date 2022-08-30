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

mixin EventRenderDelegate {
  final Map<int, Map<int, Set<String>>> _instanceEventMap = {};

  void createInstance(int instanceId) {
    _instanceEventMap[instanceId] = {};
  }

  void destroyInstance(int instanceId) {
    _instanceEventMap.remove(instanceId);
  }

  Set<String> nodeEvents(int instanceId, int nodeId) {
    return _instanceEventMap[instanceId]?[nodeId]??{};
  }

  bool addEvent(int instanceId, int nodeId, String eventName) {
    bool addSuccess = false;
    var instanceMap = _instanceEventMap[instanceId];
    if (instanceMap != null) {
      var nodeEventSet = instanceMap[nodeId]??<String>{};
      if (!nodeEventSet.contains(eventName)) {
        nodeEventSet.add(eventName);
        addSuccess = true;
      }
      instanceMap[nodeId] = nodeEventSet;
    }
    return addSuccess;
  }

  bool removeEvent(int instanceId, int nodeId, String eventName) {
    bool removeSuccess = false;
    var instanceMap = _instanceEventMap[instanceId];
    if (instanceMap != null) {
      var nodeEventSet = instanceMap[nodeId]??<String>{};
      if (nodeEventSet.contains(eventName)) {
        nodeEventSet.remove(eventName);
        removeSuccess = true;
      }
      instanceMap[nodeId] = nodeEventSet;
    }
    return removeSuccess;
  }

  void destroy() {
    _instanceEventMap.clear();
  }
}
