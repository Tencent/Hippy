//
// Tencent is pleased to support the open source community by making
// Hippy available.
//
// Copyright (C) 2019 THL A29 Limited, a Tencent company.
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
    Int32 engineId,
    Int32 callbackId);
typedef InitJsFrameworkFfiDartType = int Function(
    Pointer<Utf16> globalConfig,
    int singleThreadMode,
    int bridgeParamJson,
    int isDevModule,
    int groupId,
    int engineId,
    int callbackId);

typedef CreateInstanceFfiNativeType = Int64 Function(
    Int32 engineId,
    Int32 rootId,
    Double width,
    Double height,
    Pointer<Utf16> action,
    Pointer<Uint8> params,
    Int32 paramsLength,
    Int32 callbackId);
typedef CreateInstanceFfiDartType = int Function(
    int engineId,
    int rootId,
    double width,
    double height,
    Pointer<Utf16> action,
    Pointer<Uint8> params,
    int paramsLength,
    int callbackId);

typedef DestroyInstanceFfiNativeType = Int64 Function(
    Int32 engineId,
    Int32 rootId,
    Pointer<Utf16> action,
    Int32 callbackId);
typedef DestroyInstanceFfiDartType = int Function(int engineId, int rootId,
    Pointer<Utf16> action, int callbackId);

typedef RunScriptFromFileFfiNativeType = Int32 Function(
    Int32 engineId,
    Pointer<Utf16> filePath,
    Pointer<Utf16> scriptName,
    Pointer<Utf16> codeCacheDir,
    Int32 canUseCodeCache,
    Int32 callbackId);
typedef RunScriptFromFileFfiDartType = int Function(
    int engineId,
    Pointer<Utf16> filePath,
    Pointer<Utf16> scriptName,
    Pointer<Utf16> codeCacheDir,
    int canUseCodeCache,
    int callbackId);

typedef RunScriptFromAssetsFfiNativeType = Int32 Function(
    Int32 engineId,
    Pointer<Utf16> assetName,
    Pointer<Utf16> codeCacheDir,
    Int32 canUseCodeCache,
    Pointer<Utf16> assetStr,
    Int32 callbackId);
typedef RunScriptFromAssetsFfiDartType = int Function(
    int engineId,
    Pointer<Utf16> assetName,
    Pointer<Utf16> codeCacheDir,
    int canUseCodeCache,
    Pointer<Utf16> assetStr,
    int callbackId);

typedef CallFunctionFfiNativeType = Void Function(Int32 engineId,
    Pointer<Utf16> action, Pointer<Uint8> params, Int32 paramsLen, Int32 callbackId);
typedef CallFunctionFfiDartType = void Function(
    int engineId, Pointer<Utf16> action, Pointer<Uint8> params, int paramsLen, int callbackId);

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

typedef GetCrashMessageFfiType = Pointer<Utf8> Function();

typedef DestroyFfiNativeType = Void Function(
    Int32 engineId, Int32 callbackId);
typedef DestroyFfiDartType = void Function(
    int engineId, int callbackId);

typedef RegisterCallbackFfiNativeType = Int32 Function(
    Int32 type, Pointer<NativeFunction<GlobalCallbackNativeType>> func);
typedef RegisterCallbackFfiDartType = int Function(
    int type, Pointer<NativeFunction<GlobalCallbackNativeType>> func);

typedef RegisterCallNativeFfiNativeType = Int32 Function(
    Int32 type, Pointer<NativeFunction<CallNativeFfiNativeType>> func);
typedef RegisterCallNativeFfiDartType = int Function(
    int type, Pointer<NativeFunction<CallNativeFfiNativeType>> func);

typedef RegisterReportJsonFfiNativeType = Int32 Function(
    Int32 type, Pointer<NativeFunction<ReportJsonExceptionNativeType>> func);
typedef RegisterReportJsonFfiDartType = int Function(
    int type, Pointer<NativeFunction<ReportJsonExceptionNativeType>> func);

typedef RegisterReportJsFfiNativeType = Int32 Function(
    Int32 type, Pointer<NativeFunction<ReportJsExceptionNativeType>> func);
typedef RegisterReportJsFfiDartType = int Function(
    int type, Pointer<NativeFunction<ReportJsExceptionNativeType>> func);

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

typedef CallNativeFfiNativeType = Void Function(
    Int32 engineId,
    Pointer<Utf16> moduleName,
    Pointer<Utf16> moduleFunc,
    Pointer<Utf16> callId,
    Pointer<Void> paramsData,
    Uint32 paramsLen,
    Int32 bridgeParamJson);

typedef PostCodeCacheRunnableNativeType = Void Function(Int32 engineId,
    Pointer<Utf8> codeCacheDirChar, Int64 runnableId, Int32 needClearException);

typedef ReportJsonExceptionNativeType = Void Function(
    Int32 engineId, Pointer<Utf8> jsonValue);

typedef ReportJsExceptionNativeType = Void Function(Int32 engineId,
    Pointer<Utf16> descriptionStream, Pointer<Utf16> stackStream);

typedef CheckCodeCacheSanityNativeType = Void Function(
    Int32 engineId, Int32 rootId, Pointer<Utf8> scriptMd5);

typedef SendResponseNativeType = Void Function(
    Int32 engineId, Pointer<Uint16> source, Int32 len);

typedef SendNotificationNativeType = Void Function(
    Int32 engineId, Pointer<Uint16> source, Int32 len);

typedef DestroyFunctionNativeType = Void Function(Int32 engineId);

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
