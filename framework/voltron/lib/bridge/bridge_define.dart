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

import 'package:ffi/ffi.dart';

enum LoaderFuncType {
  callNative,
  reportJsonException,
  reportJsException,
}

typedef InitBridgeFfiNativeType = Void Function();
typedef InitBridgeFfiDartType = void Function();

typedef InitJsFrameworkFfiNativeType = Int64 Function(
  Pointer<Utf16> globalConfig,
  Int32 singleThreadMode,
  Int32 bridgeParamJson,
  Int32 isDevModule,
  Int64 groupId,
  Uint32 workManagerId,
  Uint32 domManagerId,
  Int32 engineId,
  Int32 callbackId,
  Uint32 devtoolsId,
);
typedef InitJsFrameworkFfiDartType = int Function(
  Pointer<Utf16> globalConfig,
  int singleThreadMode,
  int bridgeParamJson,
  int isDevModule,
  int groupId,
  int workManagerId,
  int domManagerId,
  int engineId,
  int callbackId,
  int devtoolsId,
);

typedef RunScriptFromUriFfiNativeType = Int32 Function(
  Int32 engineId,
  Uint32 vfsId,
  Pointer<Utf16> uri,
  Pointer<Utf16> codeCacheDir,
  Int32 canUseCodeCache,
  Int32 isLocalFile,
  Int32 callbackId,
);
typedef RunScriptFromUriFfiDartType = int Function(
  int engineId,
  int vfsId,
  Pointer<Utf16> uri,
  Pointer<Utf16> codeCacheDir,
  int canUseCodeCache,
  int isLocalFile,
  int callbackId,
);

typedef LoadInstanceFfiNativeType = Int64 Function(
  Int32 engineId,
  Pointer<Uint8> params,
  Int32 paramsLength,
);

typedef LoadInstanceFfiDartType = int Function(
  int engineId,
  Pointer<Uint8> params,
  int paramsLength,
);

typedef UnloadInstanceFfiNativeType = Int64 Function(
  Int32 engineId,
  Pointer<Uint8> params,
  Int32 paramsLength,
);
typedef UnloadInstanceFfiDartType = int Function(
  int engineId,
  Pointer<Uint8> params,
  int paramsLength,
);

enum NetworkEventType { requestWillBeSent, responseReceived, loadingFinished }

typedef NotifyNetworkEventFfiNativeType = Void Function(
  Int32 engineId,
  Pointer<Utf16> requestId,
  Int32 eventType,
  Pointer<Utf16> response,
  Pointer<Utf16> extra,
);
typedef NotifyNetworkEventFfiDartType = void Function(
  int engineId,
  Pointer<Utf16> requestId,
  int eventType,
  Pointer<Utf16> response,
  Pointer<Utf16> extra,
);

typedef CallFunctionFfiNativeType = Void Function(
  Int32 engineId,
  Pointer<Utf16> action,
  Pointer<Uint8> params,
  Int32 paramsLen,
  Int32 callbackId,
);
typedef CallFunctionFfiDartType = void Function(
  int engineId,
  Pointer<Utf16> action,
  Pointer<Uint8> params,
  int paramsLen,
  int callbackId,
);

typedef CallNativeFunctionFfiNativeType = Void Function(
  Int32 engineId,
  Int32 rootId,
  Pointer<Utf16> callId,
  Pointer<Uint8> params,
  Int32 paramsLen,
  Int32 keep,
);
typedef CallNativeFunctionFfiDartType = void Function(
  int engineId,
  int rootId,
  Pointer<Utf16> callId,
  Pointer<Uint8> params,
  int paramsLen,
  int keep,
);

typedef CallNativeEventFfiNativeType = Void Function(
  Int32 engineId,
  Int32 rootId,
  Int32 nodeId,
  Pointer<Utf16> event,
  Pointer<Uint8> params,
  Int32 paramsLen,
);
typedef CallNativeEventFfiDartType = void Function(
  int engineId,
  int rootId,
  int nodeId,
  Pointer<Utf16> event,
  Pointer<Uint8> params,
  int paramsLen,
);

typedef OnNetworkRequestInvokeNativeType = Void Function(
  Int32 engineId,
  Pointer<Utf16> requestId,
  Pointer<Uint8> reqMeta,
  Int32 length,
);
typedef OnNetworkRequestInvokeDartType = void Function(
  int engineId,
  Pointer<Utf16> requestId,
  Pointer<Uint8> reqMeta,
  int length,
);

typedef OnNetworkResponseInvokeNativeType = Void Function(
  Int32 engineId,
  Pointer<Utf16> requestId,
  Pointer<Uint8> reqMeta,
  Int32 length,
);
typedef OnNetworkResponseInvokeDartType = void Function(
  int engineId,
  Pointer<Utf16> requestId,
  Pointer<Uint8> rsqMeta,
  int length,
);

typedef GetCrashMessageFfiType = Pointer<Utf8> Function();

typedef BindDomAndRenderNativeType = Void Function(
  Uint32 domId,
  Int32 engineId,
  Uint32 renderId,
);
typedef BindDomAndRenderDartType = void Function(
  int domId,
  int engineId,
  int renderId,
);

typedef ConnectRootViewAndRuntimeNativeType = Void Function(
  Int32 engindId,
  Uint32 rootId,
);
typedef ConnectRootViewAndRuntimeDartType = void Function(
  int engindId,
  int rootId,
);

typedef DestroyFfiNativeType = Void Function(
  Int32 engineId,
  Int32 callbackId,
  Int32 isReload,
);
typedef DestroyFfiDartType = void Function(
  int engineId,
  int callbackId,
  int isReload,
);

typedef CallNativeFfi = Void Function(
  Int32 engineId,
  Pointer<Utf16> moduleName,
  Pointer<Utf16> moduleFunc,
  Pointer<Utf16> callId,
  Pointer<Void> paramsData,
  Uint32 paramsLen,
  Int32 bridgeParamJson,
);

typedef ReportJsonException = Void Function(
  Int32 engineId,
  Pointer<Utf8> jsonValue,
);

typedef ReportJsException = Void Function(
  Int32 engineId,
  Pointer<Utf16> descriptionStream,
  Pointer<Utf16> stackStream,
);

typedef CreateDevtoolsDartType = int Function(
  Pointer<Utf16> dataDir,
  Pointer<Utf16> wsUrl,
);

typedef CreateDevtoolsFfiNativeType = Uint32 Function(
  Pointer<Utf16> dataDir,
  Pointer<Utf16> wsUrl,
);

typedef DestroyDevtoolsDartType = void Function(
  int devtoolsId,
  int isReload,
);

typedef DestroyDevtoolsFfiNativeType = Void Function(
  Uint32 devtoolsId,
  Int32 isReload,
);

typedef GetVoltronEngineIndexFfiNativeType = Uint32 Function();

typedef GetVoltronEngineIndexFfiDartType = int Function();
