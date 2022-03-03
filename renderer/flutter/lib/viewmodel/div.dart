import 'package:flutter/widgets.dart';

import '../render.dart';
import '../style.dart';
import '../util.dart';
import 'group.dart';

class DivRenderViewModel extends GroupViewModel {
  Object? backgroundImg;
  String backgroundImgSize = enumValueToString(ImageResizeMode.auto);

  String imagePositionX = "";
  String imagePositionY = "";
  String backgroundImgRepeat = "";

  @override
  Decoration? getDecoration({Color? backgroundColor}) {
    return toDecoration(
        decorationColor: backgroundColor,
        backgroundImg: backgroundImg,
        backgroundImgSize: backgroundImgSize,
        backgroundImgRepeat: backgroundImgRepeat,
        backgroundImgPositionX: imagePositionX,
        backgroundImgPositionY: imagePositionY);
  }

  DivRenderViewModel(
      int id, int instanceId, String className, RenderContext context)
      : super(id, instanceId, className, context);

  DivRenderViewModel.copy(int id, int instanceId, String className,
      RenderContext context, DivRenderViewModel viewModel)
      : super.copy(id, instanceId, className, context, viewModel) {
    backgroundImg = viewModel.backgroundImg;
    backgroundImgSize = viewModel.backgroundImgSize;
    imagePositionX = viewModel.imagePositionX;
    imagePositionY = viewModel.imagePositionY;
    backgroundImgRepeat = viewModel.backgroundImgRepeat;
  }

  @override
  bool operator ==(Object other) {
    return other is DivRenderViewModel &&
        overflow == other.overflow &&
        backgroundImg == other.backgroundImg &&
        backgroundImgSize == other.backgroundImgSize &&
        backgroundImgRepeat == other.backgroundImgRepeat &&
        imagePositionX == other.imagePositionX &&
        imagePositionY == other.imagePositionY &&
        super == (other);
  }

  @override
  int get hashCode =>
      overflow.hashCode |
      backgroundImg.hashCode |
      backgroundImgSize.hashCode |
      backgroundImgRepeat.hashCode |
      imagePositionX.hashCode |
      imagePositionY.hashCode |
      super.hashCode;
}
