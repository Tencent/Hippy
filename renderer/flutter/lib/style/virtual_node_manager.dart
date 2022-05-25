import 'package:voltron_renderer/common.dart';
import 'package:voltron_renderer/render.dart';
import 'package:voltron_renderer/style.dart';

import '../controller/text.dart';

abstract class VirtualNode with StyleMethodPropConsumer {
  final int mId;
  final int mPid;
  final int mIndex;

  MethodPropProvider get provider;

  List<VirtualNode> mChildren = [];
  VirtualNode? mParent;

  VirtualNode(this.mId, this.mPid, this.mIndex);

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
      node = TextVirtualNode(id, pid, index);
    } else if (className == NodeProps.kImageClassName && parent != null) {
      node = ImageVirtualNode(id, pid, index);
    }
    return node;
  }

  void createNode(int id, int pid, int index, String className, VoltronMap props) {
    VirtualNode? node = createVirtualNode(id, pid, index, className, props);
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
    node.mParent?.removeChild(node);
    node.mParent = null;
    for (var child in node.mChildren) {
      deleteNode(child.mId);
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
}
