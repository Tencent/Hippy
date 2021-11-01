import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:provider/provider.dart';

import '../render/group.dart';
import '../render/modal.dart';
import '../render/view_model.dart';
import '../util/log_util.dart';
import 'div.dart';

class ModalContainerWidget extends FRStatefulWidget {
  final ModalRenderViewModel _viewModel;

  ModalContainerWidget(this._viewModel) : super(_viewModel);

  @override
  State<StatefulWidget> createState() {
    return _ModalContainerWidgetState();
  }
}

class _ModalContainerWidgetState extends FRState<ModalContainerWidget> {
  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
      value: widget._viewModel,
      child: Selector<ModalRenderViewModel, _ModalContainerModel>(
          selector: (context, renderViewModel) {
        return _ModalContainerModel(
            canShowDialog: renderViewModel.canDialogShow,
            aniType: renderViewModel.animationType,
            transparent: renderViewModel.transparent,
            immersionStatusBar: renderViewModel.immersionStatusBar,
            statusBarTextDarkColor: renderViewModel.statusBarTextDarkColor,
            animationDuration: renderViewModel.animationDuration,
            barrierColor: renderViewModel.barrierColor);
      }, builder: (context, modalViewModel, widget) {
        WidgetsBinding.instance?.addPostFrameCallback((timeStamp) {
          if (modalViewModel.canShowDialog) {
            showDialog();
          } else {
            dismissDialog();
          }
        });

        return Container();
      }),
    );
  }

  void showDialog() {
    widget._viewModel.showDialog();
  }

  void dismissDialog() {
    widget._viewModel.dismissDialog();
  }

  @override
  void deactivate() {
    LogUtils.dWidget("ModalWidget", "deactivate");
    dismissDialog();
    super.deactivate();
  }

  @override
  void dispose() {
    LogUtils.dWidget("ModalWidget", "dispose");
    dismissDialog();
    super.dispose();
  }
}

class _ModalContainerModel {
  final bool canShowDialog;
  final String aniType;
  bool immersionStatusBar;
  bool statusBarTextDarkColor;
  bool transparent;
  int animationDuration;
  int barrierColor;

  _ModalContainerModel({
    required this.canShowDialog,
    required this.aniType,
    required this.immersionStatusBar,
    required this.statusBarTextDarkColor,
    required this.transparent,
    required this.animationDuration,
    required this.barrierColor,
  });

  @override
  int get hashCode => super.hashCode;

  @override
  bool operator ==(Object other) =>
      other is _ModalContainerModel &&
      other.canShowDialog == canShowDialog &&
      other.aniType == aniType &&
      transparent == other.transparent &&
      statusBarTextDarkColor == other.statusBarTextDarkColor &&
      immersionStatusBar == other.immersionStatusBar &&
      animationDuration == other.animationDuration &&
      barrierColor == other.barrierColor;
}

class ModalDialogWidget extends StatefulWidget {
  final ModalRenderViewModel _viewModel;

  ModalDialogWidget(this._viewModel) : super(key: _viewModel.modalKey);

  @override
  State<StatefulWidget> createState() {
    return _ModalDialogWidgetState();
  }
}

class _ModalDialogWidgetState extends State<ModalDialogWidget> {
  @override
  Widget build(BuildContext context) {
    return Container(
        child: ChangeNotifierProvider.value(
      value: widget._viewModel,
      child: Selector<ModalRenderViewModel, DivContainerViewModel>(
        selector: (context, divViewModel) {
          return DivContainerViewModel(
              divViewModel.sortedIdList,
              divViewModel.childrenMap,
              divViewModel.overflow,
              divViewModel.name,
              divViewModel.context);
        },
        builder: (context, viewModel, _) {
          return DivContainerWidget(viewModel);
        },
      ),
    ));
  }

  @override
  void initState() {
    super.initState();
    widget._viewModel.registerFrameCallback();
  }

  @override
  void dispose() {
    super.dispose();
    widget._viewModel.removeFrameCallback();
  }
}
