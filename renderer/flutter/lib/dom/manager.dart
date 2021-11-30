import 'dart:collection';

import 'package:flutter/cupertino.dart';

import '../common/destroy.dart';
import '../common/voltron_array.dart';
import '../common/voltron_map.dart';
import '../engine/engine_context.dart';
import '../module/event_dispatcher.dart';
import '../module/module.dart';
import '../module/promise.dart';
import '../render/manager.dart';
import '../util/animation_util.dart';
import '../util/diff.dart';
import '../util/enum_util.dart';
import '../util/log_util.dart';
import '../util/num_util.dart';
import '../util/render_util.dart';
import '../util/time_util.dart';
import '../voltron/lifecycle.dart';
import '../widget/root.dart';
import 'dom_node.dart';
import 'interceptor.dart';
import 'prop.dart';
import 'style_node.dart';
import 'update.dart';

typedef IDomExecutor = void Function();
typedef TDOMManagerBatchHook = void Function(EngineContext context);

class DomManager {
  bool _hasAddFrameCallback = false;
  static const String tag = "DomManager";
  final HashMap<int, bool> _tagsWithLayoutVisited = HashMap();


  bool isJustLayout(Object obj) {
    if (!(obj is VoltronMap)) {
      return true;
    }
    var props = obj;
    if (props.get(NodeProps.collapsable) != null &&
        props.get(NodeProps.collapsable) == false) {
      return false;
    }

    final sets = props.keySet();

    for (var key in sets) {
      if (!NodeProps.isJustLayout(props, key)) {
        return false;
      }
    }
    return true;
  }

  bool isTouchEvent(VoltronMap? props) {
    if (props == null) {
      return false;
    }
    final sets = props.keySet();
    for (var key in sets) {
      if (NodeProps.isTouchEventProp(key)) {
        return true;
      }
    }
    return false;
  }

  void addActionInterceptor(DomActionInterceptor interceptor) {
    _actionInterceptors.add(interceptor);
  }

  void removeActionInterceptor(DomActionInterceptor interceptor) {
    _actionInterceptors.remove(interceptor);
  }

  @override
  void onInstanceDestroy(int instanceId) {
    var viewModel = _context.getInstance(instanceId);
    if (viewModel != null) {
      if (viewModel.executor != null) {
        _pageUpdateTasks.remove(viewModel.executor);
      }

      _pageUpdateTasks.remove(viewModel.viewExecutor);
    }
  }

  void markNodeDirtyWhenForceUpdate(DomNode? node) {
    if (node != null) {
      var childCount = node.childCount;
      for (var i = 0; i < childCount; i++) {
        markNodeDirtyWhenForceUpdate(node.getChildAt(i));
      }

      if (node.enableScale) {
        node.dirty();
      }
    }
  }

  DomNode? findNativeViewParent(DomNode domNode) {
    var nativeParent = domNode.parent;
    while (nativeParent != null && nativeParent.isJustLayout == true) {
      nativeParent = nativeParent.parent;
    }
    return nativeParent;
  }

  ViewIndex findNativeViewIndex(
      DomNode nativeParentNode, DomNode node, int index) {
    for (var i = 0; i < nativeParentNode.childCount; i++) {
      var childNode = nativeParentNode.getChildAt(i);
      if (childNode == node) {
        return ViewIndex(true, index);
      }

      if (childNode.isJustLayout) {
        var viewIndex = findNativeViewIndex(childNode, node, index);
        if (viewIndex.result) {
          return viewIndex;
        } else {
          index = viewIndex.index;
        }
      } else {
        index++;
      }
    }
    return ViewIndex(false, index);
  }

  void _applyLayoutXY(final DomNode domStyle, final double x, final double y) {
    LogUtils.dLayout(
        "_applyLayoutXY ID:${domStyle.id}, ($x, $y), (${domStyle.layoutWidth}, ${domStyle.layoutHeight}), isJustLayout:${domStyle.isJustLayout}");
    if (!domStyle.isJustLayout && !domStyle.isVirtual()) {
      if (domStyle.shouldUpdateLayout(x, y)) {
        addUITask(() {
          var newLeft = x;
          var newTop = y;

          _renderManager.updateLayout(domStyle.rootId, domStyle.id, newLeft,
              newTop, domStyle.layoutWidth, domStyle.layoutHeight);
        });
      }
      return;
    }

    for (var i = 0; i < domStyle.childCount; i++) {
      var child = domStyle.getChildAt(i);
      var childTag = child.id;
      if (_tagsWithLayoutVisited[childTag] == true) {
        continue;
      }
      _tagsWithLayoutVisited[childTag] = true;

      var childX = child.layoutX;
      var childY = child.layoutY;

      childX += x;
      childY += y;

      _applyLayoutXY(child, childX, childY);
    }
  }

  void changeJustLayout2View(final DomNode node, final VoltronMap paramsMap,
      final RootWidgetViewModel rootWidgetViewModel) {
    //step1: create child
    final reallyParent = findNativeViewParent(node);
    if (reallyParent == null) {
      return;
    }

    final viewIndex = findNativeViewIndex(reallyParent, node, 0);

    if (!node.isVirtual()) {
      final newProps = paramsMap;
      addUITask(() {
        _renderManager.createNode(rootWidgetViewModel, node.id, reallyParent.id,
            viewIndex.index, node.name, newProps);
      });
    }

    //step2: move child
    final moveIds = <int>[];
    node.markUpdated();
    findMoveChildren(node, moveIds);
    node.isJustLayout = false;

    if (!node.isVirtual()) {
      addUITask(() {
        _renderManager.moveNode(
            rootWidgetViewModel.id, moveIds, reallyParent.id, node.id);
      });
    }
    //step3:updateStyle Layout
    applyLayoutUpdateRecursive(node);
    _tagsWithLayoutVisited.clear();
  }

  void findMoveChildren(DomNode node, List<int> remove) {
    for (var i = 0; i < node.childCount; i++) {
      var childNode = node.getChildAt(i);

      if (childNode.isJustLayout) {
        findMoveChildren(childNode, remove);
      } else {
        childNode.markUpdated();
        remove.add(childNode.id);
      }
    }
  }

  void deleteJustLayoutChild(DomNode node) {
    for (var i = 0; i < node.childCount; i++) {
      LogUtils.dDom("delete just layout child:$node");
      final childNode = node.getChildAt(i);
      if (childNode.isJustLayout) {
        deleteJustLayoutChild(childNode);
      } else {
        if (!childNode.isVirtual()) {
          addUITask(() {
            _renderManager.deleteNode(childNode.rootId, childNode.id);
          });
        }
      }
    }
  }


  void measureInWindow(final int id, final Promise promise) {
    var node = _nodeRegistry.getNode(id);
    if (node == null) {
      return;
    }

    addNulUITask(() {
      _renderManager.measureInWindow(node.rootId, id, promise);
    });
  }
}

class ViewIndex {
  final bool result;
  final int index;

  const ViewIndex(this.result, this.index);
}
