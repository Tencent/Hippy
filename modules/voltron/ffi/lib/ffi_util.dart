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
import 'dart:io';

import 'package:ffi/ffi.dart';
import 'package:flutter/services.dart';

import 'pair.dart';

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

Pair<Pointer<Uint8>, int>? encodeObject(Object? object) {
  var encodeByteData = const StandardMessageCodec().encodeMessage(object);
  if (encodeByteData != null) {
    var length = encodeByteData.lengthInBytes;
    final result = malloc<Uint8>(length);
    final nativeParams = result.asTypedList(length);
    nativeParams.setRange(0, length, encodeByteData.buffer.asUint8List());
    return Pair(result, nativeParams.length);
  }
  return null;
}

Object? decodeObject(Pointer<Uint8> buffer, int length) {
  var dataList = buffer.cast<Uint8>().asTypedList(length);
  if (dataList.isNotEmpty) {
    return const StandardMessageCodec()
        .decodeMessage(dataList.buffer.asByteData());
  }
  return null;
}

extension ObjEx on Object {
  T? safeAs<T>() {
    if (this is T) {
      return this as T;
    } else {
      return null;
    }
  }

  Map<T, V>? safeAsMap<T, V>() {
    if (this is Map) {
      var origin = this as Map;
      if (origin.isEmpty) {
        return <T, V>{};
      }
      var realMap = <T, V>{};

      origin.forEach((key, value) {
        if (key is T && value is V) {
          realMap[key] = value;
        }
      });
      return realMap;
    } else {
      return null;
    }
  }
}

extension MapEx on Map {
  T? safeGet<T>(dynamic key) {
    var value = this[key];
    if (value is T) {
      return value;
    } else {
      return null;
    }
  }

  Map<T, V>? safeGetMap<T, V>(dynamic key) {
    var value = this[key];
    if (value is Map) {
      if (value.isEmpty) {
        return <T, V>{};
      }
      var realMap = <T, V>{};

      value.forEach((key, value) {
        if (key is T && value is V) {
          realMap[key] = value;
        }
      });
      return realMap;
    } else {
      return null;
    }
  }

  List<T>? safeGetList<T>(dynamic key) {
    var value = this[key];
    if (value is List) {
      if (value.isEmpty) {
        return List<T>.empty(growable: true);
      }
      return value
          .whereType<T>()
          .map((e) => e)
          .toList(growable: true);
    } else {
      return null;
    }
  }

}
