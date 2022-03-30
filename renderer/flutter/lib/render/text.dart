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

class TextRenderNode extends RenderNode with TextStyleNode {
  static const String _kTag = 'TextRenderNode';

  TextRenderNode(int id, String className, RenderTree root,
      ControllerManager controllerManager, VoltronMap? props)
      : super(id, className, root, controllerManager, props);

  @override
  bool get isVirtual => parent?.name == TextController.kClassName;

  @override
  int calculateLayout(FlexLayoutParams layoutParams) {
    TextPainter? painter;
    var exception = false;

    try {
      painter = createPainter(layoutParams.width, layoutParams.widthMode);
    } catch (e) {
      LogUtils.e(_kTag, "text createLayout error:$e");
      exception = true;
    }

    if (exception || painter == null) {
      LogUtils.d(_kTag, 'measure error: layout:$layoutParams s:$fontSize');
      return FlexOutput.makeMeasureResult(
          layoutParams.width, layoutParams.height);
    } else {
      LogUtils.d(_kTag, 'measure($id):[${painter.width}, ${painter.height}]');
      return FlexOutput.makeMeasureResult(painter.width, painter.height);
    }
  }

  void generateSpan(RenderContext context) {
    if (enableScale) {
      customTextScale = context.fontScale;
    }
    if (isVirtual) {
      return;
    }
    span = createSpan();
  }

  void updateData(RenderContext context) {
    if (!isVirtual && span != null) {
      var textData = createData(
          layoutWidth -
              getPadding(FlexStyleEdge.left) -
              getPadding(FlexStyleEdge.right),
          FlexMeasureMode.exactly);
      data = textData;
      context.renderManager.updateExtra(
          rootId,
          id,
          TextExtra(
              data,
              getPadding(FlexStyleEdge.start),
              getPadding(FlexStyleEdge.end),
              getPadding(FlexStyleEdge.bottom),
              getPadding(FlexStyleEdge.top)));
    }
  }
}

class TextExtra {
  final Object extra;
  final double leftPadding;
  final double rightPadding;
  final double bottomPadding;
  final double topPadding;

  const TextExtra(this.extra, this.leftPadding, this.rightPadding,
      this.bottomPadding, this.topPadding);
}
