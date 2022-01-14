import 'package:flutter/material.dart';

import '../render.dart';
import '../widget.dart';
import 'view_model.dart';

class ImageRenderViewModel extends RenderViewModel {
  int tintColor = Colors.transparent.value;
  String? src;
  BoxFit? fit;
  Alignment? alignment;
  ImageRepeat? repeat;
  late ImageEventDispatcher imageEventDispatcher;
  Rect? centerSlice;
  CapInsets? capInsets;
  ImageProvider? image;
  int? imageWidth;
  int? imageHeight;
  Image? defaultImage;
  Set<String> dispatchedEvent = {};

  ImageRenderViewModel(
      int id, int instanceId, String className, RenderContext context)
      : super(id, instanceId, className, context) {
    imageEventDispatcher = createImageEventDispatcher();
  }

  ImageEventDispatcher createImageEventDispatcher() {
    return ImageEventDispatcher(id, context);
  }
}
