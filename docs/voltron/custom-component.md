# 定制界面组件

App 开发中有可能使用到大量的 UI 组件，Hippy SDK 已包括其中常用的部分，如 `View` , `Text` , `Image` 等，但这极有可能无法满足你的需求，这就需要对 UI 组件进行扩展封装。

---

# 组件扩展

实际应用开发中，我们经常会遇到需要展示二维码的场景，所以我们这里就以 `QrImage` 为例，从头介绍如何扩展组件。

> 本文主要介绍flutter侧工作，前端工作请查看对应的文档。

扩展一个 UI 组件需要包括以下工作：

1. 创建对应的 `Controller`，
2. 创建对应的 `ViewModel`
3. 创建对应的 `Widget`
4. 终端注册组件
5. 前端注册组件及使用

## 创建对应的 `Controller`

```dart
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:voltron_renderer/voltron_renderer.dart';

class QrController extends BaseViewController<QrRenderViewModel> {
  static const String kClassName = "QrImage";

  // 提供创建对应 Widget 的方法
  @override
  Widget createWidget(BuildContext context, QrRenderViewModel viewModel) {
    return QrWidget(viewModel);
  }

  // 创建创建对应 ViewModel 的方法
  @override
  QrRenderViewModel createRenderViewModel(
    RenderNode node,
    RenderContext context,
  ) {
    return QrRenderViewModel(
      node.id,
      node.rootId,
      node.name,
      context,
    );
  }

  // 组件属性设置，将前端的 Props 对应设置到 ViewModel 中，可类比 Native Renderer 中的 View
  @override
  Map<String, ControllerMethodProp> get extendRegisteredMethodProp {
    var extraMap = <String, ControllerMethodProp>{};
    // 这里注意默认值的类型
    extraMap[NodeProps.kText] = ControllerMethodProp<QrRenderViewModel, String>(setText, '');
    extraMap[NodeProps.kLevel] = ControllerMethodProp<QrRenderViewModel, String>(setLevel, enumValueToString(QrErrorCorrectLevel.L));
    return extraMap;
  }

  // 给 ViewModel 设置对应属性
  @ControllerProps(NodeProps.kText)
  void setText(QrRenderViewModel viewModel, String text) {
    viewModel.text = text;
  }

  // 给 ViewModel 设置对应属性
  @ControllerProps(NodeProps.kLevel)
  void setLevel(QrRenderViewModel viewModel, String level) {
    switch (level) {
      case 'l':
        viewModel.level = QrErrorCorrectLevel.L;
        break;
      case 'm':
        viewModel.level = QrErrorCorrectLevel.M;
        break;
      case 'q':
        viewModel.level = QrErrorCorrectLevel.Q;
        break;
      case 'h':
        viewModel.level = QrErrorCorrectLevel.H;
        break;
      default:
        viewModel.level = QrErrorCorrectLevel.L;
    }
  }

  // 处理 UI 事件，类似于 this.$refs.input.focus(); 这里可以参考 TextInput 设计
  @override
  void dispatchFunction(
    QrRenderViewModel viewModel,
    String functionName,
    VoltronArray array, {
    Promise? promise,
  }) {
    super.dispatchFunction(viewModel, functionName, array, promise: promise);
  }

  @override
  String get name => kClassName;
}
```

## 创建对应的 `ViewModel`

