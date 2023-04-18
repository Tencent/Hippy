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

typedef CreateVfsWrapperNativeType = Uint32 Function(Uint32 ffiId);
typedef CreateVfsWrapperDartType = int Function(int ffiId);

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
