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

import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:provider/provider.dart';

import '../style.dart';
import '../util.dart';
import '../viewmodel.dart';
import '../widget.dart';

class TextWidget extends FRStatefulWidget {
  final TextRenderViewModel _viewModel;

  TextWidget(this._viewModel) : super(_viewModel);

  @override
  State<StatefulWidget> createState() {
    return _TextWidgetState();
  }
}

class _TextWidgetState extends FRState<TextWidget> {
  @override
  Widget build(BuildContext context) {
    LogUtils.dWidget("ID:${widget._viewModel.id}, node:${widget._viewModel.idDesc}, build text widget");
    return ChangeNotifierProvider.value(
      value: widget._viewModel,
      child: Consumer<TextRenderViewModel>(
        builder: (context, viewModel, widget) {
          return PositionWidget(
            viewModel,
            child: textView(viewModel),
          );
        },
      ),
    );
  }

  Widget textView(TextRenderViewModel textModel) {
    LogUtils.dWidget("ID:${widget._viewModel.id}, node:${widget._viewModel.idDesc}, build text inner widget");
    var data = textModel.data;
    if (data != null) {
      return Container(
        padding: textModel.padding,
        child: RichText(
          text: data.text,
          textAlign: data.textAlign,
          maxLines: data.maxLines,
          textScaleFactor: data.textScaleFactor,
          overflow: data.textOverflow,
        ),
      );
    } else {
      return Container();
    }
  }

  @override
  void dispose() {
    super.dispose();
  }
}

class TextViewModel {
  final Size size;
  final EdgeInsets padding;
  final TextData data;

  const TextViewModel(this.padding, this.data, this.size);

  @override
  bool operator ==(Object other) =>
      other is TextViewModel &&
      other.padding == padding &&
      data == other.data &&
      size == other.size;

  @override
  int get hashCode => padding.hashCode | data.hashCode | size.hashCode;
}
