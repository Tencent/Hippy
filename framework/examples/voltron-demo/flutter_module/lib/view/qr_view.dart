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
import 'package:qr_flutter/qr_flutter.dart';
import 'package:voltron/voltron.dart';

/// 注意，这里是以qr_flutter 4.0.0版本为例，后续版本api可能会有变动，这里知晓扩展插件的原理即可
class QrController extends BaseViewController<QrRenderViewModel> {
  static const String kClassName = "QrView";

  static const String kText = "text";
  static const String kLevel = "level";

  @override
  Widget createWidget(BuildContext context, QrRenderViewModel viewModel) {
    return QrWidget(viewModel);
  }

  @override
  QrRenderViewModel createRenderViewModel(
    RenderNode node,
    RenderContext context,
  ) {
    return QrRenderViewModel(
      node.id,
      node.rootId,
      node.name,
      context,
    );
  }

  @override
  Map<String, ControllerMethodProp> get extendRegisteredMethodProp {
    var extraMap = <String, ControllerMethodProp>{};
    extraMap[kText] = ControllerMethodProp(setText, '');
    extraMap[kLevel] = ControllerMethodProp(setLevel, enumValueToString(QrErrorCorrectLevel.L));
    return extraMap;
  }

  @ControllerProps(kText)
  void setText(QrRenderViewModel viewModel, String text) {
    viewModel.text = text;
  }

  @ControllerProps(kLevel)
  void setLevel(QrRenderViewModel viewModel, String level) {
    switch (level) {
      case 'l':
        viewModel.level = QrErrorCorrectLevel.L;
        break;
      case 'm':
        viewModel.level = QrErrorCorrectLevel.M;
        break;
      case 'q':
        viewModel.level = QrErrorCorrectLevel.Q;
        break;
      case 'h':
        viewModel.level = QrErrorCorrectLevel.H;
        break;
      default:
        viewModel.level = QrErrorCorrectLevel.L;
    }
  }

  @override
  void dispatchFunction(
    QrRenderViewModel viewModel,
    String functionName,
    VoltronArray array, {
    Promise? promise,
  }) {
    super.dispatchFunction(viewModel, functionName, array, promise: promise);
    switch (functionName) {
      case "changeText":
        String? text = array.get<String>(0);
        if (text != null) {
          viewModel.text = text;
          viewModel.update();
        }
        break;
    }
  }

  @override
  String get name => kClassName;
}

class QrRenderViewModel extends GroupViewModel {
  String text = '';
  int level = QrErrorCorrectLevel.L;

  QrRenderViewModel(
    int id,
    int instanceId,
    String className,
    RenderContext context,
  ) : super(id, instanceId, className, context);

  QrRenderViewModel.copy(
    int id,
    int instanceId,
    String className,
    RenderContext context,
    QrRenderViewModel viewModel,
  ) : super.copy(id, instanceId, className, context, viewModel) {
    text = viewModel.text;
    level = viewModel.level;
  }

  @override
  bool operator ==(Object other) {
    return other is QrRenderViewModel && text == other.text && level == other.level;
  }

  @override
  int get hashCode => text.hashCode | level.hashCode | super.hashCode;
}

class QrWidget extends FRStatefulWidget {
  final QrRenderViewModel _viewModel;

  QrWidget(this._viewModel) : super(_viewModel);

  @override
  State<StatefulWidget> createState() {
    return _QrWidgetState();
  }
}

class _QrWidgetState extends FRState<QrWidget> {
  @override
  Widget build(BuildContext context) {
    LogUtils.dWidget(
      "ID:${widget._viewModel.id}, node:${widget._viewModel.idDesc}, build qr widget",
    );
    return ChangeNotifierProvider.value(
      value: widget._viewModel,
      child: Consumer<QrRenderViewModel>(
        builder: (context, viewModel, widget) {
          return PositionWidget(
            viewModel,
            child: qrView(viewModel),
          );
        },
      ),
    );
  }

  Widget qrView(QrRenderViewModel viewModel) {
    LogUtils.dWidget(
      "ID:${widget._viewModel.id}, node:${widget._viewModel.idDesc}, build qr inner widget",
    );
    var text = viewModel.text;
    if (text.isNotEmpty) {
      return QrImage(
        data: text,
        errorCorrectionLevel: viewModel.level,
        padding: const EdgeInsets.all(0),
      );
    } else {
      return Container();
    }
  }
}
