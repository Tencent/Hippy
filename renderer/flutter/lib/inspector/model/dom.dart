// import 'package:flutter/rendering.dart';
//
// import '../../../common/voltron_map.dart';
// import '../../../dom/dom_node.dart';
// import '../../../dom/prop.dart';
// import '../../../engine/engine_context.dart';
// import '../../../render/node.dart';
// import '../../../render/view_model.dart';
// import 'model.dart';
//
// const String kDefaultFrameId = 'main_frame';
//
// /// https://dom.spec.whatwg.org/#dom-node-nodetype
// class NodeType {
//   static int kElementNode = 1;
//   static int kAttributeNode = 2;
//   static int kTextNode = 3;
//   static int kCDataSectionNOde = 4;
//   static int kProcessingInstructionNode = 5;
//   static int kCommentNode = 6;
//   static int kDocumentNode = 7;
//   static int kDocumentTypeNode = 8;
//   static int kDocumentFragmentNode = 9;
// }
//
// class Document implements InspectorModel {
//   final EngineContext context;
//   Document(this.context);
//
//   String _getInlineStyle(VoltronMap data) {
//     final inlineStyleList = <String>[];
//     for (final entry in data.entrySet()) {
//       var value = entry.value;
//       if (value is num) {
//         value = value.toStringAsFixed(1);
//         ;
//       }
//       inlineStyleList.add('${entry.key}:${value.toString()}');
//     }
//
//     return inlineStyleList.join(';');
//   }
//
//   List<String> _getAttributeList(VoltronMap attributes) {
//     final attributeList = <String>[];
//     for (final entry in attributes.entrySet()) {
//       final key = entry.key;
//       var value = entry.value;
//       if (key == NodeProps.style && value is VoltronMap) {
//         value = _getInlineStyle(value);
//       }
//       if (value == null || value == '') {
//         continue;
//       }
//       attributeList.add(key);
//       attributeList.add(value.toString());
//     }
//
//     return attributeList;
//   }
//
//   Map _getNodeJson(DomNodeDomainData data, int nodeType) {
//     final originNodeId = data.id;
//     final nodeIdStrategy = {
//       // 当节点为Text类型时，其id为其父id的负值
//       NodeType.kTextNode: -originNodeId,
//     };
//     final nodeId = nodeIdStrategy[nodeType] ?? originNodeId;
//
//     return {
//       'nodeId': nodeId,
//       'backendNodeId': 0,
//       'nodeType': nodeType,
//       'localName': data.tagName,
//       'nodeName': data.tagName,
//       'nodeValue': data.text,
//       'parentId': data.parentId,
//       // 显示在标签的属性
//       'attributes': _getAttributeList(data.attributes),
//     };
//   }
//
//   Map _getTextNodeJson(DomNodeDomainData data) {
//     return {
//       ..._getNodeJson(data, NodeType.kTextNode),
//       'childNodeCount': 0,
//       'children': [],
//     };
//   }
//
//   Map? _getNode(int nodeId) {
//     final node = context.domManager.getNode(nodeId);
//     if (node == null) {
//       return null;
//     }
//
//     final children = [];
//     // 如果有节点有text的内容，需要添加TEXT_NODE节点
//     final nodeValue = node.domainData.text;
//     if (nodeValue != '') {
//       children.add(_getTextNodeJson(node.domainData));
//     }
//     for (final child in node.children) {
//       final childNode = _getNode(child.id);
//       if (childNode != null) {
//         children.add(childNode);
//       }
//     }
//     return {
//       ..._getNodeJson(node.domainData, NodeType.kElementNode),
//       'childNodeCount': children.length,
//       'children': children,
//     };
//   }
//
//   Map toJson() {
//     final documentNodeId = -3;
//     final rootId = context.engineId;
//     final rootNode = _getNode(rootId);
//     if (rootNode == null) {
//       return {};
//     }
//
//     return {
//       'root': {
//         'nodeId': documentNodeId,
//         'backendNodeId': documentNodeId,
//         'nodeType': NodeType.kDocumentFragmentNode,
//         'nodeName': '#document',
//         'childNodeCount': rootNode['childNodeCount'],
//         // 去除<root></root>根节点
//         'children': rootNode['children'],
//         // TODO
//         'baseURL': '',
//         // TODO
//         'documentURL': '',
//       },
//     };
//   }
// }
//
// class BoxModel implements InspectorModel {
//   final EngineContext context;
//   final Map params;
//   BoxModel(this.context, this.params);
//
//   List<int> _getBorder(BoundingClientRect boundingClientRect) {
//     final dx = boundingClientRect.dx;
//     final dy = boundingClientRect.dy;
//     final width = boundingClientRect.width;
//     final height = boundingClientRect.height;
//
//     return [
//       dx,
//       dy,
//       dx + width,
//       dy,
//       dx + width,
//       dy + height,
//       dx,
//       dy + height,
//     ];
//   }
//
//   List<int> _getPadding(List<int> border, VoltronMap style) {
//     final borderTop = style.get<double>(NodeProps.borderTopWidth)?.toInt() ?? 0;
//     final borderRight =
//         style.get<double>(NodeProps.borderRightWidth)?.toInt() ?? 0;
//     final borderBottom =
//         style.get<double>(NodeProps.borderBottomWidth)?.toInt() ?? 0;
//     final borderLeft =
//         style.get<double>(NodeProps.borderLeftWidth)?.toInt() ?? 0;
//
//     return [
//       border[0] + borderLeft,
//       border[1] + borderTop,
//       border[2] - borderRight,
//       border[3] + borderTop,
//       border[4] - borderRight,
//       border[5] - borderBottom,
//       border[6] + borderLeft,
//       border[7] - borderBottom,
//     ];
//   }
//
//   List<int> _getContent(List<int> padding, VoltronMap style) {
//     final paddingTop = style.get<double>(NodeProps.paddingTop)?.toInt() ?? 0;
//     final paddingRight =
//         style.get<double>(NodeProps.paddingRight)?.toInt() ?? 0;
//     final paddingBottom =
//         style.get<double>(NodeProps.paddingBottom)?.toInt() ?? 0;
//     final paddingLeft = style.get<double>(NodeProps.paddingLeft)?.toInt() ?? 0;
//
//     return [
//       padding[0] + paddingLeft,
//       padding[1] + paddingTop,
//       padding[2] - paddingRight,
//       padding[3] + paddingTop,
//       padding[4] - paddingRight,
//       padding[5] - paddingBottom,
//       padding[6] + paddingLeft,
//       padding[7] - paddingBottom,
//     ];
//   }
//
//   List<int> _getMargin(List<int> border, VoltronMap style) {
//     final marginTop = style.get<double>(NodeProps.marginTop)?.toInt() ?? 0;
//     final marginRight = style.get<double>(NodeProps.marginRight)?.toInt() ?? 0;
//     final marginBottom =
//         style.get<double>(NodeProps.marginBottom)?.toInt() ?? 0;
//     final marginLeft = style.get<double>(NodeProps.marginLeft)?.toInt() ?? 0;
//
//     return [
//       border[0] - marginLeft,
//       border[1] - marginTop,
//       border[2] + marginRight,
//       border[3] - marginTop,
//       border[4] + marginRight,
//       border[5] + marginBottom,
//       border[6] - marginLeft,
//       border[7] + marginBottom,
//     ];
//   }
//
//   /// 当前坐标(x, y)是否在renderBox内
//   bool _isLocationHitRenderNode(
//       int x, int y, BoundingClientRect? boundingClientRect) {
//     if (boundingClientRect == null) {
//       return false;
//     }
//
//     final dx = boundingClientRect.dx;
//     final dy = boundingClientRect.dy;
//     final width = boundingClientRect.width;
//     final height = boundingClientRect.height;
//     final isInTopOffset = x >= dx && y >= dy;
//     final isInBottomOffset = x <= (dx + width) && y <= (dy + height);
//     final isHit = isInTopOffset && isInBottomOffset;
//     return isHit;
//   }
//
//   /// 获取面积更小的渲染节点
//   RenderNode? _getSmallerAreaRenderNode(
//       RenderNode? oldNode, RenderNode? newNode) {
//     if (oldNode == null) {
//       return newNode;
//     }
//     final oldNodeBCR = oldNode.boundingClientRect;
//     final newNodeBCR = newNode?.boundingClientRect;
//     if (oldNodeBCR == null || newNodeBCR == null) {
//       return oldNode;
//     }
//
//     final oldNodeArea = oldNodeBCR.width * oldNodeBCR.height;
//     final newNodeArea = newNodeBCR.width * newNodeBCR.height;
//     return oldNodeArea > newNodeArea ? newNode : oldNode;
//   }
//
//   /// 获取当前坐标(x, y)所在的最深层级且面积最小的RenderNode节点
//   RenderNode? _getMaxDepthAndMinAreaHitRenderNode(
//       int x, int y, RenderNode? rootNode) {
//     if (rootNode == null ||
//         !_isLocationHitRenderNode(x, y, rootNode.boundingClientRect)) {
//       return null;
//     }
//
//     RenderNode? hitNode;
//     for (final child in rootNode.children) {
//       if (_isLocationHitRenderNode(x, y, child.boundingClientRect)) {
//         final newHitNode = _getMaxDepthAndMinAreaHitRenderNode(x, y, child);
//         hitNode = _getSmallerAreaRenderNode(hitNode, newHitNode);
//       }
//     }
//
//     return hitNode ?? rootNode;
//   }
//
//   Map toJson() {
//     final int nodeId = params['nodeId'] ?? -1;
//     final domNodeDomainData = context.domManager.getNode(nodeId)?.domainData;
//     final boundingClientRect =
//         context.renderManager.getBoundingClientRect(context.engineId, nodeId);
//     if (domNodeDomainData == null || boundingClientRect == null) {
//       return {};
//     }
//
//     // TODO: 计算值校验，当前的计算存在一定偏差
//     final border = _getBorder(boundingClientRect);
//     final style = domNodeDomainData.style;
//     final padding = _getPadding(border, style);
//     final content = _getContent(padding, style);
//     final margin = _getMargin(border, style);
//     return {
//       'model': {
//         'content': content,
//         'padding': padding,
//         'border': border,
//         'margin': margin,
//         'width': boundingClientRect.width,
//         'height': boundingClientRect.height,
//       }
//     };
//   }
//
//   Map? getNodeInfoByLocation(int x, int y) {
//     final rootId = context.engineId;
//     final firstChild = context.renderManager.getNodeFirstChild(rootId, rootId);
//     final hitRenderNode = _getMaxDepthAndMinAreaHitRenderNode(x, y, firstChild);
//     if (hitRenderNode == null) {
//       return null;
//     }
//
//     return {
//       'backendId': hitRenderNode.id,
//       'frameId': kDefaultFrameId,
//       'nodeId': hitRenderNode.id,
//     };
//   }
// }
//
// class RemoveNode implements InspectorModel {
//   final EngineContext context;
//   final int nodeId;
//   RemoveNode(this.context, this.nodeId);
//
//   Map toJson() {
//     final node = context.domManager.getNode(nodeId);
//     if (node == null) {
//       return {};
//     }
//
//     final parentId = node.domainData.parentId;
//     return {
//       'nodeId': nodeId,
//       'parentNodeId': parentId,
//     };
//   }
// }
