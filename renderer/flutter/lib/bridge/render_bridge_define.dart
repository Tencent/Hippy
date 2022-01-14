import 'dart:ffi';

import 'package:ffi/ffi.dart';

class Work extends Opaque {}

typedef GlobalCallback = Void Function(Int32 callbackId, Int64 value);
typedef CommonCallback = void Function(int value);

typedef CallNativeFunctionFfiNativeType = Void Function(Int32 engineId, Int32 rootId,
    Pointer<Utf16> callId, Pointer<Uint8> params, Int32 paramsLen, Int32 keep);
typedef CallNativeFunctionFfiDartType = void Function(int engineId, int rootId,
    Pointer<Utf16> callId, Pointer<Uint8> params, int paramsLen, int keep);

typedef CallNativeEventFfiNativeType = Void Function(
    Int32 engineId,
    Int32 rootId,
    Int32 nodeId,
    Pointer<Utf16> event,
    Pointer<Uint8> params,
    Int32 paramsLen);
typedef CallNativeEventFfiDartType = void Function(int engineId, int rootId,
    int nodeId, Pointer<Utf16> event, Pointer<Uint8> params, int paramsLen);

typedef UpdateNodeSizeFfiNativeType = Void Function(
    Int32 engineId, Int32 rootId, Int32 nodeId, Double width, Double height);
typedef UpdateNodeSizeFfiDartType = void Function(
    int engineId, int rootId, int nodeId, double width, double height);

typedef NotifyDomNativeType = Void Function(Int32 engineId);
typedef NotifyDomDartType = void Function(int engineId);

typedef RegisterCallbackFfiNativeType = Int32 Function(
    Int32 type, Pointer<NativeFunction<GlobalCallbackNativeType>> func);
typedef RegisterCallbackFfiDartType = int Function(
    int type, Pointer<NativeFunction<GlobalCallbackNativeType>> func);

typedef RegisterPostRenderOpFfiNativeType = Int32 Function(
    Int32 type, Pointer<NativeFunction<PostRenderOpNativeType>> func);
typedef RegisterPostRenderOpFfiDartType = int Function(
    int type, Pointer<NativeFunction<PostRenderOpNativeType>> func);

typedef RegisterCalculateNodeLayoutFfiNativeType = Int32 Function(
    Int32 type, Pointer<NativeFunction<CalculateNodeLayoutNativeType>> func);
typedef RegisterCalculateNodeLayoutFfiDartType = int Function(
    int type, Pointer<NativeFunction<CalculateNodeLayoutNativeType>> func);

typedef RegisterDartPostCObjectNativeType = Void Function(
    Pointer<NativeFunction<Int8 Function(Int64, Pointer<Dart_CObject>)>>
        functionPointer,
    Int64 port);
typedef RegisterDartPostCObjectDartType = void Function(
    Pointer<NativeFunction<Int8 Function(Int64, Pointer<Dart_CObject>)>>
        functionPointer,
    int port);

typedef ExecuteCallbackNativeType = Void Function(Pointer<Work>);
typedef ExecuteCallbackDartType = void Function(Pointer<Work>);

enum FuncType {
  callNative,
  reportJsonException,
  reportJsException,
  sendResponse,
  sendNotification,
  destroy,
  globalCallback,
  postRenderOp,
  calculateNodeLayout,
}

typedef PostRenderOpNativeType = Void Function(
    Int32 engineId, Int32 rootId, Pointer<Void> paramsData, Int64 paramsLen);

typedef LoggerFunctionNativeType = Void Function(
    Int32 level, Pointer<Utf8> print);

typedef CalculateNodeLayoutNativeType = Pointer<Int64> Function(
    Int32 engineId,
    Int32 rootId,
    Int32 nodeId,
    Double width,
    Int32 widthMode,
    Double height,
    Int32 heightMode);

typedef GlobalCallbackNativeType = Void Function(Int32 callbackId, Int64 value);
