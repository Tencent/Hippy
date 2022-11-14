import 'dart:ffi';

import 'package:ffi/ffi.dart';

typedef CreateVfsWrapperNativeType = Uint32 Function(Uint32 workerManagerId);
typedef CreateVfsWrapperDartType = int Function(int workManagerId);

typedef DestroyVfsWrapperNativeType = Void Function(Uint32 id);
typedef DestroyVfsWrapperDartType = void Function(int id);

typedef OnDartInvokeNativeType = Void Function(
    Uint32 id, Pointer<Uint8> params, Int32 paramsLen, Int32 callbackId);
typedef OnDartInvokeDartType = void Function(
    int id, Pointer<Uint8> params, int paramsLen, int callbackId);

typedef OnInvokeDartCallbackNativeType = Void Function(
    Uint32 id, Uint32 reqestId, Pointer<Uint8> params, Int32 paramsLen);
typedef OnInvokeDartCallbackDartType = void Function(
    int id, int reqestId, Pointer<Uint8> params, int paramsLen);

typedef InvokeDartNativeType = Void Function(Int32 id, Int32 requestId,
    Pointer<Utf16> url, Pointer<Uint8> reqMeta, Int32 reqMetaLen);
