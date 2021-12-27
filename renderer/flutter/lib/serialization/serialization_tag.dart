import 'dart:core';

extension CharConvertion on String {
  int toChar() {
    return codeUnitAt(0);
  }
}

class SerializationTag {
  static const int kUnknownTag = -1;

  static final int kVersion = 0xFF;
  static final int kTrue = 'T'.toChar();
  static final int kFalse = 'F'.toChar();
  static final int kUndefined = '_'.toChar();
  static final int kNull = '0'.toChar();
  static final int kInt32 = 'I'.toChar();
  static final int kUInt32 = 'U'.toChar();
  static final int kDouble = 'N'.toChar();
  static final int kBigInt = 'Z'.toChar();
  static final int kUtf8String = 'S'.toChar();
  static final int kOneByteString = '"'.toChar();
  static final int kTwoByteString = 'c'.toChar();
  static final int kPadding = 0;
  static final int kDate = 'D'.toChar();
  static final int kTrueObject = 'y'.toChar();
  static final int kFalseObject = 'x'.toChar();
  static final int kNumberObject = 'n'.toChar();
  static final int kBigIntObject = 'z'.toChar();
  static final int kStringObject = 's'.toChar();
  static final int kRegexp = 'R'.toChar();
  static final int kArrayBuffer = 'B'.toChar();
  static final int kSharedArrayBuffer = 'u'.toChar();
  static final int kArrayBufferTransfer = 't'.toChar();
  static final int kArrayBufferView = 'V'.toChar();
  static final int kBeginJsMap = ';'.toChar();
  static final int kEndJsMap = ':'.toChar();
  static final int kBeginJsSet = '\''.toChar();
  static final int kEndJsSet = ','.toChar();
  static final int kBeginJsObject = 'o'.toChar();
  static final int kEndJsObject = '{'.toChar();
  static final int kBeginSparseJsArray = 'a'.toChar();
  static final int kEndSparseJsArray = '@'.toChar();
  static final int kBeginDenseJsArray = 'A'.toChar();
  static final int kEndDenseJsArray = '\$'.toChar();
  static final int kTheHole = '-'.toChar();
  static final int kObjectReference = '^'.toChar();
  static final int kWasmModuleTransfer = 'w'.toChar();
  static final int kHostObject = '\\'.toChar();
  static final int kWasmMemoryTransfer = 'm'.toChar();
  static final int kError = 'r'.toChar();

  final int tag;

  SerializationTag(this.tag);
}

class ArrayBufferViewTag {
  static const int kUnknownTag = -1;

  static final int kInt8Array = 'b'.toChar();
  static final int kUInt8Array = 'B'.toChar();
  static final int kUInt8ClampedArray = 'C'.toChar();
  static final int kInt16Array = 'w'.toChar();
  static final int kUInt16Array = 'W'.toChar();
  static final int kInt32Array = 'd'.toChar();
  static final int kUInt32Array = 'D'.toChar();
  static final int kFloat32Array = 'f'.toChar();
  static final int kFloat64Array = 'F'.toChar();
  static final int kDataView = '?'.toChar();

  static int fromTag(int tag) {
    if (tag != kInt8Array &&
        tag != kUInt8Array &&
        tag != kUInt8ClampedArray &&
        tag != kInt16Array &&
        tag != kUInt16Array &&
        tag != kInt32Array &&
        tag != kUInt32Array &&
        tag != kFloat32Array &&
        tag != kFloat64Array &&
        tag != kDataView) {
      return kUnknownTag;
    }
    return tag;
  }
}

class ErrorTag {
  static const int kUnknownTag = -1;

  static final int kEvalError = 'E'.toChar();
  static final int kRangeError = 'R'.toChar();
  static final int kReferenceError = 'F'.toChar();
  static final int kSyntaxError = 'S'.toChar();
  static final int kTypeError = 'T'.toChar();
  static final int kURIError = 'U'.toChar();
  static final int kMessage = 'm'.toChar();
  static final int kStack = 's'.toChar();
  static final int kEnd = '.'.toChar();

  static int fromTag(int tag) {
    if (tag != kEvalError &&
        tag != kRangeError &&
        tag != kReferenceError &&
        tag != kSyntaxError &&
        tag != kTypeError &&
        tag != kURIError &&
        tag != kMessage &&
        tag != kStack &&
        tag != kEnd) {
      return kUnknownTag;
    }
    return tag;
  }
}
