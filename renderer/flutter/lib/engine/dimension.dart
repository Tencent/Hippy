import 'package:flutter/cupertino.dart';

import '../common.dart';

mixin DimensionChecker {
  void checkUpdateDimension(BuildContext uiContext, VoltronMap dimensionMap, int windowWidth,
      int windowHeight,
      bool shouldUseScreenDisplay, bool systemUiVisibilityChanged);
}
