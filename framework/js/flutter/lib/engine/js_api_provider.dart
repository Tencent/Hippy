import 'package:voltron_renderer/voltron_renderer.dart';

import '../module.dart';
import 'js_engine_context.dart';

abstract class APIProvider {
  List<ModuleGenerator> get nativeModuleGeneratorList;

  List<JavaScriptModuleGenerator> get javaScriptModuleGeneratorList;

  List<ViewControllerGenerator> get controllerGeneratorList;
}

class ModuleGenerator {
  final String _name;
  final Generator<VoltronNativeModule, EngineContext> _generator;

  ModuleGenerator(this._name, this._generator);

  String get name => _name;

  VoltronNativeModule generateModule(EngineContext context) =>
      _generator(context);
}

class JavaScriptModuleGenerator {
  final String _name;
  final Generator<JavaScriptModule, EngineContext> _generator;

  JavaScriptModuleGenerator(this._name, this._generator);

  String get name => _name;

  JavaScriptModule generateJsModule(EngineContext context) =>
      _generator(context);
}

class CoreApi implements APIProvider {
  CoreApi();

  @override
  List<ViewControllerGenerator> get controllerGeneratorList => [
        ViewControllerGenerator(
            DivController.kClassName, (object) => DivController()),
        ViewControllerGenerator(
            TextController.kClassName, (object) => TextController()),
        ViewControllerGenerator(
            ListViewController.kClassName, (object) => ListViewController()),
        ViewControllerGenerator(ListItemViewController.kClassName,
            (object) => ListItemViewController()),
        ViewControllerGenerator(RefreshWrapperController.kClassName,
            (object) => RefreshWrapperController()),
        ViewControllerGenerator(RefreshItemController.kClassName,
            (object) => RefreshItemController()),
        ViewControllerGenerator(ScrollViewController.kClassName,
            (object) => ScrollViewController()),
        ViewControllerGenerator(
            ImageController.kClassName, (object) => ImageController()),
        ViewControllerGenerator(
            TextInputController.kClassName, (object) => TextInputController()),
        ViewControllerGenerator(
            ModalController.kClassName, (object) => ModalController()),
        ViewControllerGenerator(
            ViewPagerController.kClassName, (object) => ViewPagerController()),
        ViewControllerGenerator(ViewPagerItemController.kClassName,
            (object) => ViewPagerItemController()),
        ViewControllerGenerator(
            QrController.kClassName, (object) => QrController()),
      ];

  @override
  List<JavaScriptModuleGenerator> get javaScriptModuleGeneratorList => [
        JavaScriptModuleGenerator(
            EventDispatcher.kModuleName, (context) => EventDispatcher(context)),
        JavaScriptModuleGenerator(
            Dimensions.kModuleName, (context) => Dimensions(context)),
      ];

  @override
  List<ModuleGenerator> get nativeModuleGeneratorList => [
        ModuleGenerator(
            TimeModule.kTimerModuleName, (context) => TimeModule(context)),
        ModuleGenerator(ConsoleModule.kConsoleModuleName,
            (context) => ConsoleModule(context)),
        ModuleGenerator(ExceptionModule.kExceptionModuleName,
            (context) => ExceptionModule(context)),
        ModuleGenerator(DeviceEventModule.kDeviceModuleName,
            (context) => DeviceEventModule(context)),
        ModuleGenerator(NetworkModule.kNetworkModuleName,
            (context) => NetworkModule(context)),
        ModuleGenerator(StorageModule.kStorageModuleName,
            (context) => StorageModule(context)),
        ModuleGenerator(
            UtilsModule.kUtilsModuleName, (context) => UtilsModule(context)),
        ModuleGenerator(
            DialogModule.kDialogModuleName, (context) => DialogModule(context)),
        ModuleGenerator(WebsocketModule.kWebSocketModuleName,
            (context) => WebsocketModule(context)),
        ModuleGenerator(ClipboardModule.kClipboardModuleName,
            (context) => ClipboardModule(context))
      ];
}
