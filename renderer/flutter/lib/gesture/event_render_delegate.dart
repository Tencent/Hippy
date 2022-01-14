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
