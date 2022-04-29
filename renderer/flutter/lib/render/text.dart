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

import 'package:flutter/widgets.dart';
import 'package:voltron_renderer/render.dart';

import '../common.dart';
import '../controller.dart';
import '../style.dart';
import '../util.dart';

class TextRenderNode extends RenderNode {
  static const String _kTag = 'TextRenderNode';

  TextRenderNode(
    int id,
    String className,
    RenderTree root,
    ControllerManager controllerManager,
    VoltronMap? props,
  ) : super(id, className, root, controllerManager, props);

  @override
  int calculateLayout(FlexLayoutParams layoutParams) {
    TextPainter? painter;
    var exception = false;

    var virtualNode = renderContext.virtualNodeManager.mVirtualNodes[id];
    if (virtualNode is TextVirtualNode) {
      try {
        painter = virtualNode.createPainter(
          layoutParams.width,
          layoutParams.widthMode,
        );
      } catch (e) {
        LogUtils.e(_kTag, "text createLayout error:$e");
        exception = true;
      }
    }

    if (exception || painter == null) {
      LogUtils.d(_kTag, 'measure($id) error: layout:$layoutParams');
      return FlexOutput.makeMeasureResult(
        layoutParams.width,
        layoutParams.height,
      );
    } else {
      LogUtils.d(_kTag, 'measure($id):[${painter.width}, ${painter.height}]');
      return FlexOutput.makeMeasureResult(painter.width, painter.height);
    }
  }
}