这里重点关注对于属性的设置，类似于 `text` 和 `level` ， `text` 指的是二维码对应的数据，`level` 则可以参考 [https://pub.dev/packages/qr_flutter](https://pub.dev/packages/qr_flutter) 

!> 千万注意要重写相等操作符，Voltron 底层使用了 Provider 来做状态管理，我们会根据 ViewModel 是否相等来判断当前 Widget 是否需要更新

```dart
import 'package:qr_flutter/qr_flutter.dart';
import 'package:voltron_renderer/voltron_renderer.dart';

class QrRenderViewModel extends GroupViewModel {
  String? text;
  int level = QrErrorCorrectLevel.L;

  QrRenderViewModel(
    int id,
    int instanceId,
    String className,
    RenderContext context,
  ) : super(id, instanceId, className, context);

  QrRenderViewModel.copy(
      int id,
      int instanceId,
      String className,
      RenderContext context,
      QrRenderViewModel viewModel,
      ) : super.copy(id, instanceId, className, context, viewModel) {
    text = viewModel.text;
    level = viewModel.level;
  }

  @override
  bool operator ==(Object other) {
    return other is QrRenderViewModel &&
        text == other.text &&
        level == other.level;
  }

  @override
  int get hashCode =>
      text.hashCode |
      level.hashCode |
      super.hashCode;
}
```

## 创建对应的 `Widget`

这里需要注意，如果你的组件需要参与 `css` 位置计算，那么需要包裹在 `PositionedWidget` 中（大部分的组件均是如此，例如 `TextInput`，`View` 等），如果只需要参与 `css` 宽高计算，则需要包裹在 `BoxWidget` 中（例如可以参考 `ListView` 中的 `ListItem` ），还有一部分不需要实际存在的组件，则可以自行定制（例如 `Modal` 组件，本身并不需要实际存在，打开之后是新的蒙层）。

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:voltron_renderer/voltron_renderer.dart';

class QrWidget extends FRStatefulWidget {
  final QrRenderViewModel _viewModel;

  QrWidget(this._viewModel) : super(_viewModel);

  @override
  State<StatefulWidget> createState() {
    return _QrWidgetState();
  }
}

class _QrWidgetState extends FRState<QrWidget> {
  @override
  Widget build(BuildContext context) {
    LogUtils.dWidget(
      "ID:${widget._viewModel.id}, node:${widget._viewModel.idDesc}, build qr widget",
    );
    // 这里注意一定要使用 Provider，以实现数据变更驱动视图变更
    return ChangeNotifierProvider.value(
      value: widget._viewModel,
      child: Consumer<QrRenderViewModel>(
        builder: (context, viewModel, widget) {
          return PositionWidget(
            viewModel,
            child: qrView(viewModel),
          );
        },
      ),
    );
  }

  Widget qrView(QrRenderViewModel viewModel) {
    LogUtils.dWidget(
      "ID:${widget._viewModel.id}, node:${widget._viewModel.idDesc}, build qr inner widget",
    );
    var text = viewModel.text;
    if (text != null && text.isNotEmpty) {
      return QrImage(
        data: text,
        errorCorrectionLevel: viewModel.level,
        padding: const EdgeInsets.all(0),
      );
    } else {
      return Container();
    }
  }
}
```

## 注册组件

上面的工作做完后，我们需要把组件注册进入 Voltron 应用，还记得初始化时的 `MyAPIProvider` 吗，这里我们要传入

```dart
class MyAPIProvider implements APIProvider {

  // 这个是模块扩展
  @override
  List<ModuleGenerator> get nativeModuleGeneratorList => [];

  // 这里是 JavaScript 模块生成器
  @override
  List<JavaScriptModuleGenerator> get javaScriptModuleGeneratorList => [];

  // 这里是组件扩展，将我们扩展的组件按照对应格式写进即可，注意这里的 KClassName 要与前端注册保持一致
  @override
  List<ViewControllerGenerator> get controllerGeneratorList => [
      ViewControllerGenerator(
        QrController.kClassName,
        (object) => QrController(),
      )
    ];
}
```

在引擎初始化的时候传入即可

```dart
// ...
initParams.providers = [
  MyAPIProvider(),
];
// ...
```

## 前端使用

### 如果您使用的是`hippy-vue`

可以参考 [hippy-vue/customize](hippy-vue/customize)

### 如果您是用的是`hippy-react`

可以参考 [hippy-react/customize](hippy-react/customize)

# 手势事件处理

Voltron 手势处理集成在 `PositionWidget` 或者 `BoxWidget` 中，无需用户手动处理，只要外层包裹在上述两种Widget下，则默认自带 `onClick` , `onLongclick` , `onTouchDown`, `onTouchMove` , `onTouchEnd` 等等一系列手势事件

# 更多特性

## 处理组件方法调用

在有些场景，JavaScript 需要调用组件的一些方法，比如 `QrView` 的 `changeText`。这个时候需要在 `QrController`重载 `dispatchFunction` 方法来处理JS的方法调用。对应的前端调用文档 [hippy-react/customize](hippy-react/customize)

```dart
@override
void dispatchFunction(
  QrRenderViewModel viewModel,
  String functionName,
  VoltronArray array, {
  Promise? promise,
}) {
  super.dispatchFunction(viewModel, functionName, array, promise: promise);
  if (functionName == "changeText") {}
  switch (functionName) {
    case "changeText":
      String? text = array.get<String>(0);
      if (text != null) {
        viewModel.text = text;
        // 需要注意，如果在调用事件时涉及到界面更新，则需要调用 ViewModel 的 update 方法来触发更新，如果是类似于 input 的 focus()，不涉及 UI 更新，则不需要
        viewModel.update();
      }
      break;
  }
}
```

## 事件回调

Voltron SDK 提供了 `context.bridgeManager.sendComponentEvent(rootId, id, eventName, params);`方法，封装了 UI 事件发送的逻辑，在任意地方找到 `RenderContext` 调用即可发送事件到 JavaScript 对应的组件上。比如我要在 `QrView` 的 `build` 的时候发送事件到前端的控件上面。
示例如下：

```dart
@override
Widget build(BuildContext context) {
  var params = VoltronMap();
  params.push("test", "code");
  widget._viewModel.context.bridgeManager.sendComponentEvent(
    widget._viewModel.rootId,
    widget._viewModel.id,
    "eventName",
    params,
  );
  // return SomeWidget();
}

```
