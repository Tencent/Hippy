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

import '../controller.dart';
import '../render.dart';
import '../style.dart';
import '../util.dart';
import '../viewmodel.dart';
import '../widget.dart';

class DivController extends BaseGroupController<DivRenderViewModel> {
  static const String kClassName = "View";

  @override
  Widget createWidget(BuildContext context, DivRenderViewModel viewModel) {
    return DivWidget(viewModel);
  }

  @override
  DivRenderViewModel createRenderViewModel(
      RenderNode node, RenderContext context) {
    return DivRenderViewModel(node.id, node.rootId, node.name, context);
  }

  @override
  Map<String, ControllerMethodProp> get groupExtraMethodProp => {
        NodeProps.kOverflow: ControllerMethodProp(
            setOverflow, enumValueToString(ContainOverflow.visible)),
        NodeProps.kBackgroundImage:
            ControllerMethodProp(setBackgroundImage, null),
        NodeProps.kBackgroundSize: ControllerMethodProp(
            setBackgroundImageSize, enumValueToString(ImageResizeMode.auto)),
        NodeProps.kBackgroundPositionX:
            ControllerMethodProp(setBackgroundImagePositionX, ''),
        NodeProps.kBackgroundPositionY:
            ControllerMethodProp(setBackgroundImagePositionY, ''),
        NodeProps.kBackgroundRepeat:
            ControllerMethodProp(setBackgroundImageRepeat, ''),
      };

  @ControllerProps(NodeProps.kOverflow)
  void setOverflow(DivRenderViewModel viewModel, String overflow) {
    viewModel.overflow = overflow;
  }

  @ControllerProps(NodeProps.kBackgroundImage)
  void setBackgroundImage(DivRenderViewModel viewModel, Object data) {
    if (data is String) {
      viewModel.backgroundImg =
          viewModel.context.convertRelativePath(viewModel.rootId, data);
    } else {
      viewModel.backgroundImg = data;
    }
  }

  @ControllerProps(NodeProps.kBackgroundSize)
  void setBackgroundImageSize(
      DivRenderViewModel viewModel, String resizeModeValue) {
    viewModel.backgroundImgSize = resizeModeValue;
  }

  @ControllerProps(NodeProps.kBackgroundPositionX)
  void setBackgroundImagePositionX(
      DivRenderViewModel viewModel, String positionX) {
    viewModel.imagePositionX = positionX;
  }

  @ControllerProps(NodeProps.kBackgroundPositionY)
  void setBackgroundImagePositionY(
      DivRenderViewModel viewModel, String positionY) {
    viewModel.imagePositionY = positionY;
  }

  @ControllerProps(NodeProps.kBackgroundRepeat)
  void setBackgroundImageRepeat(DivRenderViewModel viewModel, String value) {
    viewModel.backgroundImgRepeat = value;
  }

  @override
  String get name => kClassName;
}
