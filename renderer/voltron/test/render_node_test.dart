//
// Tencent is pleased to support the open source community by making
// Hippy available.
//
// Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

// @dart=2.9
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:voltron_renderer/render.dart';
import 'package:voltron_renderer/widget.dart';

import './util/render_context.dart';
import 'util/render_op_util.dart';

void main() {
  RenderContext renderContext;
  RenderOperatorRunner renderOpRunner;
  RootWidgetViewModel rootWidgetViewModel;
  RenderOpUtil renderOpUtil;

  setUp(() {
    WidgetsFlutterBinding.ensureInitialized();
    renderContext = getRenderContext();
    renderOpRunner = RenderOperatorRunner();
    renderOpRunner.bindRenderContext(renderContext);
    rootWidgetViewModel = RootWidgetViewModel(1);
    renderContext.rootViewModelMap[rootWidgetViewModel.id] = rootWidgetViewModel;
    renderOpUtil = RenderOpUtil(
      rootWidgetViewModel: rootWidgetViewModel,
      renderOpRunner: renderOpRunner,
      renderContext: renderContext,
    );
    renderOpUtil.init();
  });

  tearDown(() {});

  group('RenderNode:', () {
    group('addNode operator', () {
      test('should create a renderNode', () {
        var ops = [
          RenderOp(type: RenderOpType.addNode, nodeId: 1, props: {
            "index": 1,
            "name": "View",
            "pid": 0,
            "props": {
              "attributes": {"class": "item", "id": 0}
            },
            "styles": {"backgroundColor": 4292129211.0, "height": 30.0, "width": 20.0}
          })
        ];

        renderOpUtil.runRenderOp(ops);
        var node = rootWidgetViewModel.renderTree.getRenderNode(1);
        expect(node.id, 1);
        expect(node.style.height, 30.0);
        expect(node.style.width, 20.0);
      });

      test('should create a renderTree', () {
        var ops = [
          RenderOp(type: RenderOpType.addNode, nodeId: 1, props: {
            "index": 0,
            "name": "View",
            "pid": 0,
            "props": {
              "attributes": {"class": "node1", "id": 0}
            },
          }),
          RenderOp(type: RenderOpType.addNode, nodeId: 2, props: {
            "index": 0,
            "name": "View",
            "pid": 1,
            "props": {
              "attributes": {"class": "node2", "id": 1}
            },
          }),
          RenderOp(type: RenderOpType.addNode, nodeId: 3, props: {
            "index": 1,
            "name": "View",
            "pid": 1,
            "props": {
              "attributes": {"class": "node3", "id": 2}
            },
          }),
          RenderOp(type: RenderOpType.addNode, nodeId: 4, props: {
            "index": 1,
            "name": "View",
            "pid": 3,
            "props": {
              "attributes": {"class": "node4", "id": 2}
            },
          }),
          RenderOp(type: RenderOpType.addNode, nodeId: 5, props: {
            "index": 0,
            "name": "View",
            "pid": 3,
            "props": {
              "attributes": {"class": "node5", "id": 2}
            },
          }),
        ];
        renderOpUtil.runRenderOp(ops);

        var rootNode = rootWidgetViewModel.renderTree.rootNode;
        expect(rootNode.children, hasLength(1), reason: 'rootNode has only one child');
        var node = rootNode.children[0];
        expect(node.id, 1, reason: 'child of rootNode is node1');
        expect(node.children, hasLength(2), reason: 'node1 should have two children');
        expect(node.children[0].id, 2, reason: 'first child of node1 should be node2');
        expect(node.children[1], isA<RenderNode>());
        expect(node.children[1].id, 3, reason: 'second child of node1 should be node3');
        var node3 = node.children[1];
        expect(node3.childCount, 2, reason: 'node3 should have two children');
        expect(node3.children[0].id, 5, reason: 'first child of node3 shoule be node5');
        expect(node3.children[1].id, 4, reason: 'second child of node3 shoule be node4');
      });

      test('should add node to exiting tree', () {
        renderOpUtil.runRenderOp([
          RenderOp(type: RenderOpType.addNode, nodeId: 1, props: {
            "index": 1,
            "name": "View",
            "pid": 0,
            "props": {
              "attributes": {"class": "item", "id": 0}
            },
            "styles": {"backgroundColor": 4292129211.0, "height": 30.0, "width": 20.0}
          })
        ]);
        var node = rootWidgetViewModel.renderTree.getRenderNode(1);
        expect(node.id, 1);

        renderOpUtil.runRenderOp([
          RenderOp(type: RenderOpType.addNode, nodeId: 2, props: {
            "index": 0,
            "name": "View",
            "pid": 1,
            "props": {
              "attributes": {"class": "node2", "id": 0}
            }
          })
        ]);

        expect(node.childCount, 1, reason: 'node1 should has one child');
        expect(node.children[0].id, 2, reason: 'node2 is child of node1');
      });
    });

    group('deleteNode operator', () {
      test('should delete render node', () {
        var opsForbuildRenderTree = [
          RenderOp(type: RenderOpType.addNode, nodeId: 1, props: {
            "index": 0,
            "name": "View",
            "pid": 0,
            "props": {
              "attributes": {"class": "node1", "id": 0}
            },
          }),
          RenderOp(type: RenderOpType.addNode, nodeId: 2, props: {
            "index": 0,
            "name": "View",
            "pid": 1,
            "props": {
              "attributes": {"class": "node2", "id": 1}
            },
          }),
          RenderOp(type: RenderOpType.addNode, nodeId: 3, props: {
            "index": 1,
            "name": "View",
            "pid": 1,
            "props": {
              "attributes": {"class": "node3", "id": 2}
            },
          }),
          RenderOp(type: RenderOpType.addNode, nodeId: 4, props: {
            "index": 1,
            "name": "View",
            "pid": 3,
            "props": {
              "attributes": {"class": "node4", "id": 2}
            },
          }),
          RenderOp(type: RenderOpType.addNode, nodeId: 5, props: {
            "index": 0,
            "name": "View",
            "pid": 3,
            "props": {
              "attributes": {"class": "node5", "id": 2}
            },
          }),
        ];
        renderOpUtil.runRenderOp(opsForbuildRenderTree);

        var node1 = rootWidgetViewModel.renderTree.getRenderNode(1);
        var node3 = rootWidgetViewModel.renderTree.getRenderNode(3);
        expect(node3.childCount, 2, reason: 'node3 should have 2 children');
        var node5 = node3.children[0];

        renderOpUtil.runRenderOp([
          RenderOp(type: RenderOpType.deleteNode, nodeId: 5),
        ]);

        expect(node3.childCount, 1, reason: 'node3 should have 1 child after deleted');

        expect(node5.isDelete, isTrue);

        renderOpUtil.runRenderOp([
          RenderOp(type: RenderOpType.deleteNode, nodeId: 3),
        ]);
        expect(node3.isDelete, isTrue, reason: 'node3 is deleted');
        expect(node1.childCount, 1, reason: 'node1 should has only one child');
      });
    });

    test('recombineNode operator', () {
      var opsForbuildRenderTree = [
        RenderOp(type: RenderOpType.addNode, nodeId: 1, props: {
          "index": 0,
          "name": "View",
          "pid": 0,
          "props": {
            "attributes": {"class": "node1", "id": 0}
          },
        }),
        RenderOp(type: RenderOpType.addNode, nodeId: 2, props: {
          "index": 0,
          "name": "View",
          "pid": 1,
          "props": {
            "attributes": {"class": "node2", "id": 1}
          },
        }),
        RenderOp(type: RenderOpType.addNode, nodeId: 3, props: {
          "index": 1,
          "name": "View",
          "pid": 1,
          "props": {
            "attributes": {"class": "node3", "id": 2}
          },
        }),
        RenderOp(type: RenderOpType.addNode, nodeId: 4, props: {
          "index": 1,
          "name": "View",
          "pid": 3,
          "props": {
            "attributes": {"class": "node4", "id": 2}
          },
        }),
        RenderOp(type: RenderOpType.addNode, nodeId: 5, props: {
          "index": 0,
          "name": "View",
          "pid": 3,
          "props": {
            "attributes": {"class": "node5", "id": 2}
          },
        }),
      ];
      renderOpUtil.runRenderOp(opsForbuildRenderTree);

      var tree = rootWidgetViewModel.renderTree;
      var node1 = rootWidgetViewModel.renderTree.getRenderNode(1);
      var node2 = rootWidgetViewModel.renderTree.getRenderNode(2);
      var node3 = rootWidgetViewModel.renderTree.getRenderNode(3);
      var node4 = rootWidgetViewModel.renderTree.getRenderNode(4);
      var node5 = rootWidgetViewModel.renderTree.getRenderNode(5);

      expect(node5.parent.id, 3, reason: 'parent of node5 is node3 before move');
      renderOpUtil.runRenderOp([
        RenderOp(type: RenderOpType.recombineNode, nodeId: 2, props: {
          "move_id": [4, 5],
          "move_pid": 3,
          "move_index": 0,
        }),
      ]);
      expect(node5.parent.id, 2, reason: 'parent of node5 is node2 after move');
      expect(node2.childCount, 2, reason: 'node2 should have 2 children');
      expect(node3.childCount, isZero, reason: 'node3 should has no child now');
    });

    group('updateNode operator', () {
      setUp(() {
        renderOpUtil.runRenderOp([
          RenderOp(type: RenderOpType.addNode, nodeId: 1, props: {
            "index": 1,
            "name": "View",
            "pid": 0,
            "props": {
              "attributes": {"class": "item", "id": 0}
            },
            "styles": {"backgroundColor": 4292129211.0, "height": 30.0, "width": 20.0}
          })
        ]);
      });
      test('should update props', () {
        var node = rootWidgetViewModel.renderTree.getRenderNode(1);

        renderOpUtil.runRenderOp([
          RenderOp(type: RenderOpType.updateNode, nodeId: 1, props: {
            "index": 1,
            "name": "View",
            "pid": 0,
            "props": {
              "attributes": {"class": "item1", "id": 0},
              "backgroundColor": 4292129211.0,
              "height": 32.0,
              "width": 24.0
            },
          })
        ]);

        expect(node.styleWidth, 24.0);
        expect(node.styleHeight, 32.0);
        // renderOpUtil.printRenderNode(1);
      });

      test('should update styles', () {
        var node = rootWidgetViewModel.renderTree.getRenderNode(1);

        renderOpUtil.runRenderOp([
          RenderOp(type: RenderOpType.updateNode, nodeId: 1, props: {
            "index": 1,
            "name": "View",
            "pid": 0,
            "props": {
              "backgroundColor": 0xFFABC123,
            },
          })
        ]);

        expect(node.viewModel.backgroundColor, equals(const Color(0xFFABC123)));
      });
    });

    test('updateLayout operator should update layout properties', () {
      var ops = [
        RenderOp(type: RenderOpType.addNode, nodeId: 1, props: {
          "index": 1,
          "name": "View",
          "pid": 0,
          "props": {
            "attributes": {"class": "item", "id": 0}
          },
          "styles": {"backgroundColor": 4292129211.0, "height": 30.0, "width": 20.0}
        })
      ];

      renderOpUtil.runRenderOp(ops);
      var node = rootWidgetViewModel.renderTree.getRenderNode(1);

      renderOpUtil.runRenderOp([
        RenderOp(type: RenderOpType.updateLayout, nodeId: 1, props: {
          "layout_nodes": [
            [1, 12.0, 13.0, 14.0, 15.0], // id,left,top,width,height
          ],
        })
      ]);

      expect(node.layoutX, 12.0);
      expect(node.layoutY, 13.0);
      expect(node.layoutWidth, 14.0);
      expect(node.layoutHeight, 15.0);
    });
  });
}
