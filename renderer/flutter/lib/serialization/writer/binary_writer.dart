import 'dart:math';
import 'dart:typed_data';

class BinaryWriter {
  final List<int> _bytes = [];

  int get length => _bytes.length;

  int _position = 0;
  int get position => _position;

  ///
  /// Chunked the write operation and returns a wrapped {@link ByteBuffer} object.
  /// After calling this method, writer will be reset and write from the beginning.
  ///
  /// @return wrapped byte buffer
  ///
  Uint8List get chunk => Uint8List.fromList(_bytes);

  ///
  /// After calling this method, writer will be reset and write from the beginning.
  ///
  /// @return This writer
  ///
  BinaryWriter reset() {
    _bytes.clear();
    _position = 0;
    return this;
  }

  /// Sets this reader's position. If new position is negative, it is treated as current_position() + new_position
  ///
  /// p is the new position value
  /// return The current position of this writer
  set position(int p) {
    if (p < 0) {
      p += _position;
    }
    if (p < 0 || p >= length) {
      throw ArgumentError(
          "illegal set position  : position = $_position, targetPosition = $p, total buffer length =$length");
    }

    _position = p;
  }

  BinaryWriter();

  ///
  /// Writes the given byte.
  ///
  /// @param byte The byte to be written
  ///
  void putByte(int byte) {
    _checkByte(byte);
    _bytes.add(byte);
    _position++;
  }

  void _checkByte(int byte) {
    if (byte >= 0 && byte < 256) {
      return;
    }
    throw ArgumentError(
        "illegal write byte($byte), out of range");
  }

  ///
  /// This method transfers bytes into this writer from the given source array.
  ///
  /// @param bytes  The array from which bytes are to be read
  /// @param start  The offset within the array of the first byte to be read
  /// @param length The number of bytes to be read from the given array
  ///
  void putBytes(List<int> bytes, {int start = 0, int length = 0}) {
    var insertFullLength = bytes.length - start;
    if (insertFullLength <= 0) {
      throw ArgumentError(
          "illegal write bytes, put start pos($start) out of bytes length(${bytes.length})");
    }
    var realLength = min(insertFullLength, max(length, insertFullLength));
    for (var i = 0; i < realLength; i++) {
      putByte(bytes[i + start]);
    }
  }

  //
  // Writes two bytes containing the given char value, in little-endian order.
  //
  // @param c The char value to be written
  void putChar(int c) {
    putByte(_parseByte(c));
    putByte(_parseByte(c >> 8));
  }

  ///
  /// Writes eight bytes containing the given double value, in little-endian order.
  ///
  /// @param d The double value to be written
  ///
  void putDouble(double num) {
    var float64List = Float64List.fromList([num]);
    var bytes = float64List.buffer.asUint8List();
    putBytes(bytes);
  }

  ///
  /// Writes an unsigned integer as a base-128 varint. The number is written, 7 bits at a time, from
  /// the least significant to the most significant 7 bits. Each byte, except the last, has the MSB
  /// set.
  ///
  /// @param l The int or long value to be written
  /// @return Number of bytes written
  /// @see <a href="https://developers.google.com/protocol-buffers/docs/encoding">protocol buffers
  /// encoding</a>
  ///
  int putVarint(int num) {
    int rest = num;
    int bytes = 0;
    int b;
    do {
      b = _parseByte(rest);
      if (b != rest) {
        b |= 0x80;
      }
      putByte(b);
      rest >>>= 7;
      bytes++;
    } while (rest != 0);
    return bytes;
  }

  int _parseByte(int num) {
    return num & 0x7f;
  }

  ///
  /// Writes eight bytes containing the given long value, in little-endian order.
  ///
  /// @param l The long value to be written
  ///
  void putInt64(int num) {
    var int64List = Int64List.fromList([num]);
    var bytes = int64List.buffer.asUint8List();
    putBytes(bytes);
  }
}
