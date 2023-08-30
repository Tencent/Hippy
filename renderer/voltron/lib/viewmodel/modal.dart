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
import 'package:flutter/services.dart';
import 'package:voltron_renderer/controller.dart';

import '../engine.dart';
import '../render.dart';
import '../util.dart';
import '../widget.dart';
import 'group.dart';

class ModalRenderViewModel extends GroupViewModel implements InstanceLifecycleEventListener {
  bool animationSwitch = true;
  String animationType = "none";
  int animationDuration = 200;
  int barrierColor = 0x01ffffff;
  bool immersionStatusBar = true;
  bool statusBarTextDarkColor = false;
  bool transparent = true;

  bool canDialogShow = true;
  bool isShowDialog = false;

  double oldWidth = 0;
  double oldHeight = 0;

  GlobalKey modalKey = GlobalKey();

  ModalRenderViewModel({
    required int id,
    required int instanceId,
    required String className,
    required RenderContext context,
  }) : super(id, instanceId, className, context) {
    context.addInstanceLifecycleEventListener(this);
  }

  ModalRenderViewModel.copy({
    required int id,
    required int instanceId,
    required String className,
    required RenderContext context,
    required ModalRenderViewModel viewModel,
  }) : super.copy(id, instanceId, className, context, viewModel) {
    animationSwitch = viewModel.animationSwitch;
    animationType = viewModel.animationType;
    animationDuration = viewModel.animationDuration;
    barrierColor = viewModel.barrierColor;
    immersionStatusBar = viewModel.immersionStatusBar;
    statusBarTextDarkColor = viewModel.statusBarTextDarkColor;
    transparent = viewModel.transparent;
    canDialogShow = viewModel.canDialogShow;
    oldWidth = viewModel.oldWidth;
    oldHeight = viewModel.oldHeight;
    modalKey = viewModel.modalKey;
  }

  @override
  bool operator ==(Object other) {
    return other is ModalRenderViewModel &&
        animationSwitch == other.animationSwitch &&
        animationType == other.animationType &&
        animationDuration == other.animationDuration &&
        barrierColor == other.barrierColor &&
        immersionStatusBar == other.immersionStatusBar &&
        statusBarTextDarkColor == other.statusBarTextDarkColor &&
        transparent == other.transparent &&
        canDialogShow == other.canDialogShow &&
        oldWidth == other.oldWidth &&
        oldHeight == other.oldHeight;
  }

  @override
  int get hashCode =>
      animationSwitch.hashCode |
      animationType.hashCode |
      animationDuration.hashCode |
      barrierColor.hashCode |
      immersionStatusBar.hashCode |
      statusBarTextDarkColor.hashCode |
      transparent.hashCode |
      canDialogShow.hashCode |
      oldHeight.hashCode |
      oldHeight.hashCode;

  @override
  void onInstanceDestroy(int instanceId) {
    canDialogShow = false;
    showOrDismissDialog();
  }

  @override
  void onInstanceLoad(int instanceId) {
    canDialogShow = true;
    showOrDismissDialog();
  }

  @override
  void onInstancePause(int instanceId) {
    canDialogShow = false;
    showOrDismissDialog();
  }

  @override
  void onInstanceResume(int instanceId) {
    canDialogShow = true;
    showOrDismissDialog();
  }

  @override
  void onViewModelDestroy() {
    canDialogShow = false;
    showOrDismissDialog();
    context.removeInstanceLifecycleEventListener(this);
    super.onViewModelDestroy();
  }

  void showOrDismissDialog() {
    WidgetsBinding.instance.addPostFrameCallback((timeStamp) {
      LogUtils.dWidget("ID:$id, node:$idDesc, modal can show:$canDialogShow");
      if (canDialogShow) {
        showDialog();
      } else {
        dismissDialog();
      }
    });
  }

  void showDialog() {
    LogUtils.dWidget("ID:$id, node:$idDesc, fire modal show");
    var buildContext = context.getInstance(rootId)?.rootKey.currentContext;
    if (!isShowDialog && buildContext != null && children.isNotEmpty) {
      isShowDialog = true;
      var durationTime = 200;
      if (animationType == 'none' || animationSwitch == false) {
        durationTime = 0;
      } else if (animationDuration > 0) {
        durationTime = animationDuration;
      }
      showGeneralDialog(
        barrierLabel: MaterialLocalizations.of(buildContext).modalBarrierDismissLabel,
        barrierDismissible: true,
        barrierColor: Color(barrierColor),
        context: buildContext,
        transitionDuration: Duration(milliseconds: durationTime),
        transitionBuilder: (context, anim1, anim2, child) {
          return _animation(
            aniType: animationType,
            child: child,
            animation: anim1,
          );
        },
        pageBuilder: (context, animation, secondaryAnimation) {
          return _dialogRoot(
            child: ModalContainerWidget(this),
          );
        },
      ).then((value) {
        isShowDialog = false;
      });
      onShow();
    }
  }

