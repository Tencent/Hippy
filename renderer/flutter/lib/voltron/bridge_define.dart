import 'dart:ffi';

import 'package:ffi/ffi.dart';

class Work extends Opaque {}

typedef GlobalCallback = Void Function(Int32 callbackId, Int64 value);
typedef CommonCallback = void Function(int value);

typedef InitJsFrameworkFfiNativeType = Int64 Function(
    Pointer<Utf16> globalConfig,
    Int32 singleThreadMode,
    Int32 bridgeParamJson,
    Int32 isDevModule,
    Int64 groupId,
    Int32 rootId,
    Int32 callbackId);
typedef InitJsFrameworkFfiDartType = int Function(
    Pointer<Utf16> globalConfig,
    int singleThreadMode,
    int bridgeParamJson,
    int isDevModule,
    int groupId,
    int rootId,
    int callbackId);

typedef RunScriptFromFileFfiNativeType = Int32 Function(
    Int32 rootId,
    Pointer<Utf16> filePath,
    Pointer<Utf16> scriptName,
    Pointer<Utf16> codeCacheDir,
    Int32 canUseCodeCache,
    Int32 callbackId);
typedef RunScriptFromFileFfiDartType = int Function(
    int rootId,
    Pointer<Utf16> filePath,
    Pointer<Utf16> scriptName,
    Pointer<Utf16> codeCacheDir,
    int canUseCodeCache,
    int callbackId);

typedef RunScriptFromAssetsFfiNativeType = Int32 Function(
    Int32 rootId,
    Pointer<Utf16> assetName,
    Pointer<Utf16> codeCacheDir,
    Int32 canUseCodeCache,
    Pointer<Utf16> assetStr,
    Int32 callbackId);
typedef RunScriptFromAssetsFfiDartType = int Function(
    int rootId,
    Pointer<Utf16> assetName,
    Pointer<Utf16> codeCacheDir,
    int canUseCodeCache,
    Pointer<Utf16> assetStr,
    int callbackId);

typedef CallFunctionFfiNativeType = Void Function(Int32 rootId,
    Pointer<Utf16> action, Pointer<Utf16> params, Int32 callbackId);
typedef CallFunctionFfiDartType = void Function(int rootId,
    Pointer<Utf16> action, Pointer<Utf16> params, int callbackId);

typedef RunNativeRunnableFfiNativeType = Void Function(Int32 rootId,
    Pointer<Utf16> codeCachePath, Int64 runnableId, Int32 callbackId);
typedef RunNativeRunnableFfiDartType = void Function(int rootId,
    Pointer<Utf16> codeCachePath, int runnableId, int callbackId);

typedef GetCrashMessageFfiType = Pointer<Utf8> Function();

typedef DestroyFfiNativeType = Void Function(
    Int32 rootId, Int32 singleThreadMode, Int32 callbackId);
typedef DestroyFfiDartType = void Function(
    int rootId, int singleThreadMode, int callbackId);

typedef RegisterCallbackFfiNativeType = Int32 Function(
    Int32 type, Pointer<NativeFunction<GlobalCallbackNativeType>> func);
typedef RegisterCallbackFfiDartType = int Function(
    int type, Pointer<NativeFunction<GlobalCallbackNativeType>> func);

typedef RegisterCallNativeFfiNativeType = Int32 Function(
    Int32 type, Pointer<NativeFunction<CallNativeFfiNativeType>> func);
typedef RegisterCallNativeFfiDartType = int Function(
    int type, Pointer<NativeFunction<CallNativeFfiNativeType>> func);

typedef RegisterPostCodeCacheFfiNativeType = Int32 Function(
    Int32 type, Pointer<NativeFunction<PostCodeCacheRunnableNativeType>> func);
typedef RegisterPostCodeCacheFfiDartType = int Function(
    int type, Pointer<NativeFunction<PostCodeCacheRunnableNativeType>> func);

