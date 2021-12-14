import 'dart:ffi';
import 'dart:io';

import 'package:ffi/ffi.dart';

String _platformPath(String name, {String? path}) {
  if (path == null) path = "";
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
