import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../controller/controller.dart';
import '../controller/props.dart';
import '../engine/engine_context.dart';
import '../render/node.dart';
import '../style/prop.dart';
import '../viewmodel/qr.dart';
import '../widget/qr.dart';

class QrController extends BaseViewController<QrRenderViewModel> {
  static const String className = "QrImage";

  @override
  Widget createWidget(BuildContext context, QrRenderViewModel viewModel) {
    return QrWidget(viewModel);
  }

  @override
  QrRenderViewModel createRenderViewModel(
      RenderNode node, EngineContext context) {
    return QrRenderViewModel(node.id, node.rootId, node.name, context);
  }

  @override
  Map<String, ControllerMethodProp> get extendRegisteredMethodProp {
    var extraMap = <String, ControllerMethodProp>{};
    extraMap[NodeProps.text] = ControllerMethodProp(setText, '');
    extraMap[NodeProps.level] =
        ControllerMethodProp(setLevel, QrErrorCorrectLevel.L);
    extraMap[NodeProps.version] =
        ControllerMethodProp(setVersion, QrVersions.auto);

    return extraMap;
  }

  @ControllerProps(NodeProps.text)
  void setText(QrRenderViewModel viewModel, String text) {
    viewModel.text = text;
  }

  @ControllerProps(NodeProps.level)
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

  @ControllerProps(NodeProps.version)
  void setVersion(QrRenderViewModel viewModel, int version) {
    viewModel.version = version;
  }

  @override
  String get name => className;
}
