// @dart=2.9
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';

import 'package:voltron_renderer/render.dart';
import 'package:voltron_renderer/widget.dart';
import './util/render_context.dart';
import './util/run_render_op.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  RenderContext renderContext;
  RenderOperatorRunner renderOpRuner;
  RootWidgetViewModel viewModel;
  setUp(() {
    renderContext = getRenderContext();
    renderOpRuner = RenderOperatorRunner(renderContext);
    viewModel = RootWidgetViewModel();
    RunRenderOpUtil.loadInstance(renderContext, viewModel);
  });

  tearDown(() {});

  group('[RenderNode]', () {
    test('should create a renderNode', () {
      var ops = [
        RenderOp(type: RenderOpType.addNode, nodeId: 1, parentId: 0, props: {
          "index": 1,
          "name": "View",
          "pid": 0,
          "props": {
            "attributes": {"class": "item", "id": 0}
          },
          "styles": {
            "backgroundColor": 4292129211.0,
            "height": 30.0,
            "width": 20.0
          }
        })
      ];

      renderOpRuner.consumeRenderOp(
          viewModel.id, ops.map((e) => e.format()).toList());
      RunRenderOpUtil.doFrame(renderContext);
      var node = viewModel.renderTree.getRenderNode(1);
      expect(node.id, 1);
      expect(node.style.height, 30.0);
      expect(node.style.width, 20.0);
    });

    test('should create a renderTree', () {
      var ops = [
        RenderOp(type: RenderOpType.addNode, nodeId: 1, parentId: 0, props: {
          "index": 0,
          "name": "View",
          "pid": 0,
          "props": {
            "attributes": {"class": "node1", "id": 0}
          },
        }),
        RenderOp(type: RenderOpType.addNode, nodeId: 2, parentId: 1, props: {
          "index": 0,
          "name": "View",
          "pid": 1,
          "props": {
            "attributes": {"class": "node2", "id": 1}
          },
        }),
        RenderOp(type: RenderOpType.addNode, nodeId: 3, parentId: 1, props: {
          "index": 1,
          "name": "View",
          "pid": 1,
          "props": {
            "attributes": {"class": "node3", "id": 2}
          },
        }),
        RenderOp(type: RenderOpType.addNode, nodeId: 4, parentId: 3, props: {
          "index": 1,
          "name": "View",
          "pid": 3,
          "props": {
            "attributes": {"class": "node4", "id": 2}
          },
        }),
        RenderOp(type: RenderOpType.addNode, nodeId: 5, parentId: 3, props: {
          "index": 0,
          "name": "View",
          "pid": 3,
          "props": {
            "attributes": {"class": "node5", "id": 2}
          },
        }),
      ];

      renderOpRuner.consumeRenderOp(
          viewModel.id, ops.map((e) => e.format()).toList());
      RunRenderOpUtil.doFrame(renderContext);
      var rootNode = viewModel.renderTree.rootNode;
      expect(rootNode.children, hasLength(1),
          reason: 'rootNode has only one child');
      var node = rootNode.children[0];
      expect(node.id, 1, reason: 'child of rootNode is node1');
      expect(node.children, hasLength(2),
          reason: 'node1 should have two children');
      expect(node.children[0].id, 2,
          reason: 'first child of node1 should be node2');
      expect(node.children[1], isA<RenderNode>());
      expect(node.children[1].id, 3,
          reason: 'second child of node1 should be node3');
      var node3 = node.children[1];
      expect(node3.childCount, 2, reason: 'node3 should have two children');
      expect(node3.children[0].id, 5,
          reason: 'first child of node3 shoule be node5');
      expect(node3.children[1].id, 4,
          reason: 'second child of node3 shoule be node4');
    });
  });
}
