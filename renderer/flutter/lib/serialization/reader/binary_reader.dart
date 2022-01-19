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

import 'dart:typed_data';

class BinaryReader {
  final Uint8List _bytes;
  final int _lengthInBytes;

  int get length => _lengthInBytes;

  int _position = 0;
  int get position => _position;

  /// Sets this reader's position. If new position is negative, it is treated as current_position() + new_position
  ///
  /// p is the new position value
  /// return The current position of this writer
  set position(int p) {
    if (p < 0) {
      p += _position;
    }
    if (p < 0 || p >= _lengthInBytes) {
      throw ArgumentError(
          "illegal set position  : position = $_position, targetPosition = $p, total buffer length =$_lengthInBytes");
    }

    _position = p;
  }

  BinaryReader(Uint8List bytes)
      : _bytes = bytes,
        _lengthInBytes = bytes.lengthInBytes;

  /// Reads the byte at this reader's current [position]
  ///
  /// return The byte at the reader's current [position]
  int getByte() {
    var oneByte = _bytes[_position];
    _position++;
    return oneByte;
  }

  /// This method transfers bytes from this reader into the [ByteData].
  ///
  /// The length is the maximum number of bytes to be written to the [ByteData]
  /// return the target byte data
  ByteData getBytes(int length) {
    if (_position + length > _lengthInBytes) {
      throw ArgumentError(
          "illegal read length : position = $_position, length = $length, total buffer length =$_lengthInBytes");
    }
    var byteData = Uint8List(length);
    var index = 0;
    for (var i = _position, j = _position + length; i < j; i++) {
      byteData[index++] = _bytes[i];
    }
    _position += length;
    return byteData.buffer.asByteData();
  }

  /// Reads the next eight bytes at this reader's current [position], composing them into a double
  /// value according to the little-endian order
  ///
  /// return The double value at the reader's current [position]
  double getDouble() {
    var length = 8;
    var byteData = Uint8List(length);
    var index = 0;
    for (var i = _position, j = _position + length; i < j; i++) {
      byteData[index++] = _bytes[i];
    }
    var number = byteData.buffer.asByteData().getFloat64(0, Endian.little);
    _position += 8;
    return number;
  }

  /// Reads an unsigned integer as a base-128 varint. The number is written, 7 bits at a time, from
  /// the least significant to the most significant 7 bits. Each byte, except the last, has the MSB
  /// set.
  ///
  /// return The int or long value at the reader's current [position]
  int getVarint() {
    var value = 0;
    var i = 0;
    int b;
    while (((b = getByte()) & 0x80) != 0) {
      value |= (b & 0x7F) << i;
      i += 7;
    }
    return value | (b << i);
  }

  /// Reads the next eight bytes at this reader's current position, composing them into a long value
  /// according to the little-endian order
  ///
  /// return The long value at the reader's current [position]
  int readInt64() {
    var length = 8;
    var byteData = Uint8List(length);
    var index = 0;
    for (var i = _position, j = _position + length; i < j; i++) {
      byteData[index++] = _bytes[i];
    }
    var number = byteData.buffer.asByteData().getInt64(0, Endian.little);
    _position += 8;
    return number;
  }
}
