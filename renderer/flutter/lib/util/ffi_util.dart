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
import 'dart:io';

import 'package:ffi/ffi.dart';

String _platformPath(String name, {String? path}) {
  path ??= "";
  if (Platform.isLinux || Platform.isAndroid) {
    return "${path}lib$name.so";
  }
  if (Platform.isMacOS) return "$path$name.framework/$name";
  if (Platform.isWindows) return "$path$name.dll";
  if (Platform.isIOS) return "$path$name.framework/$name";
  throw Exception("Platform not implemented");
}

DynamicLibrary loadLibrary(String name, {String? path, bool isStatic = false}) {
  if (isStatic) {
    return DynamicLibrary.executable();
  } else {
    var fullPath = _platformPath(name, path: path);
    return DynamicLibrary.open(fullPath);
  }
}

Pointer<T> allocate<T extends NativeType>(int byteCount) {
  return malloc.allocate(byteCount);
}

void free(Pointer pointer) {
  malloc.free(pointer);
}
