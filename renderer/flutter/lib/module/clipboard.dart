import 'package:flutter/services.dart';

import '../engine.dart';
import '../util.dart';
import 'module.dart';
import 'promise.dart';

class ClipboardModule extends VoltronNativeModule {
  static const String kClipboardModuleName = "ClipboardModule";
  static const String kTag = 'ClipboardModule';

  static const String kGetStringMethodName = "getString";
  static const String kSetStringMethodName = "setString";

  ClipboardModule(EngineContext context) : super(context);

  @VoltronMethod(kGetStringMethodName)
  bool getString(JSPromise promise) {
    Clipboard.getData('text/plain').then((data) {
      promise.resolve(data?.text ?? '');
    }).catchError((err) {
      LogUtils.d(kTag, err.toString());
      promise.reject(err.toString());
    });
    return true;
  }

  @VoltronMethod(kSetStringMethodName)
  bool setString(String text, JSPromise promise) {
    Clipboard.setData(ClipboardData(text: text)).then((data) {
      promise.resolve(text);
    }).catchError((err) {
      LogUtils.d(kTag, err.toString());
      promise.reject(err.toString());
    });
    return true;
  }

  @override
  Map<String, Function> get extraFuncMap =>
      {kGetStringMethodName: getString, kSetStringMethodName: setString};

  @override
  String get moduleName => kClipboardModuleName;
}
