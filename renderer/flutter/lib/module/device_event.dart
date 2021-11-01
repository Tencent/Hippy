import '../engine/engine_context.dart';
import '../engine/voltron_engine.dart';
import '../util/enum_util.dart';
import 'event_dispatcher.dart';
import 'module.dart';
import 'promise.dart';

class DeviceEventModule extends VoltronNativeModule {
  static const String deviceModuleName = "DeviceEventModule";
  static const String deviceSetListenBackPress = "setListenBackPress";
  static const String deviceInvokeDefaultBackPressHandler =
      "invokeDefaultBackPressHandler";

  bool _isListening = false;
  BackPressHandler? _backPressHandler;

  DeviceEventModule(EngineContext context) : super(context);

  @override
  Map<String, Function> get extraFuncMap => {
        deviceSetListenBackPress: setListenBackPress,
        deviceInvokeDefaultBackPressHandler: invokeDefaultBackPressHandler
      };

  @override
  String get moduleName => deviceModuleName;

  bool onBackPressed(BackPressHandler handler) {
    if (_isListening) {
      _backPressHandler = handler;
      var dispatcher = context.moduleManager
          .getJavaScriptModule<EventDispatcher>(
              enumValueToString(JavaScriptModuleType.EventDispatcher));
      if (dispatcher != null) {
        dispatcher.receiveNativeEvent("hardwareBackPress", null);
        return true;
      } else {
        return false;
      }
    }
    return false;
  }

  // 前端JS告知SDK：我要监听back事件（如果没有告知，则SDK不用把back事件抛给前端，这样可以加快back的处理速度，毕竟大部分Voltron业务是无需监听back事件的）
  // @param listen 是否监听？
  @VoltronMethod(deviceSetListenBackPress)
  bool setListenBackPress(bool listen, Promise promise) {
    _isListening = listen;
    return false;
  }

  @VoltronMethod(deviceInvokeDefaultBackPressHandler)
  bool invokeDefaultBackPressHandler(Promise promise) {
    _doInvokeHandler();
    return false;
  }

  Future<dynamic> _doInvokeHandler() async {
    var backPressHandler = _backPressHandler;
    if (backPressHandler != null) {
      backPressHandler();
    }
  }

  void destroy() {
    super.destroy();
    _backPressHandler = null;
  }
}
