import 'dart:collection';

import '../common/voltron_array.dart';
import '../common/voltron_map.dart';
import '../engine/engine_context.dart';
import '../flexbox/flex_node.dart';
import '../util/num_util.dart';
import 'prop.dart';

abstract class DomNode extends FlexNode implements StyleMethodPropConsumer {
  final int _rootId;
  final int _id;
  final String _name;

  /// 前端元素标签
  final String _tagName;

  bool _isNodeUpdated = true;

  double? _lastX;
  double? _lastY;
  double? _lastWidth;
  double? _lastHeight;

  VoltronMap? totalProps;

  bool isLazy = false;
  bool isJustLayout = false;
  bool shouldNotifyOnLayout = false;

  bool get enableScale => false;

  bool get isChildVirtual => false;

  DomNode(this._rootId, this._id, this._name, this._tagName);

  int get id => _id;

  String get name => _name;

  String get tagName => _tagName;

  int get rootId => _rootId;

  bool get isRoot => name == NodeProps.rootNode;

  DomNodeDomainData get domainData => DomNodeDomainData(
        id: _id,
        rootId: _rootId,
        parentId: parent?.id ?? -1,
        name: _name,
        tagName: _tagName,
        layoutX: getJsonDoubleNumber(_lastX),
        layoutY: getJsonDoubleNumber(_lastY),
        width: getJsonDoubleNumber(_lastWidth),
        height: getJsonDoubleNumber(_lastHeight),
        text: totalProps?.get<String>(NodeProps.text) ?? '',
        style: totalProps?.get<VoltronMap>(NodeProps.style) ?? VoltronMap(),
        attributes:
            totalProps?.get<VoltronMap>(NodeProps.attributes) ?? VoltronMap(),
      );

  bool shouldUpdateLayout(double x, double y) {
    var res = !(_lastX == x &&
        _lastY == y &&
        _lastWidth == layoutWidth &&
        _lastHeight == layoutHeight);

    if (res) {
      _lastX = x;
      _lastY = y;
      _lastWidth = layoutWidth;
      _lastHeight = layoutHeight;
    }

    return res;
  }

  void toStringWithIndentation(StringBuffer result, int level) {
    // Spaces and tabs are dropped by IntelliJ logcat integration, so rely on __ instead.
    var indentation = StringBuffer();
    for (var i = 0; i < level; ++i) {
      indentation.write("__");
    }

    result.write(indentation.toString());
    result.write("id:$id");
    result.write(" className:$name ");
    //		result.append(mFlexNodeStyle.toString());
    result.write(resultToString());

    if (childCount == 0) {
      return;
    }

    result.write(", children: [\n");
    for (var i = 0; i < childCount; i++) {
      getChildAt(i).toStringWithIndentation(result, level + 1);
      result.write("\n");
    }
    result.write("$indentation]");
  }

  @override
  DomNode getChildAt(int i) {
    return super.getChildAt(i) as DomNode;
  }

  @override
  DomNode? get parent {
    return super.parent as DomNode?;
  }

  @override
  void dirty() {
    if (!isVirtual()) {
      super.dirty();
    }
  }

  bool isVirtual() => false;

  bool hasUpdates() => _isNodeUpdated || hasNewLayout || isDirty;

  void markUpdateSeen() {
    _isNodeUpdated = false;
    if (hasNewLayout) {
      markLayoutSeen();
    }
  }

  void markUpdated() {
    if (_isNodeUpdated) {
      return;
    }
    _isNodeUpdated = true;
    parent?.markUpdated();
  }

  @override
  DomNode? removeChildAt(int i) {
    var removed = super.removeChildAt(i) as DomNode?;
    markUpdated();

    return removed;
  }

  void setDefaultPadding(int spacingType, double padding) {
    super.setPadding(spacingType, padding);
  }

  @override
  String toString() {
    var sb = StringBuffer();
    toStringWithIndentation(sb, 0);
    return sb.toString();
  }

  void updateProps(VoltronMap? props) {
    // empty
  }

  void updateData(EngineContext context) {}

  void layoutBefore(EngineContext context) {}

  void layoutAfter(EngineContext context) {}
}

/// DomNode领域层数据
class DomNodeDomainData {
  final int id;
  final int rootId;
  final int parentId;
  final String name;
  final String tagName;
  final double layoutX;
  final double layoutY;
  final double width;
  final double height;
  final String text;

  /// 节点样式，包含内联样式
  final VoltronMap style;

  /// 节点的属性值
  final VoltronMap attributes;

  DomNodeDomainData({
    required this.id,
    required this.rootId,
    required this.parentId,
    required this.name,
    required this.tagName,
    required this.layoutX,
    required this.layoutY,
    required this.width,
    required this.height,
    required this.text,
    required this.style,
    required this.attributes,
  });
}
