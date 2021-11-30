import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../common/voltron_array.dart';
import '../common/voltron_map.dart';
import '../controller/manager.dart';
import '../controller/props.dart';
import '../dom/prop.dart';
import '../engine/context.dart';
import '../engine/engine_context.dart';
import '../util/image_util.dart';
import '../util/log_util.dart';
import '../widget/qr.dart';
import 'controller.dart';
import 'node.dart';
import 'tree.dart';
import 'view_model.dart';

class QrController extends VoltronViewController<QrRenderNode> {
  static const String className = "QrImage";

  @override
  QrRenderNode createRenderNode(int id, VoltronMap? props, String name,
      RenderTree tree, ControllerManager controllerManager, bool lazy) {
    return QrRenderNode(id, name, tree, controllerManager, props);
  }

  @override
  Widget createWidget(BuildContext context, QrRenderNode renderNode) {
    return QrWidget(renderNode.renderViewModel);
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
  void setText(QrRenderNode node, String text) {
    node.renderViewModel.text = text;
  }

  @ControllerProps(NodeProps.level)
  void setLevel(QrRenderNode node, String level) {
    switch (level) {
      case 'l':
        node.renderViewModel.level = QrErrorCorrectLevel.L;
        break;
      case 'm':
        node.renderViewModel.level = QrErrorCorrectLevel.M;
        break;
      case 'q':
        node.renderViewModel.level = QrErrorCorrectLevel.Q;
        break;
      case 'h':
        node.renderViewModel.level = QrErrorCorrectLevel.H;
        break;
      default:
        node.renderViewModel.level = QrErrorCorrectLevel.L;
    }
  }

  @ControllerProps(NodeProps.version)
  void setVersion(QrRenderNode node, int version) {
    node.renderViewModel.version = version;
  }

  @override
  String get name => className;
}

class QrRenderViewModel extends RenderViewModel {
  String? text;
  int level = QrErrorCorrectLevel.L;
  int version = QrVersions.auto;

  QrRenderViewModel(
      int id, int instanceId, String className, EngineContext context)
      : super(id, instanceId, className, context);
}

class QrRenderNode extends RenderNode<QrRenderViewModel> {
  QrRenderNode(int id, String className, RenderTree root,
      ControllerManager controllerManager, VoltronMap? props)
      : super(id, className, root, controllerManager, props);

  @override
  QrRenderViewModel createRenderViewModel(EngineContext context) {
    return QrRenderViewModel(id, rootId, name, context);
  }
}
