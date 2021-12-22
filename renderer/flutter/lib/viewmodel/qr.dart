import 'package:qr_flutter/qr_flutter.dart';

import '../engine.dart';
import 'view_model.dart';

class QrRenderViewModel extends RenderViewModel {
  String? text;
  int level = QrErrorCorrectLevel.L;
  int version = QrVersions.auto;

  QrRenderViewModel(
      int id, int instanceId, String className, EngineContext context)
      : super(id, instanceId, className, context);
}
