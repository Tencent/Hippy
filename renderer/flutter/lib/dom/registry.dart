import 'dart:collection';

import 'dom_node.dart';

class DomNodeRegistry {
  final HashMap<int, DomNode> _nodeTags = HashMap();
  final HashMap<int, bool> _rootTags = HashMap();

  DomNodeRegistry();

  void removeNode(int tag) {
    _nodeTags.remove(tag);
  }

  void addRootNode(DomNode node) {
    var tag = node.id;
    _nodeTags[tag] = node;
    _rootTags[tag] = true;
  }

  void removeRootNode(int tag) {
    _nodeTags.remove(tag);
    _rootTags.remove(tag);
  }

  void addNode(DomNode node) {
    _nodeTags[node.id] = node;
  }

  DomNode? getNode(int? tag) {
    if (tag == null) {
      return null;
    }

    return _nodeTags[tag];
  }

  DomNode? getNodeFirstChild(int? tag) {
    if (tag == null) {
      return null;
    }

    final nodeChildren = _nodeTags[tag]?.children;
    if (nodeChildren != null && nodeChildren.isNotEmpty) {
      return nodeChildren[0] as DomNode;
    }
    return null;
  }

  bool isRootNode(int tag) {
    return _rootTags[tag] != null;
  }

  int getRootNodeCount() {
    return _rootTags.length;
  }

  void foreachRootTag(void func(int rootTag, bool flag)) {
    _rootTags.forEach((key, value) {
      func(key, value);
    });
  }

  void clear() {
    _nodeTags.clear();
    _rootTags.clear();
  }
}
