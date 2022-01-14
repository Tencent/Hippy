import '../widget.dart';

mixin RendererLoader {
  bool back(BackPressHandler handler);

  void load(RootWidgetViewModel viewModel);

  void destroy();
}

typedef BackPressHandler = Function();

mixin LoadInstanceContext {}
