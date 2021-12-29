import 'dart:typed_data';

class BinaryReader {
  final ByteData _byteData;
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

  BinaryReader(ByteData byteData)
      : _byteData = byteData,
        _lengthInBytes = byteData.lengthInBytes;

  /// Reads the byte at this reader's current [position]
  ///
  /// return The byte at the reader's current [position]
  int getByte() {
    var oneByte = _byteData.getUint8(_position);
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
    var byteData = ByteData(length);
    var index = 0;
    for (var i = _position, j = _position + length; i < j; i++) {
      byteData.setUint8(index++, _byteData.getUint8(i));
    }
    _position += length;
    return byteData;
  }

  /// Reads the next eight bytes at this reader's current [position], composing them into a double
  /// value according to the little-endian order
  ///
  /// return The double value at the reader's current [position]
  double getDouble() {
    var number = _byteData.getFloat64(_position, Endian.little);
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
    var value = _byteData.getInt64(_position);
    _position += 8;
    return value;
  }
}
