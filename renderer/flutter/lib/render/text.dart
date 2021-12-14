import 'package:flutter/widgets.dart';

import '../common/voltron_map.dart';
import '../controller/manager.dart';
import '../controller/text.dart';
import '../engine/engine_context.dart';
import '../style/flex_define.dart';
import '../style/flex_output.dart';
import '../style/flex_spacing.dart';
import '../style/text.dart';
import '../util/log_util.dart';
import '../viewmodel/text.dart';
import 'node.dart';
import 'tree.dart';

class TextRenderNode extends RenderNode with TextStyleNode {
  static const String _kTag = 'TextRenderNode';

  TextRenderNode(int id, String className, RenderTree root,
      ControllerManager controllerManager, VoltronMap? props)
      : super(id, className, root, controllerManager, props);

  @override
  bool get hasCustomLayout => true;

  bool get isVirtual => parent?.name == TextController.className;

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
      LogUtils.d(_kTag, 'measure: w: ${painter.width} h: ${painter.height}');
      return FlexOutput.makeMeasureResult(painter.width, painter.height);
    }
  }

  @override
  void layoutBefore(EngineContext context) {
    super.layoutBefore(context);
    if (fontScaleAdapter == null && enableScale) {
      fontScaleAdapter = context.globalConfigs.fontScaleAdapter;
    }
    if (isVirtual) {
      return;
    }

    createSpan();
  }

  void layoutAfter(EngineContext context) {
    if (!isVirtual) {
      var textData = createData(
          layoutWidth -
              getPadding(FlexSpacing.left) -
              getPadding(FlexSpacing.right),
          FlexMeasureMode.EXACTLY);
      data = textData;
      _updateData(context);
    }
  }

  void _updateData(EngineContext context) {
    if (!isVirtual) {
      context.renderManager.addUITask(() {
        context.renderManager.updateExtra(
            rootId,
            id,
            TextExtra(
                data,
                getPadding(FlexSpacing.start),
                getPadding(FlexSpacing.end),
                getPadding(FlexSpacing.bottom),
                getPadding(FlexSpacing.top)));
      });
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
