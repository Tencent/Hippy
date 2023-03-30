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

typedef CreateVoltronRenderNativeType = Uint32 Function();
typedef CreateVoltronRenderDartType = int Function();

typedef DestroyVoltronRenderNativeType = Void Function(
  Uint32 renderManagerId,
);
typedef DestroyVoltronRenderDartType = void Function(
  int renderManagerId,
);

typedef CallNativeFunctionFfiNativeType = Void Function(
    Int32 engineId,
    Uint32 renderManagerId,
    Pointer<Utf16> callId,
    Pointer<Uint8> params,
    Int32 paramsLen,
    Int32 keep);
typedef CallNativeFunctionFfiDartType = void Function(
    int engineId,
    int renderManagerId,
    Pointer<Utf16> callId,
    Pointer<Uint8> params,
    int paramsLen,
    int keep);

typedef CreateDomFfiNativeType = Uint32 Function();
typedef CreateDomFfiDartType = int Function();

typedef DestroyDomFfiNativeType = Void Function(
  Uint32 domId,
);
typedef DestroyDomFfiDartType = void Function(
  int domId,
);

typedef AddRootFfiNativeType = Void Function(
  Uint32 domId,
  Uint32 rootId,
);
typedef AddRootFfiDartType = void Function(
  int domId,
  int rootId,
);

typedef RemoveRootFfiNativeType = Void Function(
  Uint32 domId,
  Uint32 rootId,
);
typedef RemoveRootFfiDartType = void Function(
  int domId,
  int rootId,
);

typedef CallNativeEventFfiNativeType = Void Function(
  Uint32 renderManagerId,
  Uint32 rootId,
  Int32 nodeId,
  Pointer<Utf16> event,
  Bool useCapture,
  Bool useBubble,
  Pointer<Uint8> params,
  Int32 paramsLen,
);
typedef CallNativeEventFfiDartType = void Function(
  int renderManagerId,
  int rootId,
  int nodeId,
  Pointer<Utf16> event,
  bool useCapture,
  bool useBubble,
  Pointer<Uint8> params,
  int paramsLen,
);

typedef UpdateNodeSizeFfiNativeType = Void Function(
  Uint32 renderManagerId,
  Uint32 rootId,
  Int32 nodeId,
  Double width,
  Double height,
);
typedef UpdateNodeSizeFfiDartType = void Function(
  int renderManagerId,
  int rootId,
  int nodeId,
  double width,
  double height,
);

enum RenderFuncType {
  postRenderOp,
  calculateNodeLayout,
}

typedef PostRenderOpNativeType = Void Function(
  Int32 engindId,
  Uint32 rootId,
  Pointer<Void> paramsData,
  Int64 paramsLen,
);

typedef LoggerFunctionNativeType = Void Function(
  Int32 level,
  Pointer<Utf8> print,
);

typedef CalculateNodeLayoutNativeType = Pointer<Int64> Function(
  Int32 engindId,
  Uint32 rootId,
  Int32 nodeId,
  Double width,
  Int32 widthMode,
  Double height,
  Int32 heightMode,
);
