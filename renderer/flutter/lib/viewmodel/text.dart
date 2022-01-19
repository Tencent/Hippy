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

import '../style.dart';
import 'view_model.dart';

class TextRenderViewModel extends RenderViewModel {
  EdgeInsets? padding;
  TextData? data;
  FlexCSSDirection flexDirection = FlexCSSDirection.row;
  FlexAlign? alignItems;
  FlexAlign? justifyContent;

  Alignment? getAlignment() {
    if (alignItems == null && justifyContent == null) {
      return null;
    }

    var x = -1.0;
    var y = -1.0;
    if (flexDirection == FlexCSSDirection.row) {
      x = _getAlignmentValue(alignItems);
      y = _getAlignmentValue(justifyContent);
    } else {
      y = _getAlignmentValue(alignItems);
      x = _getAlignmentValue(justifyContent);
    }

    return Alignment(x, y);
  }

  double _getAlignmentValue(FlexAlign? value) {
    if (value == FlexAlign.center) {
      return 0.0;
    } else if (value == FlexAlign.flexEnd) {
      return 1.0;
    }
    return -1.0;
  }

  TextRenderViewModel(
      int id, int instanceId, String className, RenderContext context)
      : super(id, instanceId, className, context);

  TextRenderViewModel.copy(int id, int instanceId, String className,
      RenderContext context, TextRenderViewModel viewModel)
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
