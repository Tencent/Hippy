import 'dart:convert';
import 'dart:typed_data';
import 'dart:ui';

import 'package:flutter/cupertino.dart';
import 'package:flutter/rendering.dart';

import '../../../engine/engine_context.dart';
import '../../../flutter_render.dart';
import 'model.dart';

class ScreencastFrame implements InspectorModel {
  final String? screenShot;
  final int sessionId;
  ScreencastFrame(this.screenShot, this.sessionId);

  static Future<String?> getScreenShot(EngineContext context) async {
    try {
      final globalKey = context.getInstance(context.engineId)?.rootKey;
      final renderObject = globalKey?.currentContext?.findRenderObject();
      if (renderObject == null) {
        return null;
      }

      final boundary = renderObject as RenderRepaintBoundary;
      final image = await boundary.toImage();
      final byteData = await image.toByteData(format: ImageByteFormat.png);
      final pngByteList = byteData?.buffer.asUint8List();
      return pngByteList == null ? null : base64Encode(pngByteList);
    } catch (e) {
      print('getScreenShot error: ${e.toString()}');
      return null;
    }
  }

  Map getMetaData() {
    final mediaQuery = MediaQueryData.fromWindow(window);
    final deviceWidth = mediaQuery.size.width;
    final deviceHeight = mediaQuery.size.height;

    return {
      'offsetTop': 0,
      'pageScaleFactor': 1,
      'deviceWidth': deviceWidth,
      'deviceHeight': deviceHeight,
      'scrollOffsetX': 0,
      'scrollOffsetY': 0,
      'timestamp': sessionId,
    };
  }

  Map toJson() {
    return {
      'data': screenShot ?? '',
      'metadata': getMetaData(),
      'sessionId': sessionId,
    };
  }
}
