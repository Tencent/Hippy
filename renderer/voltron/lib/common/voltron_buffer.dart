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

import 'dart:convert';
import 'dart:typed_data';

import '../util.dart';
import 'lru_cache.dart';
import 'voltron_array.dart';
import 'voltron_map.dart';

class VoltronBuffer {
  static const int kTypeNull = 0x00;

  static const int kTypeString = 0x01;

  static const int kTypeBoolTrue = 0x02;

  static const int kTypeBoolFalse = 0x03;

  static const int kTypeInt = 0x04;

  static const int kTypeDouble = 0x05;

  static const int kTypeArray = 0x06;

  static const int kTypeMap = 0x07;

  static const int kTypeOneByteString = 0x08;

  static const int kTypeUnknown = 0xFF;

  static final Object kValueUndefined = Object();

  static const String kImgUrlPropName = "uri";
  static const String kImgSrcPropName = "src";

  static final List<int> kBase64ImgHeader = "data:image".codeUnits;

  final LruCache<int, CacheItem> imgStringCache = LruCache(32);

  Object? parse(ByteData? byteData) {
    if (byteData != null) {
      return _Parser(byteData, this)._parse();
    }

    return null;
  }

  ByteData? build(Object? object) {
    if (object == null) {
      return null;
    }

    ByteData? resultData;
    try {
      var _builder = _Builder(object);
      resultData = _builder._build();
      _builder.release();
    } catch (e) {
      resultData = null;
      LogUtils.e("Voltron_buffer", "error building buffer $e");
    }

    return resultData;
  }

  void release() {
    imgStringCache.evictAll();
  }
}

class _Parser {
  int _position = 0;
  final ByteData _byteData;
  final VoltronBuffer _buffer;

  _Parser(ByteData byteData, VoltronBuffer buffer)
      : _byteData = byteData,
        _buffer = buffer;

  Object? _parse() {
    var value = readObject();
    return value == VoltronBuffer.kValueUndefined ? null : value;
  }

  Object? readObject([String? key]) {
    var type = readDataType();
    switch (type) {
      case VoltronBuffer.kTypeString:
        return readString(key, false);
      case VoltronBuffer.kTypeOneByteString:
        return readString(key, true);
      case VoltronBuffer.kTypeInt:
        return readInteger();
      case VoltronBuffer.kTypeMap:
        return readMap();
      case VoltronBuffer.kTypeArray:
        return readArray();
      case VoltronBuffer.kTypeDouble:
        return readDouble();
      case VoltronBuffer.kTypeBoolFalse:
        return false;
      case VoltronBuffer.kTypeBoolTrue:
        return true;
      case VoltronBuffer.kTypeNull:
        return null;
      case VoltronBuffer.kTypeUnknown:
        return VoltronBuffer.kValueUndefined;
      default:
        throw ArgumentError(
            "unknown Voltron-buffer type $type at $_position, total buffer length =${_byteData.lengthInBytes}");
    }
  }

  int readDataType() {
    return readOneByte();
  }

  int readOneByte() {
    var oneByte = _byteData.getUint8(_position);
    _position++;
    return oneByte;
  }

  VoltronMap readMap() {
    var size = readUnsignedInt();
    var map = VoltronMap();

    for (var i = 0; i < size; i++) {
      var key = readProperty();
      var value = readObject(key);
      if (value != VoltronBuffer.kValueUndefined) {
        map.push(key, value);
      }
    }

    return map;
  }

  VoltronArray readArray() {
    var length = readUnsignedInt();
    var array = VoltronArray();

    for (var i = 0; i < length; i++) {
      var value = readObject();
      array.push(value);
    }

    return array;
  }

  String readProperty() {
    var length = readUnsignedInt();
    return decodeString(length);
  }

  String readString([String? key, bool isOneByte = false]) {
    var length = readUnsignedInt();

    if (key == VoltronBuffer.kImgSrcPropName ||
        key == VoltronBuffer.kImgUrlPropName) {
      // 图片

      // 图片文件较大，需要使用lru缓存每次解码结果，避免同样图片重复加载
      if (length >= VoltronBuffer.kBase64ImgHeader.length) {
        var canCache = true;
        // 检查base64头：
        if (_byteData.getUint8(_position) ==
            VoltronBuffer.kBase64ImgHeader[0]) {
          for (var i = 1; i < VoltronBuffer.kBase64ImgHeader.length; i++) {
            if (_byteData.getUint8(_position + i) !=
                VoltronBuffer.kBase64ImgHeader[i]) {
              canCache = false;
              break;
            }
          }
        } else {
          canCache = false;
        }

        if (canCache) {
          final hashCode = hashCodeOfBuffer(_position, length);
          var item = _buffer.imgStringCache.get(hashCode);
          if (item == null || item.length != length) {
            // 未命中缓存，解码后缓存对应string
            var ret = decodeString(length, isOneByte);
            item = CacheItem(ret, length);
            _buffer.imgStringCache.put(hashCode, item);
            return ret;
          } else {
            // 命中缓存，直接返回缓存
            _position += length;
            return item.content;
          }
        }
      }
    }
    return decodeString(length, isOneByte);
  }

  int hashCodeOfBuffer(int offset, int length) {
    var h = 0;
    for (var i = 0; i < length; i++) {
      h = 31 * h + _byteData.getUint8(offset + i);
    }
    return h;
  }

