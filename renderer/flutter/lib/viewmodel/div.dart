import 'dart:io';

import 'package:flutter/widgets.dart';

import '../common/voltron_map.dart';
import '../controller/manager.dart';
import '../controller/props.dart';
import '../engine/context.dart';
import '../engine/engine_context.dart';
import '../style/prop.dart';
import '../util/enum_util.dart';
import '../widget/div.dart';
import 'group.dart';

class DivRenderViewModel extends GroupViewModel {
  @override
  String overflow = enumValueToString(ContainOverflow.visible);
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
      int id, int instanceId, String className, EngineContext context)
      : super(id, instanceId, className, context);

  DivRenderViewModel.copy(int id, int instanceId, String className,
      EngineContext context, DivRenderViewModel viewModel)
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
