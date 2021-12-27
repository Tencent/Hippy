import 'package:flutter/widgets.dart';

import '../common.dart';
import '../controller.dart';
import '../engine.dart';
import '../style.dart';
import '../util.dart';
import 'node.dart';
import 'tree.dart';

class TextRenderNode extends RenderNode with TextStyleNode {
  static const String _kTag = 'TextRenderNode';

  TextRenderNode(int id, String className, RenderTree root,
      ControllerManager controllerManager, VoltronMap? props)
      : super(id, className, root, controllerManager, props);

  @override
  bool get hasCustomLayout => true;

  bool get isVirtual => parent?.name == TextController.kClassName;

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

  void generateSpan(EngineContext context) {
    if (fontScaleAdapter == null && enableScale) {
      fontScaleAdapter = context.globalConfigs.fontScaleAdapter;
    }
    if (isVirtual) {
      return;
    }
    span = createSpan();
  }

  void updateData(EngineContext context) {
    if (!isVirtual) {
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
