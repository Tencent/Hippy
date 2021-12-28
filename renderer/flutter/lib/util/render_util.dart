import 'package:flutter/cupertino.dart';

Size getSizeFromKey(GlobalKey key) {
  return key.currentContext?.size ?? Size(0, 0);
}
