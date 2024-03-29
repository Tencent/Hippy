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

import '../util.dart';
import '../viewmodel.dart';
import '../widget.dart';

class ModalWidget extends FRStatefulWidget {
  final ModalRenderViewModel _viewModel;

  ModalWidget(this._viewModel) : super(_viewModel);

  @override
  State<StatefulWidget> createState() {
    return _ModalWidgetState();
  }
}

// ignore: prefer_mixin
class _ModalWidgetState extends FRState<ModalWidget> with WidgetsBindingObserver {
  Size? oldSize;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  Widget build(BuildContext context) {
    LogUtils.dWidget(
      "ID:${widget._viewModel.id}, node:${widget._viewModel.idDesc}, build modal widget",
    );
    WidgetsBinding.instance.addPostFrameCallback((timeStamp) {
      /// The first addPostFrameCallback mean to the next frame show dialog, without, an error will be reported
      if (widget._viewModel.canDialogShow) {
        showDialog();
      } else {
        dismissDialog();
      }
    });
    return Container();
  }

  void showDialog() {
    LogUtils.dWidget(
      "ID:${widget._viewModel.id}, node:${widget._viewModel.idDesc}, show modal",
    );
    widget._viewModel.showDialog();
  }

  void dismissDialog() {
    LogUtils.dWidget(
      "ID:${widget._viewModel.id}, node:${widget._viewModel.idDesc}, dismiss modal",
    );
    widget._viewModel.dismissDialog();
  }

  @override
  void deactivate() {
    LogUtils.dWidget("ID:${widget._viewModel.id}, deactivate modal widget");
    dismissDialog();
    super.deactivate();
  }

  void didChangeMetrics() {
    WidgetsBinding.instance.addPostFrameCallback((timeStamp) {
      var width = ScreenUtil.getInstance().screenWidth;
      var height = ScreenUtil.getInstance().screenHeight;
      var originOldSize = oldSize;
      if (originOldSize == null ||
          originOldSize.width != width ||
          originOldSize.height != height) {
        widget._viewModel.context.renderBridgeManager.updateNodeSize(
          widget._viewModel.rootId,
          nodeId: widget._viewModel.id,
          width: width,
          height: height,
        );
        oldSize = Size(
          width,
          height,
        );
      }
    });
  }

  @override
  void dispose() {
    LogUtils.dWidget("ID:${widget._viewModel.id}, dispose modal widget");
    dismissDialog();
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }
}

class ModalContainerWidget extends StatefulWidget {
  final ModalRenderViewModel _viewModel;

  ModalContainerWidget(this._viewModel) : super(key: _viewModel.modalKey);

  @override
  State<StatefulWidget> createState() {
    return _ModalContainerWidgetState();
  }
}

class _ModalContainerWidgetState extends State<ModalContainerWidget> {
  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
      value: widget._viewModel,
      child: Selector<ModalRenderViewModel, DivContainerViewModel>(
        selector: (context, divViewModel) {
          return DivContainerViewModel(divViewModel);
        },
        builder: (context, viewModel, _) {
          return DivContainerWidget(viewModel);
        },
      ),
    );
  }
}