typedef RegisterReportJsonFfiNativeType = Int32 Function(
    Int32 type, Pointer<NativeFunction<ReportJsonExceptionNativeType>> func);
typedef RegisterReportJsonFfiDartType = int Function(
    int type, Pointer<NativeFunction<ReportJsonExceptionNativeType>> func);

typedef RegisterReportJsFfiNativeType = Int32 Function(
    Int32 type, Pointer<NativeFunction<ReportJsExceptionNativeType>> func);
typedef RegisterReportJsFfiDartType = int Function(
    int type, Pointer<NativeFunction<ReportJsExceptionNativeType>> func);

typedef RegisterCheckCodeCacheFfiNativeType = Int32 Function(
    Int32 type, Pointer<NativeFunction<CheckCodeCacheSanityNativeType>> func);
typedef RegisterCheckCodeCacheFfiDartType = int Function(
    int type, Pointer<NativeFunction<CheckCodeCacheSanityNativeType>> func);

typedef RegisterSendResponseFfiNativeType = Int32 Function(
    Int32 type, Pointer<NativeFunction<SendResponseNativeType>> func);
typedef RegisterSendResponseFfiDartType = int Function(
    int type, Pointer<NativeFunction<SendResponseNativeType>> func);

typedef RegisterSendNotificationFfiNativeType = Int32 Function(
    Int32 type, Pointer<NativeFunction<SendNotificationNativeType>> func);
typedef RegisterSendNotificationFfiDartType = int Function(
    int type, Pointer<NativeFunction<SendNotificationNativeType>> func);

typedef RegisterDestroyFfiNativeType = Int32 Function(
    Int32 type, Pointer<NativeFunction<DestroyFunctionNativeType>> func);
typedef RegisterDestroyFfiDartType = int Function(
    int type, Pointer<NativeFunction<DestroyFunctionNativeType>> func);

typedef RegisterPostRenderOpFfiNativeType = Int32 Function(
    Int32 type, Pointer<NativeFunction<PostRenderOpNativeType>> func);
typedef RegisterPostRenderOpFfiDartType = int Function(
    int type, Pointer<NativeFunction<PostRenderOpNativeType>> func);

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
  postCodeCacheRunnable,
  reportJsonException,
  reportJsException,
  checkCodeCacheSanity,
  sendResponse,
  sendNotification,
  destroy,
  globalCallback,
  postRenderOp,
}

typedef CallNativeFfiNativeType = Void Function(
    Int32 rootId,
    Pointer<Utf16> moduleName,
    Pointer<Utf16> moduleFunc,
    Pointer<Utf16> callId,
    Pointer<Void> paramsData,
    Uint32 paramsLen,
    Int32 bridgeParamJson);

typedef PostCodeCacheRunnableNativeType = Void Function(Int32 rootId,
    Pointer<Utf8> codeCacheDirChar, Int64 runnableId, Int32 needClearException);

typedef ReportJsonExceptionNativeType = Void Function(
    Int64 runtimeId, Pointer<Utf8> jsonValue);

typedef ReportJsExceptionNativeType = Void Function(Int32 rootId,
    Pointer<Utf16> descriptionStream, Pointer<Utf16> stackStream);

typedef CheckCodeCacheSanityNativeType = Void Function(
    Int32 rootId, Pointer<Utf8> scriptMd5);

typedef SendResponseNativeType = Void Function(
    Int32 rootId, Pointer<Uint16> source, Int32 len);

typedef SendNotificationNativeType = Void Function(
    Int32 rootId, Pointer<Uint16> source, Int32 len);

typedef DestroyFunctionNativeType = Void Function(Int32 rootId);

typedef PostRenderOpNativeType = Void Function(
    Int32 rootId, Pointer<Void> paramsData, Int64 paramsLen);

typedef LoggerFunctionNativeType = Void Function(
    Int32 level, Pointer<Utf8> print);

typedef GlobalCallbackNativeType = Void Function(Int32 callbackId, Int64 value);
