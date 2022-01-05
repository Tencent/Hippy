import 'dart:convert';
import 'dart:io';

import 'package:flutter/cupertino.dart';

ImageProvider getImage(String src) {
  ImageProvider image;
  if (src.startsWith('assets://')) {
    image = AssetImage(src.replaceFirst('assets://', ''));
  } else if (src.startsWith('file://')) {
    image = FileImage(File(src.replaceFirst('file://', '')));
  } else if (src.startsWith('data:')){ // base 64
    var base64Str = src.split('base64,').last;
    image = imageFromBase64String(base64Str);
  } else {
    image = NetworkImage(src);
  }
  return image;
}

MemoryImage imageFromBase64String(String base64String) {
  return MemoryImage(base64Decode(base64String));
}
