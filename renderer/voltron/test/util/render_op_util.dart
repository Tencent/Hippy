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

// ignore_for_file: avoid_print

import 'package:voltron_renderer/render.dart';
import 'package:voltron_renderer/viewmodel/view_model.dart';
import 'package:voltron_renderer/widget.dart';

import './render_context.dart';

enum RenderOpType {
  addNode,
  deleteNode,
  recombineNode,
  moveNode,
  updateNode,
  updateLayout,
  layoutBefore,
  layoutFinish,
  batch,
  dispatchUiFunc,
  addEvent,
  removeEvent,
}

class RenderOp {
  RenderOpType type;
  int nodeId;
  Map? props;

  RenderOp({required this.type, required this.nodeId, this.props});

  List<dynamic> format() {
    List<dynamic> ret = [];
    ret.add(type.index);
    ret.add(nodeId);
    if (props != null) {
      ret.add(props);
    }
    return ret;
  }
}

class RenderOpUtil {
  RenderContext renderContext;
  RootWidgetViewModel rootWidgetViewModel;
  RenderOperatorRunner renderOpRunner;

  RenderOpUtil({
    required this.rootWidgetViewModel,
    required this.renderOpRunner,
    required this.renderContext,
  });

  void init() {
    renderContext.createRootView(
      MockLoadInstanceContext(),
      rootWidgetViewModel,
    );
    renderContext.renderManager.onInstanceLoad(rootWidgetViewModel.id);
    rootWidgetViewModel.attachToEngine(renderContext);
  }

  void doFrame() {
    renderContext.renderManager.renderBatchEnd();
  }

  void runRenderOp(List<RenderOp> ops, {bool immediately = true}) {
    renderOpRunner.consumeRenderOp(
      rootWidgetViewModel.id,
      ops.map((e) => e.format()).toList(),
    );
    if (immediately) {
      doFrame();
    }
  }

  void printRenderNode(int nodeId) {
    var node = rootWidgetViewModel.renderTree?.getRenderNode(nodeId);
    if (node == null) {
      print('node#$nodeId is null');
      return;
    }

    node.toString();
    var buffer = StringBuffer();
    buffer.write('[node#${node.id}]');
    buffer.write('layoutWidth=${node.layoutWidth};');
    buffer.write('layoutHeight=${node.layoutHeight};');
    buffer.write('layoutX=${node.layoutX};');
    buffer.write('layoutY=${node.layoutY};');
    buffer.write('styleWidth=${node.styleWidth};');
    buffer.write('styleHeight=${node.styleHeight};');
    buffer.write('childCount=${node.childCount};');
    print(buffer.toString());
  }

  RenderViewModel getViewModelFromRenderOp(RenderOp op) {
    renderOpRunner.consumeRenderOp(rootWidgetViewModel.id, [op.format()]);
    doFrame();
    var node = rootWidgetViewModel.renderTree?.getRenderNode(op.nodeId);
    assert(node != null);
    var vm = node!.viewModel;
    assert(vm != null);
    return vm!;
  }

  RenderNode getNodeFromStyles(Map<String, dynamic> styles) {
    var op = RenderOp(type: RenderOpType.addNode, nodeId: 1, props: {
      "index": 0,
      "name": "View",
      "pid": 0,
      "styles": styles,
    });
    renderOpRunner.consumeRenderOp(rootWidgetViewModel.id, [op.format()]);
    doFrame();
    var node = rootWidgetViewModel.renderTree?.getRenderNode(op.nodeId);
    assert(node != null);
    return node!;
  }

  void updateNodeStyles(RenderNode node, Map<String, dynamic> styles) {
    var op = RenderOp(type: RenderOpType.updateNode, nodeId: node.id, props: {
      "props": {"style": styles}
    });
    renderOpRunner.consumeRenderOp(rootWidgetViewModel.id, [op.format()]);
    doFrame();
  }

  RenderViewModel getViewModelFromStyles(Map<String, dynamic> styles) {
    var node = getNodeFromStyles(styles);
    var vm = node.viewModel;
    assert(vm != null);
    return vm!;
  }
}
