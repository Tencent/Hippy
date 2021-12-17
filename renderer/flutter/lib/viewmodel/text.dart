import 'package:flutter/widgets.dart';

import '../engine.dart';
import '../style.dart';
import 'view_model.dart';

class TextRenderViewModel extends RenderViewModel {
  EdgeInsets? padding;
  TextData? data;
  FlexCSSDirection flexDirection = FlexCSSDirection.ROW;
  FlexAlign? alignItems;
  FlexAlign? justifyContent;

  Alignment? getAlignment() {
    if (alignItems == null && justifyContent == null) {
      return null;
    }

    var x = -1.0;
    var y = -1.0;
    if (flexDirection == FlexCSSDirection.ROW) {
      x = _getAlignmentValue(alignItems);
      y = _getAlignmentValue(justifyContent);
    } else {
      y = _getAlignmentValue(alignItems);
      x = _getAlignmentValue(justifyContent);
    }

    print(
        'Alignment ${x.toString()} ${y.toString()} ${alignItems.toString()} ${justifyContent.toString()} ${data?.text} ');
    return Alignment(x, y);
  }

  double _getAlignmentValue(FlexAlign? value) {
    if (value == FlexAlign.CENTER) {
      return 0.0;
    } else if (value == FlexAlign.FLEX_END) {
      return 1.0;
    }
    return -1.0;
  }

  TextRenderViewModel(
      int id, int instanceId, String className, EngineContext context)
      : super(id, instanceId, className, context);

  TextRenderViewModel.copy(int id, int instanceId, String className,
      EngineContext context, TextRenderViewModel viewModel)
      : super.copy(id, instanceId, className, context, viewModel) {
    padding = viewModel.padding;
    var data = viewModel.data;
    if (data != null) {
      data = TextData(data.maxLines, data.text, data.textAlign,
          data.textScaleFactor, data.textOverflow);
    }
  }

  @override
  bool operator ==(Object other) {
    return other is TextRenderViewModel &&
        padding?.left == other.padding?.left &&
        padding?.top == other.padding?.top &&
        padding?.bottom == other.padding?.bottom &&
        padding?.left == other.padding?.left &&
        data == other.data &&
        super == other;
  }

  @override
  int get hashCode {
    var paddingValue = padding;
    if (paddingValue == null) {
      return data.hashCode | super.hashCode;
    } else {
      return paddingValue.left.hashCode |
          paddingValue.top.hashCode |
          paddingValue.bottom.hashCode |
          paddingValue.left.hashCode |
          data.hashCode |
          super.hashCode;
    }
  }
}
