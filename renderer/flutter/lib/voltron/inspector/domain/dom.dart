// import '../../../dom/dom_node.dart';
// import '../../../engine/engine_context.dart';
// import '../domain.dart';
// import '../inspector.dart';
// import '../model/model.dart';
//
// String kDomDomainName = 'DOM';
//
// class DomDomain extends InspectDomain {
//   DomDomain(Inspector inspector) : super(inspector);
//
//   @override
//   String get name => kDomDomainName;
//
//   @override
//   void receiveFromFrontend(EngineContext context, int id, String method,
//       Map<String, dynamic> params) {
//     final strategyMap = {
//       'getDocument': _handleGetDocument,
//       'getBoxModel': _handleGetBoxModel,
//       'getNodeForLocation': _handleGetNodeForLocation,
//       'removeNode': _handleRemoveNode,
//       'setInspectedNode': _handleSetInspectedNode,
//     };
//
//     strategyMap[method]?.call(context, id, params);
//   }
//
//   /// https://chromedevtools.github.io/devtools-protocol/tot/DOM/#method-getDocument
//   /// Returns the root DOM node (and optionally the subtree) to the caller.
//   void _handleGetDocument(
//       EngineContext context, int id, Map<String, dynamic> params) {
//     final document = Document(context);
//     sendToFrontend(context, id, document);
//   }
//
//   /// https://chromedevtools.github.io/devtools-protocol/tot/DOM/#event-documentUpdated
//   void handleDocumentUpdated(EngineContext context) {
//     final event = InspectorEvent('DOM.documentUpdated', null);
//     sendEventToFrontend(context, event);
//   }
//
//   /// https://chromedevtools.github.io/devtools-protocol/tot/DOM/#method-getBoxModel
//   /// Returns boxes for the given node.
//   void _handleGetBoxModel(
//       EngineContext context, int id, Map<String, dynamic> params) {
//     final boxModel = BoxModel(context, params);
//     sendToFrontend(context, id, boxModel);
//   }
//
//   /// https://vanilla.aslushnikov.com/?DOM.getNodeForLocation
//   /// Returns node id at given location. Depending on whether DOM domain is enabled, nodeId is either returned or not.
//   void _handleGetNodeForLocation(
//       EngineContext context, int id, Map<String, dynamic> params) {
//     final int x = params['x'];
//     final int y = params['y'];
//     final nodeInfo = BoxModel(context, params).getNodeInfoByLocation(x, y);
//     sendToFrontend(context, id, nodeInfo);
//   }
//
//   /// https://vanilla.aslushnikov.com/?DOM.removeNode
//   /// https://vanilla.aslushnikov.com/?DOM.childNodeRemoved
//   /// Removes node with given id.
//   /// 接收Method removeNode后，响应Event childNodeRemoved，更新document结构
//   void _handleRemoveNode(
//       EngineContext context, int id, Map<String, dynamic> params) {
//     sendToFrontend(context, id, {});
//
//     final int nodeId = params['nodeId'];
//     final removeNode = RemoveNode(context, nodeId);
//     // 1.返回删除节点的信息
//     final event = InspectorEvent('DOM.childNodeRemoved', removeNode);
//     sendEventToFrontend(context, event);
//     // 2.删除DomTree上对应的节点
//     context.domManager.deleteNode(context.engineId, nodeId);
//     context.domManager.batch(canInvokeHook: false);
//   }
//
//   DomNode? domNode;
//
//   /// https://chromedevtools.github.io/devtools-protocol/tot/DOM/#method-setInspectedNode
//   /// https://developer.chrome.com/docs/devtools/console/utilities/
//   /// Enables console to refer to the node with given id via $x
//   /// (see Command Line API for more details $x functions).
//   /// 通过输入$index，获取选中的元素信息，按当前在element选中的倒序返回
//   void _handleSetInspectedNode(
//       EngineContext context, int id, Map<String, dynamic> params) {
//     int nodeId = params['nodeId'];
//     final node = context.domManager.getNode(nodeId);
//     if (node != null) {
//       domNode = node;
//     }
//     sendToFrontend(context, id, null);
//   }
// }
