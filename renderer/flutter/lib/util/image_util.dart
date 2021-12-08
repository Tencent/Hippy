import 'dart:io';

import 'package:flutter/cupertino.dart';

ImageProvider getImage(String src) {
  ImageProvider image;
  if (src.startsWith('assets://')) {
    image = AssetImage(src.replaceFirst('assets://', ''));
  } else if (src.startsWith('file://')) {
    image = FileImage(File(src.replaceFirst('file://', '')));
  } else {
    image = NetworkImage(src);
  }
  return image;
}
