import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import '../common/voltron_map.dart';
import '../controller/manager.dart';
import '../controller/props.dart';
import '../engine/engine_context.dart';
import '../module/event_dispatcher.dart';
import '../module/module.dart';
import '../util/enum_util.dart';
import '../util/log_util.dart';
import '../util/screen_util.dart';
import '../util/string_util.dart';
import '../voltron/lifecycle.dart';
import '../widget/modal.dart';
import 'group.dart';

class ModalRenderViewModel extends GroupViewModel
    implements InstanceLifecycleEventListener {
  bool animationSwitch = true;
  String animationType = "none";
  int animationDuration = 200;
  int barrierColor = 0x01ffffff;
  bool immersionStatusBar = true;
  bool statusBarTextDarkColor = false;
  bool transparent = true;
  bool resizeToAvoidBottomInset = true;

  bool canDialogShow = true;
  bool isShowDialog = false;

  double oldWidth = 0;
  double oldHeight = 0;

  GlobalKey modalKey = GlobalKey();

  ModalRenderViewModel(
      {required int id,
      required int instanceId,
      required String className,
      required EngineContext context})
      : super(id, instanceId, className, context) {
    context.addInstanceLifecycleEventListener(this);
  }

  ModalRenderViewModel.copy(
      {required int id,
      required int instanceId,
      required String className,
      required EngineContext context,
      required ModalRenderViewModel viewModel})
      : super.copy(id, instanceId, className, context, viewModel) {
    animationSwitch = viewModel.animationSwitch;
    animationType = viewModel.animationType;
    animationDuration = viewModel.animationDuration;
    barrierColor = viewModel.barrierColor;
    immersionStatusBar = viewModel.immersionStatusBar;
    statusBarTextDarkColor = viewModel.statusBarTextDarkColor;
    transparent = viewModel.transparent;
    resizeToAvoidBottomInset = viewModel.resizeToAvoidBottomInset;
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
        resizeToAvoidBottomInset == other.resizeToAvoidBottomInset &&
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
      resizeToAvoidBottomInset.hashCode |
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

  void registerFrameCallback() {
    if (context.getInstance(rootId)?.viewExecutorList.contains(doFrame) ==
        false) {
      context.getInstance(rootId)?.viewExecutorList.add(doFrame);
    }
  }

  void removeFrameCallback() {
    context.getInstance(rootId)?.viewExecutorList.remove(doFrame);
  }

  void doFrame() {
    var newWidth = modalKey.currentContext?.size?.width ?? 0.0;
    var newHeight = modalKey.currentContext?.size?.height ?? 0.0;
    if (oldWidth != newWidth || oldHeight != newHeight) {
      if (children.isNotEmpty) {
        oldWidth = newWidth;
        oldHeight = newHeight;
        // todo 更新root node size
        // context.domManager.updateNodeSize(children[0].id, newWidth, newHeight);
      }
    }
  }

  void showOrDismissDialog() {
    WidgetsBinding.instance?.addPostFrameCallback((timeStamp) {
      LogUtils.dWidget(
          "ModalWidget", "container build inner, can show:$canDialogShow");
      if (canDialogShow) {
        showDialog();
      } else {
        dismissDialog();
      }
    });
  }

  void showDialog() {
    LogUtils.dWidget("ModalWidget",
        "real show dialog, (isShow: $isShowDialog, childLen(${children.length}))");
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
          barrierLabel:
              MaterialLocalizations.of(buildContext).modalBarrierDismissLabel,
          barrierDismissible: true,
          barrierColor: Color(barrierColor),
          context: buildContext,
          transitionDuration: Duration(milliseconds: durationTime),
          transitionBuilder: (context, anim1, anim2, child) {
            return _animation(
                aniType: animationType,
                child: _dialogRoot(
                  child: ModalDialogWidget(this),
                ),
                animation: anim1);
          },
          pageBuilder: (context, animation, secondaryAnimation) {
            return Container();
          }).then((value) {
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
    return Material(
        type: MaterialType.transparency,
        child: Scaffold(
            backgroundColor: Color(0x01ffffff),
            resizeToAvoidBottomInset: resizeToAvoidBottomInset,
            body: AnnotatedRegion<SystemUiOverlayStyle>(
                value: statusBarTextDarkColor
                    ? SystemUiOverlayStyle.dark
                    : SystemUiOverlayStyle.light,
                child: WillPopScope(
                  onWillPop: () async {
                    onRequestClose();
                    return false;
                  },
                  child: content,
                ))));
  }

  void onRequestClose() {
    context.moduleManager
        .getJavaScriptModule<EventDispatcher>(
            enumValueToString(JavaScriptModuleType.EventDispatcher))
        ?.receiveUIComponentEvent(id, "onRequestClose", null);
  }

  void onShow() {
    context.moduleManager
        .getJavaScriptModule<EventDispatcher>(
            enumValueToString(JavaScriptModuleType.EventDispatcher))
        ?.receiveUIComponentEvent(id, "onShow", null);
  }

  Widget _animation(
      {String? aniType, Widget? child, required Animation<double> animation}) {
    if (!isEmpty(aniType)) {
      if (aniType == "fade") {
        return FadeTransition(
            opacity: CurvedAnimation(
              parent: animation,
              curve: Curves.easeInCubic,
            ),
            child: child);
      } else if (aniType == "slide" || aniType == "slide-bottom") {
        var screenHeight = ScreenUtil.getInstance().screenHeight;

        return Transform.translate(
            offset: Tween(begin: Offset(0, screenHeight), end: Offset.zero)
                .animate(CurvedAnimation(
                    parent: animation, curve: Curves.easeInCubic))
                .value,
            child: child);
      } else if (aniType == 'slide_fade') {
        return SlideTransition(
            position: Tween<Offset>(begin: Offset(0, 1), end: Offset.zero)
                .animate(CurvedAnimation(
                    parent: animation, curve: Curves.easeInCubic)),
            child: FadeTransition(
                opacity: CurvedAnimation(
                    parent: animation, curve: Curves.easeInCubic),
                child: child));
      } else if (aniType == "pop") {
        return ScaleTransition(scale: animation, child: child);
      } else if (aniType == "slide-top") {
        var screenHeight = ScreenUtil.getInstance().screenHeight;

        return Transform.translate(
            offset: Tween(begin: Offset(0, -screenHeight), end: Offset.zero)
                .animate(CurvedAnimation(
                    parent: animation, curve: Curves.easeInCubic))
                .value,
            child: child);
      } else if (aniType == "slide-left") {
        var screenWidth = ScreenUtil.getInstance().screenWidth;

        return Transform.translate(
            offset: Tween(begin: Offset(-screenWidth, 0), end: Offset.zero)
                .animate(CurvedAnimation(
                    parent: animation, curve: Curves.easeInCubic))
                .value,
            child: child);
      } else if (aniType == "slide-right") {
        var screenWidth = ScreenUtil.getInstance().screenWidth;

        return Transform.translate(
            offset: Tween(begin: Offset(screenWidth, 0), end: Offset.zero)
                .animate(CurvedAnimation(
                    parent: animation, curve: Curves.easeInCubic))
                .value,
            child: child);
      }
    }
    return FadeTransition(
        opacity: CurvedAnimation(
          parent: animation,
          curve: Curves.linear,
        ),
        child: child);
  }

  void dismissDialog() {
    LogUtils.dWidget(
        "ModalWidget", "real dismiss dialog, (isShow: $isShowDialog)");
    var buildContext = context.getInstance(rootId)?.rootKey.currentContext;
    if (isShowDialog && buildContext != null) {
      removeFrameCallback();
      Navigator.of(buildContext).pop();
    }
  }
}
