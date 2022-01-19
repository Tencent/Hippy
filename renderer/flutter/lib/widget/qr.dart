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

import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../viewmodel.dart';
import 'base.dart';
import 'div.dart';

class QrWidget extends FRStatefulWidget {
  final QrRenderViewModel renderViewModel;

  QrWidget(this.renderViewModel) : super(renderViewModel);

  @override
  State<StatefulWidget> createState() {
    return _QrWidgetState();
  }
}

class _QrWidgetState extends FRState<QrWidget> {
  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
        value: widget.renderViewModel,
        child: Consumer<QrRenderViewModel>(
          builder: (context, viewModel, widget) {
            return PositionWidget(viewModel, child: qrView(viewModel));
          },
        ));
  }

  Widget qrView(QrRenderViewModel viewModel) {
    var text = viewModel.text;
    if (text != null && text.isNotEmpty) {
      return QrImage(
        data: text,
        semanticsLabel: '',
        version: viewModel.version,
        errorCorrectionLevel: viewModel.level,
        padding: EdgeInsets.all(0),
      );
    } else {
      return Container();
    }
  }

  @override
  void dispose() {
    super.dispose();
    if (!widget.renderViewModel.isDispose) {
      widget.renderViewModel.onDispose();
    }
  }
}
