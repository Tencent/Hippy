import 'dart:typed_data';

import 'package:flutter/cupertino.dart';
import 'package:voltron_renderer/serialization/shared_serialization.dart';
import 'package:voltron_renderer/serialization/writer/binary_writer.dart';

import 'serialization_tag.dart';

abstract class PrimitiveValueSerializer extends SharedSerialization {
  @protected
  final BinaryWriter writer = BinaryWriter();

  ///
  /// Maps a serialized object to its ID.
  ///
  final Map<Object, int> _objectMap = {};

  ///
  /// Temporary char buffer for string writing.
  ///
  List<int>? stringWriteBuffer;

  ///
  /// ID of the next serialized object.
  ///
  int nextId = 0;

  ///
  /// Small string max length, used for SSO(Short / Small String Optimization).
  ///
  static const int _kSSOSmallStringMaxLength = 32;

  Uint8List get chunk => writer.chunk;

  PrimitiveValueSerializer();

  void reset() {
    _objectMap.clear();
    nextId = 0;
    writer.reset();
  }

  ///
  /// Writes out a header, which includes the format version.
  ///
  void writeHeader() {
    writeTag(SerializationTag.kVersionHeader);
    writer.putVarint(SharedSerialization.latestVersion);
  }

  void writeTag(int tag) {
    writer.putByte(tag);
  }

  ///
  /// Serializes a JavaScript delegate object into the buffer.
  ///
  /// @param value JavaScript delegate object
  bool writeValue(dynamic value) {
    if (value is String) {
      writeString(value);
    } else if (value is int) {
      writeInt(value);
    } else if (value is double) {
      writeDouble(value);
    } else if (value is bool) {
      if (value) {
        writeTag(SerializationTag.kTrue);
      } else {
        writeTag(SerializationTag.kFalse);
      }
    } else if (value == undefined) {
      writeTag(SerializationTag.kUndefined);
    } else if (value == nul) {
      writeTag(SerializationTag.kNull);
    } else if (value == hole) {
      writeTag(SerializationTag.kTheHole);
    } else {
      int? id = _objectMap[value];
      if (id != null) {
        writeTag(SerializationTag.kObjectReference);
        writer.putVarint(id);
      } else {
        return false;
      }
    }
    return true;
  }

  void writeInt(int value) {
    int zigzag = (value << 1) ^ (value >> 31);
    writeTag(SerializationTag.kInt32);
    writer.putVarint(BigInt.from(zigzag).toUnsigned(32).toInt());
  }

  void writeDouble(double value) {
    writeTag(SerializationTag.kDouble);
    writer.putDouble(value);
  }