  String decodeString(int length, [bool isOneByte = false]) {
    var bytes = List<int>.filled(length, 0);
    for (var i = 0; i < length; i++) {
      bytes[i] = readOneByte();
    }
    if (isOneByte) {
      // one byte表示使用iso-8896-1标准
      return const Latin1Codec().decode(bytes);
    } else {
      // 使用utf8标准解码string
      return const Utf8Codec().decode(bytes);
    }
  }

  int readInteger() {
    var raw = readUnsignedInt();
    var num = (((raw << 63) >> 63) ^ raw) >> 1;
    return num ^ (raw & (1 << 63));
  }

  int readUnsignedInt() {
    var value = 0;
    var i = 0;
    int b;
    while (((b = readOneByte()) & 0x80) != 0) {
      value |= (b & 0x7F) << i;
      i += 7;
      if (i > 35) {
        throw ArgumentError("Data length quantity is too long");
      }
    }
    return value | (b << i);
  }

  double readDouble() {
    var number = _byteData.getFloat64(_position);
    _position += 8;
    return number;
  }
}

class _Builder {
  static const int kDefaultBufferSize = 2048;
  int _position = 0;
  Uint8List _byteData = Uint8List(kDefaultBufferSize);

  // 记录对象应用，避免环形应用导致的栈溢出
  List<Object> refStack = [];
  final Object _writeObject;

  _Builder(Object object) : _writeObject = object;

  ByteData _build() {
    writeObject(_writeObject);
    var newBuffer = ByteData(_position);
    newBuffer.buffer.asUint8List().setRange(0, _position, _byteData);
    return newBuffer;
  }

  void writeObject(Object? object) {
    if (object is String) {
      ensureBufferSize(2);
      writeDataType(VoltronBuffer.kTypeString);
      writeString(object);
    } else if (object is VoltronMap) {
      if (refStack.contains(object)) {
        throw StateError("Circular Reference Detected");
      }

      refStack.add(object);
      writeMap(object);
      refStack.removeAt(refStack.length - 1);
    } else if (object is VoltronArray) {
      if (refStack.contains(object)) {
        throw StateError("Circular Reference Detected");
      }

      refStack.add(object);
      ensureBufferSize(8);
      var paramsArray = object;
      writeDataType(VoltronBuffer.kTypeArray);
      var arraySize = paramsArray.size();
      writeUnsignedInt(arraySize);
      for (var i = 0; i < arraySize; i++) {
        Object element = paramsArray.get(i);
        writeObject(element);
      }
      refStack.remove(refStack.length - 1);
    } else if (object is num) {
      writeNumber(object);
    } else if (object is bool) {
      ensureBufferSize(2);
      var value = object;
      if (value) {
        writeDataType(VoltronBuffer.kTypeBoolTrue);
      } else {
        writeDataType(VoltronBuffer.kTypeBoolFalse);
      }
    } else if (object == null) {
      ensureBufferSize(2);
      writeDataType(VoltronBuffer.kTypeNull);
    }
  }

  void ensureBufferSize(int minCapacity) {
    minCapacity += _position;

    if (minCapacity - _byteData.length > 0) {
      var oldCapacity = _byteData.length;
      var newCapacity = oldCapacity << 1;
      if (newCapacity < 1024 * 16) {
        newCapacity = 1024 * 16;
      }
      if (newCapacity - minCapacity < 0) {
        newCapacity = minCapacity;
      }
      var newBuffer = Uint8List(newCapacity);
      newBuffer.setRange(0, _position, _byteData);
      _byteData = newBuffer;
    }
  }

  void writeDataType(int dataType) {
    _byteData[_position] = dataType;
    _position++;
  }

  void writeProperty(String value) {
    ensureBufferSize(2);
    writeString(value);
  }

  void writeString(String value) {
    var strBytes = utf8.encode(value);
    var length = strBytes.length;
    ensureBufferSize(length + 8);
    writeUnsignedInt(length);
    if (length > 0) {
      _byteData.setRange(_position, _position + length, strBytes);
      _position += length;
    }
  }

  void writeUnsignedInt(int value) {
    while ((value & 0xFFFFFF80) != 0) {
      _byteData[_position] = ((value & 0x7F) | 0x80);
      _position++;

      value >>= 7;
    }
    _byteData[_position] = (value & 0x7F);
    _position++;
  }

  void writeNumber(num number) {
    ensureBufferSize(12);
    if (number is int) {
      writeDataType(VoltronBuffer.kTypeInt);
      writeInteger(number);
    } else if (number is double) {
      writeDataType(VoltronBuffer.kTypeDouble);
      writeDouble(number);
    }
  }

  void writeInteger(int value) {
    writeUnsignedInt((value << 1) ^ (value >> 31));
  }

  void writeDouble(double value) {
    var byteData = ByteData(8);
    byteData.setFloat64(0, value);
    _byteData.setRange(_position, _position + 8, byteData.buffer.asUint8List());
    _position += 8;
  }

  void writeMap(VoltronMap map) {
    ensureBufferSize(8);
    writeDataType(VoltronBuffer.kTypeMap);
    writeUnsignedInt(map.size());
    final entries = map.entrySet();
    for (final entry in entries) {
      writeProperty(entry.key);
      writeObject(entry.value);
    }
  }

  void release() {
    refStack.clear();
  }
}

class CacheItem {
  final String content;
  final int length;

  const CacheItem(this.content, this.length);
}
