//
// Tencent is pleased to support the open source community by making
// Hippy available.
//
// Copyright (C) 2022 THL A29 Limited, a Tencent company.
// All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import 'dart:ffi';
import 'dart:isolate';

import 'package:ffi/ffi.dart';

import 'define.dart';
import 'ffi_util.dart';
import 'global_callback.dart';

enum _DefaultRegisterFuncType { globalCallback }

class FfiManager {
  static String libPath = '';
  static String libraryName = 'voltron_core';
  static const String _kDefaultRegisterHeader = 'default';
  final _interactiveCppRequests = ReceivePort()..listen(requestExecuteCallback);

  static final FfiManager _instance = FfiManager._internal();

  factory FfiManager() => _instance;

  static FfiManager get instance => _instance;

  late InitFfiDartType _initFfi;
  late ExecuteCallbackDartType _executeCallback;
  late int _id;

  int get id => _id;

  DynamicLibrary get library => _library;

  String get registerFuncName => 'AddCallFunc';

  final DynamicLibrary _library = loadLibrary(libraryName, isStatic: false, path: libPath);

  FfiManager._internal() {
    _initFfi = _library.lookupFunction<
        InitFfiNativeType, InitFfiDartType>('InitFfi');
    _executeCallback = _library.lookupFunction<ExecuteCallbackNativeType,
        ExecuteCallbackDartType>('VoltronExecuteCallback');

    // 先注册回调的post指针和port端口号
    final nativePort = _interactiveCppRequests.sendPort.nativePort;
    _id = _initFfi(NativeApi.postCObject, nativePort);

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
    registerFunc(_id, registerHeaderPointer, type, func);
    free(registerHeaderPointer);
  }
}

// 提供全局listen port，从c ffi侧传入work方法指针后，直接调用executeCallback执行
void requestExecuteCallback(dynamic message) {
  final int workAddress = message;
  final work = Pointer<Work>.fromAddress(workAddress);
  FfiManager.instance._executeCallback(work);
}
