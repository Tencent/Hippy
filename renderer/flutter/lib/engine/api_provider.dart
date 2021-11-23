import '../module/clipboard.dart';
import '../module/console.dart';
import '../module/device_event.dart';
import '../module/dialog.dart';
import '../module/dimensions.dart';
import '../module/event_dispatcher.dart';
import '../module/exception.dart';
import '../module/module.dart';
import '../module/network.dart';
import '../module/storage.dart';
import '../module/time.dart';
import '../module/ui_manager.dart';
import '../module/utils.dart';
import '../module/websocket.dart';
import '../render/controller.dart';
import '../render/div.dart';
import '../render/image.dart';
import '../render/list.dart';
import '../render/list_item.dart';
import '../render/modal.dart';
import '../render/qr.dart';
import '../render/refresh.dart';
import '../render/refresh_item.dart';
import '../render/scroller.dart';
import '../render/text.dart';
import '../render/text_input.dart';
import '../render/view_pager.dart';
import 'engine_context.dart';

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

class ViewControllerGenerator {
  final String _name;
  final Generator<VoltronViewController, Object?> _generator;
  final bool _isLazy;

  ViewControllerGenerator(this._name, this._generator, [this._isLazy = false]);

  String get name => _name;

  VoltronViewController get generateController => _generator(null);

  bool get isLazy => _isLazy;
}

typedef Generator<T, V> = T Function(V params);

class CoreApi implements APIProvider {
  CoreApi();

  @override
  List<ViewControllerGenerator> get controllerGeneratorList => [
        ViewControllerGenerator(
            DivController.className, (object) => DivController()),
        ViewControllerGenerator(
            TextController.className, (object) => TextController()),
        ViewControllerGenerator(
            ListViewController.className, (object) => ListViewController()),
        ViewControllerGenerator(ListItemViewController.className,
            (object) => ListItemViewController()),
        ViewControllerGenerator(RefreshWrapperController.className,
            (object) => RefreshWrapperController()),
        ViewControllerGenerator(RefreshItemController.className,
            (object) => RefreshItemController()),
        ViewControllerGenerator(
            ScrollViewController.className, (object) => ScrollViewController()),
        ViewControllerGenerator(
            ImageController.className, (object) => ImageController()),
        ViewControllerGenerator(
            TextInputController.className, (object) => TextInputController()),
        ViewControllerGenerator(
            ModalController.className, (object) => ModalController()),
        ViewControllerGenerator(
            ViewPagerController.className, (object) => ViewPagerController()),
        ViewControllerGenerator(ViewPagerItemController.className,
            (object) => ViewPagerItemController()),
        ViewControllerGenerator(
            QrController.className, (object) => QrController()),
      ];

  @override
  List<JavaScriptModuleGenerator> get javaScriptModuleGeneratorList => [
        JavaScriptModuleGenerator(
            EventDispatcher.moduleName, (context) => EventDispatcher(context)),
        JavaScriptModuleGenerator(
            Dimensions.moduleName, (context) => Dimensions(context)),
      ];

  @override
  List<ModuleGenerator> get nativeModuleGeneratorList => [
        ModuleGenerator(
            TimeModule.timerModuleName, (context) => TimeModule(context)),
        ModuleGenerator(ConsoleModule.consoleModuleName,
            (context) => ConsoleModule(context)),
        ModuleGenerator(ExceptionModule.exceptionModuleName,
            (context) => ExceptionModule(context)),
        ModuleGenerator(UIManagerModule.uiModuleName,
            (context) => UIManagerModule(context)),
        ModuleGenerator(DeviceEventModule.deviceModuleName,
            (context) => DeviceEventModule(context)),
        ModuleGenerator(NetworkModule.networkModuleName,
            (context) => NetworkModule(context)),
        ModuleGenerator(StorageModule.storageModuleName,
            (context) => StorageModule(context)),
        ModuleGenerator(
            UtilsModule.utilsModuleName, (context) => UtilsModule(context)),
        ModuleGenerator(
            DialogModule.dialogModuleName, (context) => DialogModule(context)),
        ModuleGenerator(WebsocketModule.websocketModuleName,
            (context) => WebsocketModule(context)),
        ModuleGenerator(ClipboardModule.clipboardModuleName,
            (context) => ClipboardModule(context))
      ];
}
