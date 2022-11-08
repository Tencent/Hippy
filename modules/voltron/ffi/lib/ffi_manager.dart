import 'dart:ffi';
import 'dart:isolate';

import 'package:ffi/ffi.dart';

import 'define.dart';
import 'ffi_util.dart';
import 'global_callback.dart';

enum _DefaultRegisterFuncType { globalCallback }

class FfiManager {
  static const String _kDefaultRegisterHeader = 'default';
  final _interactiveCppRequests = ReceivePort()..listen(requestExecuteCallback);

  static final FfiManager _instance = FfiManager._internal();

  factory FfiManager() => _instance;

  static FfiManager get instance => _instance;

  late InitFfiDartType _initFfi;
  late AddCallFuncRegisterDartType _addRegisterCallFuncEx;
  late ExecuteCallbackDartType _executeCallback;

  DynamicLibrary get library => _library;

  String get registerFuncName => 'AddCallFunc';

  final DynamicLibrary _library = loadLibrary('voltron_core', isStatic: false);

  FfiManager._internal() {
    _initFfi = _library.lookupFunction<
        InitFfiNativeType, InitFfiDartType>('InitFfi');
    _addRegisterCallFuncEx = _library.lookupFunction<
        AddCallFuncRegisterNativeType,
        AddCallFuncRegisterDartType>('AddCallFuncRegister');
    _executeCallback = _library.lookupFunction<ExecuteCallbackNativeType,
        ExecuteCallbackDartType>('VoltronExecuteCallback');

    // 先注册回调的post指针和port端口号
    final nativePort = _interactiveCppRequests.sendPort.nativePort;
    _initFfi(NativeApi.postCObject, nativePort);

    _registerCallbackFunc();
  }

  void _registerCallbackFunc() {
    var globalCallbackFunc =
        Pointer.fromFunction<GlobalCallback>(globalCallback);
    var registerFunc = _library.lookupFunction<
        AddCallFuncNativeType<GlobalCallback>,
        AddCallFuncDartType<GlobalCallback>>(registerFuncName);
    addRegisterFunc(
        _kDefaultRegisterHeader,
        _DefaultRegisterFuncType.globalCallback.index,
        globalCallbackFunc,
        registerFunc);
  }

  void addRegisterFunc<T extends Function>(String registerHeader, int type,
      Pointer<NativeFunction<T>> func, AddCallFuncDartType<T> registerFunc) {
    var registerHeaderPointer = registerHeader.toNativeUtf16();
    registerFunc(registerHeaderPointer, type, func);
    free(registerHeaderPointer);
  }

  void addFuncExRegister(String registerHeader, String funcName) {
    var registerFunc = FfiManager().library.lookup<NativeFunction<CallFuncRegister>>(funcName);
    var registerHeaderPointer = registerHeader.toNativeUtf16();
    _addRegisterCallFuncEx(
        registerHeaderPointer, registerFunc);
    free(registerHeaderPointer);
  }
}

// 提供全局listen port，从c ffi侧传入work方法指针后，直接调用executeCallback执行
void requestExecuteCallback(dynamic message) {
  final int workAddress = message;
  final work = Pointer<Work>.fromAddress(workAddress);
  FfiManager.instance._executeCallback(work);
}
