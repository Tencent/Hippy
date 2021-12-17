import 'package:flutter/services.dart';
import '../engine/engine_context.dart';
import '../util/log_util.dart';
import 'module.dart';
import 'promise.dart';

class ClipboardModule extends VoltronNativeModule {
  static const String clipboardModuleName = "ClipboardModule";
  static const String tag = 'ClipboardModule';

  static const String getStringMethodName = "getString";
  static const String setStringMethodName = "setString";

  ClipboardModule(EngineContext context) : super(context);

  @VoltronMethod(getStringMethodName)
  bool getString(JSPromise promise) {
    Clipboard.getData('text/plain').then((data) {
      promise.resolve(data?.text ?? '');
    }).catchError((err) {
      LogUtils.d(tag, err.toString());
      promise.reject(err.toString());
    });
    return true;
  }

  @VoltronMethod(setStringMethodName)
  bool setString(String text, JSPromise promise) {
    Clipboard.setData(ClipboardData(text: text)).then((data) {
      promise.resolve(text);
    }).catchError((err) {
      LogUtils.d(tag, err.toString());
      promise.reject(err.toString());
    });
    return true;
  }

  @override
  Map<String, Function> get extraFuncMap =>
      {getStringMethodName: getString, setStringMethodName: setString};

  @override
  String get moduleName => clipboardModuleName;
}
