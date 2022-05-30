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

import 'package:voltron_renderer/common.dart';
import 'package:voltron_renderer/gesture.dart';
import 'package:voltron_renderer/render.dart';
import 'package:voltron_renderer/style.dart';

import '../controller/text.dart';

abstract class VirtualNode with StyleMethodPropConsumer {
  final int rootId;
  final int id;
  final int pid;
  final int index;
  final RenderContext _renderContext;

  RenderContext get context => _renderContext;

  @override
  MethodPropProvider get provider;

  // 手势事件相关
  late NativeGestureDispatcher nativeGestureDispatcher;

  List<VirtualNode> mChildren = [];
  VirtualNode? mParent;
  bool dirty = false;

  VirtualNode(this.rootId, this.id, this.pid, this.index, this._renderContext) {
    nativeGestureDispatcher =
        NativeGestureDispatcher(rootId: rootId, id: id, context: _renderContext);
  }

  void removeChild(VirtualNode child) {
    mChildren.remove(child);
  }

  addChildAt(VirtualNode child, int index) {
    if (child.mParent != null) {
      return;
    }
    mChildren.insert(index, child);
    child.mParent = this;
  }

  VirtualNode? getChildAt(int index) {
    return mChildren[index];
  }

  int get childCount => mChildren.length;

  void setGestureType(GestureType type, bool flag) {
    if (flag) {
      nativeGestureDispatcher.addGestureType(type);
    } else {
      nativeGestureDispatcher.removeGestureType(type);
    }
  }

  void markDirty() {
    mParent?.markDirty();
    dirty = true;
  }

  void updateEvent(EventHolder holder) {
    switch (holder.eventName) {
      case NativeGestureHandle.kClick:
        setGestureType(GestureType.click, holder.isAdd);
        break;
      case NativeGestureHandle.kLongClick:
        setGestureType(GestureType.longClick, holder.isAdd);
        break;
      case NativeGestureHandle.kTouchDown:
        setGestureType(GestureType.touchDown, holder.isAdd);
        break;
      case NativeGestureHandle.kTouchMove:
        setGestureType(GestureType.touchMove, holder.isAdd);
        break;
      case NativeGestureHandle.kTouchEnd:
        setGestureType(GestureType.touchEnd, holder.isAdd);
        break;
      case NativeGestureHandle.kTouchCancel:
        setGestureType(GestureType.touchCancel, holder.isAdd);
        break;
      case NativeGestureHandle.kPressIn:
        setGestureType(GestureType.pressIn, holder.isAdd);
        break;
      case NativeGestureHandle.kPressOut:
        setGestureType(GestureType.pressOut, holder.isAdd);
        break;
    }
    markDirty();
  }

  void onDelete() {}
}

class VirtualNodeManager {
  final String tag = 'VirtualNodeManager';

  Map<int, VirtualNode> mVirtualNodes = {};

  List<int> mUpdateNodes = [];

  RenderContext context;

  VirtualNodeManager(this.context);

  bool hasVirtualParent(int id) {
    VirtualNode? node = mVirtualNodes[id];
    return node != null && node.mParent != null;
  }

  TextExtra? updateLayout(int id, double width, List<dynamic> layoutNode) {
    VirtualNode? node = mVirtualNodes[id];
    if (node is! TextVirtualNode || node.mParent != null) {
      return null;
    }
    double leftPadding = 0.0;
    double topPadding = 0.0;
    double rightPadding = 0.0;
    double bottomPadding = 0.0;
    try {
      leftPadding = layoutNode[5].toDouble();
      topPadding = layoutNode[6].toDouble();
      rightPadding = layoutNode[7].toDouble();
      bottomPadding = layoutNode[8].toDouble();
    } catch (err) {
      //
    }
    final data = node.createData(width - leftPadding - rightPadding, FlexMeasureMode.exactly);
    return TextExtra(
      data,
      leftPadding,
      rightPadding,
      bottomPadding,
      topPadding,
    );
  }

  VirtualNode? createVirtualNode(
    int rootId,
    int id,
    int pid,
    int index,
    String className,
    VoltronMap props,
  ) {
    VirtualNode? node = context.renderManager.createVirtualNode(
      id,
      pid,
      index,
      className,
      props,
    );
    VirtualNode? parent = mVirtualNodes[pid];
    // // Only text or text child need to create virtual node.
    if (className == NodeProps.kTextClassName) {
      node = TextVirtualNode(rootId, id, pid, index, context);
    } else if (className == NodeProps.kImageClassName && parent != null) {
      node = ImageVirtualNode(rootId, id, pid, index, context);
    }
    return node;
  }

  void createNode(int rootId, int id, int pid, int index, String className, VoltronMap props) {
    VirtualNode? node = createVirtualNode(rootId, id, pid, index, className, props);
    if (node == null) {
      return;
    }
    mVirtualNodes[id] = node;
    VirtualNode? parent = mVirtualNodes[pid];
    if (parent != null) {
      parent.addChildAt(node, index);
    }
    updateProps(node, props, true);
  }

  void updateNode(int id, VoltronMap props) {
    VirtualNode? node = mVirtualNodes[id];
    if (node != null) {
      updateProps(node, props, true);
      if (node.mParent == null) {
        if (!mUpdateNodes.contains(id)) {
          mUpdateNodes.add(id);
        }
      }
    }
  }

  void deleteNode(int id) {
    VirtualNode? node = mVirtualNodes[id];
    if (node == null) {
      return;
    }
    node.onDelete();
    node.mParent?.removeChild(node);
    node.mParent = null;
    for (var child in node.mChildren) {
      deleteNode(child.id);
    }
    node.mChildren.clear();
    mVirtualNodes.remove(id);
  }

  Map<int, TextData>? endBatch() {
    Map<int, TextData> textDataMap = {};
    if (mUpdateNodes.isEmpty) {
      return null;
    }
    for (var id in mUpdateNodes) {
      VirtualNode? node = mVirtualNodes[id];
      if (node is TextVirtualNode) {
        // If the node has been updated, but there is no updateLayout call from native(C++)
        // render manager, we should renew the layout on end batch and update to render node.
        TextData textData = node.createLayout();
        textDataMap[id] = textData;
      }
    }
    return textDataMap;
  }

  void updateProps(VirtualNode node, VoltronMap? props, bool needToReset) {
    if (props == null) {
      return;
    }
    final provider = node.provider;
    final Map<String, StyleMethodProp>? methodMap = provider.styleMethodMap;

    if (methodMap != null) {
      props.data.forEach((key, value) {
        var styleMethodHolder = methodMap[key];
        if (styleMethodHolder != null) {
          var realValue = checkValueType(value, styleMethodHolder.defaultValue);
          if (realValue != null) {
            styleMethodHolder.method(node, realValue);
          } else {
            styleMethodHolder.method(node, styleMethodHolder.defaultValue);
          }
        } else {
          if (value is VoltronMap && key == NodeProps.kStyle) {
            updateProps(node, value, false);
          }
        }
      });
    }
  }

  void addEvent(int rootId, int id, String eventName) {
    VirtualNode? node = mVirtualNodes[id];
    if (node == null) {
      return;
    }
    node.updateEvent(EventHolder(eventName, isAdd: true));
  }

  void removeEvent(int rootId, int id, String eventName) {
    VirtualNode? node = mVirtualNodes[id];
    if (node == null) {
      return;
    }
    node.updateEvent(EventHolder(eventName, isAdd: false));
  }
}
