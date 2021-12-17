import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter/services.dart';

import '../util/log_util.dart';
import 'lru_cache.dart';
import 'voltron_array.dart';
import 'voltron_map.dart';

class VoltronBuffer {
  static const int typeNull = 0x00;

  static const int typeString = 0x01;

  static const int typeBoolTrue = 0x02;

  static const int typeBoolFalse = 0x03;

  static const int typeInt = 0x04;

  static const int typeDouble = 0x05;

  static const int typeArray = 0x06;

  static const int typeMap = 0x07;

  static const int typeOneByteString = 0x08;

  static const int typeUnknown = 0xFF;

  static final Object sValueUndefined = Object();

  static const String imgUrlPropName = "uri";
  static const String imgSrcPropName = "src";

  static final List<int> sBase64ImgHeader = "data:image".codeUnits;

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
    return value == VoltronBuffer.sValueUndefined ? null : value;
  }

  Object? readObject([String? key]) {
    var type = readDataType();
    switch (type) {
      case VoltronBuffer.typeString:
        return readString(key, false);
      case VoltronBuffer.typeOneByteString:
        return readString(key, true);
      case VoltronBuffer.typeInt:
        return readInteger();
      case VoltronBuffer.typeMap:
        return readMap();
      case VoltronBuffer.typeArray:
        return readArray();
      case VoltronBuffer.typeDouble:
        return readDouble();
      case VoltronBuffer.typeBoolFalse:
        return false;
      case VoltronBuffer.typeBoolTrue:
        return true;
      case VoltronBuffer.typeNull:
        return null;
      case VoltronBuffer.typeUnknown:
        return VoltronBuffer.sValueUndefined;
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
      if (value != VoltronBuffer.sValueUndefined) {
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

    if (key == VoltronBuffer.imgSrcPropName ||
        key == VoltronBuffer.imgUrlPropName) {
      // 图片

      // 图片文件较大，需要使用lru缓存每次解码结果，避免同样图片重复加载
      if (length >= VoltronBuffer.sBase64ImgHeader.length) {
        var canCache = true;
        // 检查base64头：
        if (_byteData.getUint8(_position) ==
            VoltronBuffer.sBase64ImgHeader[0]) {
          for (var i = 1; i < VoltronBuffer.sBase64ImgHeader.length; i++) {
            if (_byteData.getUint8(_position + i) !=
                VoltronBuffer.sBase64ImgHeader[i]) {
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
      return Latin1Codec().decode(bytes);
    } else {
      // 使用utf8标准解码string
      return Utf8Codec().decode(bytes);
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
  static const int defaultBufferSize = 2048;
  int _position = 0;
  Uint8List _byteData = Uint8List(defaultBufferSize);
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
      writeDataType(VoltronBuffer.typeString);
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
      writeDataType(VoltronBuffer.typeArray);
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
        writeDataType(VoltronBuffer.typeBoolTrue);
      } else {
        writeDataType(VoltronBuffer.typeBoolFalse);
      }
    } else if (object == null) {
      ensureBufferSize(2);
      writeDataType(VoltronBuffer.typeNull);
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
      writeDataType(VoltronBuffer.typeInt);
      writeInteger(number);
    } else if (number is double) {
      writeDataType(VoltronBuffer.typeDouble);
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
    writeDataType(VoltronBuffer.typeMap);
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