  Widget _dialogRoot({required Widget child}) {
    Widget content;
    if (immersionStatusBar) {
      content = child;
    } else {
      content = SafeArea(child: child);
    }
    content = Scaffold(
      backgroundColor: const Color(0x01ffffff),
      resizeToAvoidBottomInset: true,
      body: WillPopScope(
        onWillPop: () async {
          onRequestClose();
          return false;
        },
        child: content,
      ),
    );
    if (statusBarTextDarkColor) {
      content = AnnotatedRegion<SystemUiOverlayStyle>(
        value: SystemUiOverlayStyle(
          statusBarIconBrightness: Brightness.dark,
          statusBarBrightness: Brightness.light,
        ),
        child: content,
      );
    }
    return Material(
      type: MaterialType.transparency,
      child: content,
    );
  }

  void onRequestClose() {
    context.renderBridgeManager.sendComponentEvent(
      rootId,
      id,
      ModalController.kEventOnRequestClose,
      {},
    );
  }

  void onShow() {
    context.renderBridgeManager.sendComponentEvent(
      rootId,
      id,
      ModalController.kEventOnShow,
      {},
    );
  }

  Widget _animation({
    String? aniType,
    Widget? child,
    required Animation<double> animation,
  }) {
    if (!isEmpty(aniType)) {
      if (aniType == "fade") {
        return FadeTransition(
          opacity: CurvedAnimation(
            parent: animation,
            curve: Curves.easeInCubic,
          ),
          child: child,
        );
      } else if (aniType == "slide" || aniType == "slide-bottom") {
        var screenHeight = ScreenUtil.getInstance().screenHeight;

        return Transform.translate(
          offset: Tween(
            begin: Offset(0, screenHeight),
            end: Offset.zero,
          )
              .animate(
                CurvedAnimation(
                  parent: animation,
                  curve: Curves.easeInCubic,
                ),
              )
              .value,
          child: child,
        );
      } else if (aniType == 'slide_fade') {
        return SlideTransition(
          position: Tween<Offset>(
            begin: const Offset(0, 1),
            end: Offset.zero,
          ).animate(
            CurvedAnimation(
              parent: animation,
              curve: Curves.easeInCubic,
            ),
          ),
          child: FadeTransition(
            opacity: CurvedAnimation(
              parent: animation,
              curve: Curves.easeInCubic,
            ),
            child: child,
          ),
        );
      } else if (aniType == "pop") {
        return ScaleTransition(
          scale: animation,
          child: child,
        );
      } else if (aniType == "slide-top") {
        var screenHeight = ScreenUtil.getInstance().screenHeight;

        return Transform.translate(
          offset: Tween(
            begin: Offset(0, -screenHeight),
            end: Offset.zero,
          )
              .animate(
                CurvedAnimation(
                  parent: animation,
                  curve: Curves.easeInCubic,
                ),
              )
              .value,
          child: child,
        );
      } else if (aniType == "slide-left") {
        var screenWidth = ScreenUtil.getInstance().screenWidth;

        return Transform.translate(
          offset: Tween(
            begin: Offset(
              -screenWidth,
              0,
            ),
            end: Offset.zero,
          )
              .animate(
                CurvedAnimation(
                  parent: animation,
                  curve: Curves.easeInCubic,
                ),
              )
              .value,
          child: child,
        );
      } else if (aniType == "slide-right") {
        var screenWidth = ScreenUtil.getInstance().screenWidth;

        return Transform.translate(
          offset: Tween(
            begin: Offset(screenWidth, 0),
            end: Offset.zero,
          )
              .animate(
                CurvedAnimation(
                  parent: animation,
                  curve: Curves.easeInCubic,
                ),
              )
              .value,
          child: child,
        );
      }
    }
    return FadeTransition(
      opacity: CurvedAnimation(
        parent: animation,
        curve: Curves.linear,
      ),
      child: child,
    );
  }

  void dismissDialog() {
    LogUtils.dWidget("ID:$id, node:$idDesc, fire modal dismiss");
    var buildContext = context.getInstance(rootId)?.rootKey.currentContext;
    if (isShowDialog && buildContext != null) {
      isShowDialog = false;
      Navigator.of(buildContext).pop();
    }
  }
}
