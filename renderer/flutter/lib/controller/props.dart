import '../render.dart';
import '../viewmodel.dart';

class ControllerMethodProp<T> {
  final Function method;
  final T defaultValue;
  const ControllerMethodProp(this.method, this.defaultValue);
}

class ControllerMethodPropProvider {
  final Map<String, ControllerMethodProp> _renderMethodMap = {};

  Map<String, ControllerMethodProp> get renderMethodMap => _renderMethodMap;

  void pushMethodProp(String name, ControllerMethodProp? prop) {
    if (prop == null) {
      throw ArgumentError("push render method prop error , prop is null");
    }
    _renderMethodMap[name] = prop;
  }

  void pushAll(Map<String, ControllerMethodProp> map) {
    _renderMethodMap.addAll(map);
  }
}

abstract class ControllerMethodPropConsumer<T extends RenderViewModel> {
  String get name;

  ControllerMethodPropProvider generateProvider();

  void setCustomProp(RenderNode node, String name, Object prop);
}

class ControllerProps {
  final String name;

  const ControllerProps(this.name);
}
