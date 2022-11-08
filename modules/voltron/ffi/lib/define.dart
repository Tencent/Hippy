import 'dart:ffi';

import 'package:ffi/ffi.dart';

class Work extends Opaque {}

typedef GlobalCallback = Void Function(
    Int32 callbackId, Pointer<Uint8> result, Int32 len);
typedef CommonCallback = void Function(
  dynamic value,
);
typedef CallFuncRegister = Int32 Function(
    Int32 type, Pointer<Void> func);

typedef ExecuteCallbackNativeType = Void Function(Pointer<Work>);
typedef ExecuteCallbackDartType = void Function(Pointer<Work>);

typedef InitFfiNativeType = Int32 Function(
    Pointer<NativeFunction<Int8 Function(Int64, Pointer<Dart_CObject>)>>
        functionPointer,
    Int64 port);
typedef InitFfiDartType = int Function(
  Pointer<NativeFunction<Int8 Function(Int64, Pointer<Dart_CObject>)>>
      functionPointer,
  int port,
);

typedef AddCallFuncNativeType<T extends Function> = Int32 Function(
  Pointer<Utf16> registerHeader,
  Int32 type,
  Pointer<NativeFunction<T>> func,
);
typedef AddCallFuncDartType<T extends Function> = int Function(
  Pointer<Utf16> registerHeader,
  int type,
  Pointer<NativeFunction<T>> func,
);

typedef AddCallFuncRegisterNativeType = Int32 Function(
    Pointer<Utf16> registerHeader,
    Pointer<NativeFunction<CallFuncRegister>>);
typedef AddCallFuncRegisterDartType = int Function(
    Pointer<Utf16> registerHeader,
    Pointer<NativeFunction<CallFuncRegister>>);
