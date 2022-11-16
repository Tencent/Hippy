# Custom UI Components

App development may use a large number of UI components, Voltron SDK has included the commonly used parts, such as `View`, `Text`, `Image`, etc., but it is highly likely that they can not meet your needs, which requires to extend and encapsulate UI components.

---

# Component Extension

In practical application development, we often encounter scenarios where we need to display QR codes, so here we take `QrImage` as an example to introduce how to extend components.

Extending a UI component requires the following work:

1. Create `Controller`，
2. Create `ViewModel`
3. Create `Widget`
4. Native register component
5. Front-End register component and use it

## Create `Controller`

```dart
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:voltron_renderer/voltron_renderer.dart';

class QrController extends BaseViewController<QrRenderViewModel> {
  static const String kClassName = "QrImage";

  // Provider the function to create widget
  @override
  Widget createWidget(BuildContext context, QrRenderViewModel viewModel) {
    return QrWidget(viewModel);
  }

  // Provider the function to create ViewModel
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

  // Component property settings, set the Front-End props to the ViewModel correspondingly, which can be analogous to the view in the native renderer
  @override
  Map<String, ControllerMethodProp> get extendRegisteredMethodProp {
    var extraMap = <String, ControllerMethodProp>{};
    // Note the type of default value here
    extraMap[NodeProps.kText] = ControllerMethodProp<QrRenderViewModel, String>(setText, '');
    extraMap[NodeProps.kLevel] = ControllerMethodProp<QrRenderViewModel, String>(setLevel, enumValueToString(QrErrorCorrectLevel.L));
    return extraMap;
  }

  // Set corresponding properties to ViewModel
  @ControllerProps(NodeProps.kText)
  void setText(QrRenderViewModel viewModel, String text) {
    viewModel.text = text;
  }

  // Set corresponding properties to ViewModel
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

  // Handling ui events, similar to this.$refs.input.focus(); here you can refer to the TextInput design
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

## Create `ViewModel`

The focus here is on the setting of attributes, similar to `text` and `level`, `text` refers to the data corresponding to the QR code, and `level` can refer to [https://pub.dev/packages/qr_flutter](https://pub.dev/packages/qr_flutter). 

!> be sure to rewrite the equivalent operator for decentralization. This is because Voltron uses a provider at the bottom for state management. We will judge whether the current widget needs to be updated based on whether the ViewModel is equal or not.

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

## Create `Widget`

It should be noted here that if your component needs to participate in `css` position calculation, it needs to be wrapped in `PositionedWidget` (this is true for most components, such as `TextInput`, `View`, etc.), if you only need to participate in `css` width and height calculation, you need to wrap In `BoxWidget` (for example, you can refer to `ListItem` in `ListView` ), there are some components that do not need to actually exist, which can be customized by yourself (for example, the `Modal` component itself does not need to actually exist, and it is a new mask after opening).

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
    // Note here that Provider must be used to implement data change-driven view changes
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

## Register component

After the above work is done, we need to register the component into the Voltron application. Remember the `MyAPIProvider` during initialization, here we need to pass in

```dart
class MyAPIProvider implements APIProvider {

  // custom modules
  @override
  List<ModuleGenerator> get nativeModuleGeneratorList => [];

  // custom javascript modules
  @override
  List<JavaScriptModuleGenerator> get javaScriptModuleGeneratorList => [];

  // Here is the component extension, just write the components we extend in the corresponding format, note that the KClassName here should be consistent with the Front-End registration
  @override
  List<ViewControllerGenerator> get controllerGeneratorList => [
      ViewControllerGenerator(
        QrController.kClassName,
        (object) => QrController(),
      )
    ];
}
```

It can be passed in when the engine is initialized

```dart
// ...
initParams.providers = [
  MyAPIProvider(),
];
// ...
```

## Front-End use

### If you use `hippy-vue`

You can find the doc here [hippy-vue/customize](hippy-vue/customize)

### If you use `hippy-react`

You can find the doc here [hippy-react/customize](hippy-react/customize)

# Gesture event handler

Voltron gesture processing is integrated in `PositionWidget` or `BoxWidget`, without the need for manual processing by the user. As long as the outer layer is wrapped under the above two Widgets, the default comes with `onClick`, `onLongclick`, `onTouchDown`, `onTouchMove`, `onTouchEnd` and a series of gesture events

# More features

## Handling component method calls

In some scenarios, JS needs to call some methods of the component, such as `changeText` of `QrView`. At this time, you need to overload the `dispatchFunction` method in `QrController` to handle JS method calls. Corresponding Front-End call documentation [hippy-react/customize](hippy-react/customize)

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
        // It should be noted that if the interface update is involved when the event is called, the update method of the viewModel needs to be called to trigger the update. If it is a focus similar to the input and does not involve UI update, it is not required.
        viewModel.update();
      }
      break;
  }
}
```

## Event callback

Voltron SDK provides the `context.bridgeManager.sendComponentEvent(rootId, id, eventName, params);` method, which encapsulates the logic of UI event sending. You can find the `RenderContext` call anywhere to send the event to the corresponding JS component. For example, I want to send events to the Front-End controls during `build` of `QrView`.
An example is as follows:

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