  ///
  /// <p>Write {@link String} string to the buffer</p>
  /// <p></p>
  ///
  /// <h2>Research</h2>
  ///
  /// <h3>Background / Overview</h3>
  /// <p>According to the following benchmark tests and real world scenarios,
  /// this method will choose different iterator based on the length of the string for more
  /// efficiency, called <strong>SSO</strong>(Short / Small String Optimization).</p>
  /// <p>If string length small than {@link #SSO_SMALL_STRING_MAX_LENGTH}, will use {@link
  /// String#charAt(int)}
  /// to iterate, otherwise will use {@link String#getChars(int, int, char[], int)}</p>
  /// <p></p>
  ///
  /// <h3>Benchmark</h3>
  ///
  /// <h4>Test Cases</h4>
  /// <pre>{@code
  ///   int charAt(final String data) {
  ///     final int len = data.length();
  ///     for (int i = 0; i < len; i++) {
  ///       if (data.charAt(i) <= ' ') {
  ///         doThrow();
  ///       }
  ///     }
  ///     return len;
  ///   }
  ///
  ///   int getChars(final char[] reusable, final String data) {
  ///     final int len = data.length();
  ///     data.getChars(0, len, reusable, 0);
  ///     for (int i = 0; i < len; i++) {
  ///       if (reusable[i] <= ' ') {
  ///         doThrow();
  ///       }
  ///     }
  ///     return len;
  ///   }
  ///
  ///   int toCharArray(final String data) {
  ///     final int len = data.length();
  ///     final char[] copy = data.toCharArray();
  ///     for (int i = 0; i < len; i++) {
  ///       if (copy[i] <= ' ') {
  ///         doThrow();
  ///       }
  ///     }
  ///     return len;
  ///   }
  /// }</pre>
  ///
  /// <h4>Results</h4>
  /// <i>(run tests on HUAWEI JSN-AL00a with Android 9)</i>
  /// <pre>
  ///   ======= (tries per size: 1000) =======
  ///   Size   charAt  getChars    toCharArray
  ///      1   357.00  1,289.00    567.00
  ///      2   179.00    202.00    300.00
  ///      4    87.75     95.75    141.25
  ///      8    46.63     46.88     73.75
  ///     16    25.06     25.06     41.44
  ///     32    14.53     14.13     24.22
  ///     64     8.66      8.05     12.45
  ///    128     6.23      5.22      8.27
  ///    256     4.84      3.89      6.13
  ///    512     4.10      3.21      5.44
  ///   1024     3.91      4.36      4.83
  ///   2048     3.67      2.78      4.85
  ///   4096     4.01      2.65      6.32
  ///   8192     3.60      2.63      6.42
  ///  16384     3.65      2.61      5.39
  ///  32768     3.61      2.60      4.91
  ///  65536     3.57      2.62      4.68
  ///  Rate in nanoseconds per character inspected
  /// </pre>
  /// <p>Obviously we can discover two facts,
  /// {@link String#toCharArray()} performance is lower than other methods at any time, and there is
  /// a dividing line when the string has 32({@link #SSO_SMALL_STRING_MAX_LENGTH}) characters.</p>
  ///
  /// @param value data
  /// @see <a href="https://stackoverflow.com/questions/8894258/fastest-way-to-iterate-over-all-the-chars-in-a-string">Fastest
  /// way to iterate over all the chars in a String</a>
  /// @see <a href="https://stackoverflow.com/questions/196830/what-is-the-easiest-best-most-correct-way-to-iterate-through-the-characters-of-a">What
  /// is the easiest/best/most correct way to iterate through the characters of a string in
  /// Java?</a>
  ///
  void writeString(String value) {
    int length = value.length;

    if (length > _kSSOSmallStringMaxLength) {
      _writeLongString(value);
    } else {
      _writeShortString(value);
    }
  }

  void _writeLongString(String value) {
    int length = value.length;
    List<int> curStringWriteBuffer;
    if (stringWriteBuffer != null &&
        (stringWriteBuffer?.length ?? 0) >= length) {
      curStringWriteBuffer = stringWriteBuffer!;
      curStringWriteBuffer.setRange(0, length, value.codeUnits);
    } else {
      curStringWriteBuffer = List.generate(
          length, (index) {
        return value.codeUnitAt(index);
      });
      stringWriteBuffer = curStringWriteBuffer;
    }

    bool isOneByteString = true;
    for (var element in curStringWriteBuffer) {
      if (element >= 0x80) {
        isOneByteString = false;
        break;
      }
    }

    if (isOneByteString) {
      // region one byte string, commonly path
      writeTag(SerializationTag.kOneByteString);
      writer.putVarint(length);
      writer.putBytes(curStringWriteBuffer, length: length);
    } else {
      // region two byte string, universal path
      writeTag(SerializationTag.kTwoByteString);
      writer.putVarint(length * 2);
      for (var char in curStringWriteBuffer) {
        writer.putChar(char);
      }
    }
  }

  void _writeShortString(String value) {
    int length = value.length;

    bool isOneByteString = true;
    var codeUnits = value.codeUnits;
    for (var element in codeUnits) {
      if (element >= 0x80) {
        isOneByteString = false;
        break;
      }
    }

    if (isOneByteString) {
      // region one byte string, commonly path
      writeTag(SerializationTag.kOneByteString);
      writer.putVarint(length);
      writer.putBytes(codeUnits, length: length);
    } else {
      // region two byte string, universal path
      writeTag(SerializationTag.kTwoByteString);
      writer.putVarint(length * 2);
      for (var char in codeUnits) {
        writer.putChar(char);
      }
    }
  }

  void assignId(Object object) {
    _objectMap[object] = nextId++;
  }
}

