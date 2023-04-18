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

class Work extends Opaque {}

typedef GlobalCallback = Void Function(
    Int32 callbackId, Pointer<Uint8> result, Int32 len);
typedef CommonCallback = void Function(
  dynamic value,
);

typedef ExecuteCallbackNativeType = Void Function(Pointer<Work>);
typedef ExecuteCallbackDartType = void Function(Pointer<Work>);

typedef InitFfiNativeType = Uint32 Function(
    Pointer<NativeFunction<Int8 Function(Int64, Pointer<Dart_CObject>)>>
        functionPointer,
    Int64 port);
typedef InitFfiDartType = int Function(
  Pointer<NativeFunction<Int8 Function(Int64, Pointer<Dart_CObject>)>>
      functionPointer,
  int port,
);

typedef AddCallFuncNativeType<T extends Function> = Int32 Function(
  Uint32 ffiId,
  Pointer<Utf16> registerHeader,
  Int32 type,
  Pointer<NativeFunction<T>> func,
);
typedef AddCallFuncDartType<T extends Function> = int Function(
  int ffiId,
  Pointer<Utf16> registerHeader,
  int type,
  Pointer<NativeFunction<T>> func,
);
