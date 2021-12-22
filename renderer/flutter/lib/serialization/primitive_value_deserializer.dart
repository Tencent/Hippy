import '../common.dart';
import 'reader/binary_reader.dart';
import 'serialization_tag.dart';
import 'shared_serialization.dart';
import 'string/string_encoding.dart';
import 'string/string_location.dart';
import 'string/string_table.dart';

typedef ValueReaderFunc = Object? Function(
    StringLocation location, Object? relatedKey);

abstract class PrimitiveValueDeserializer extends SharedSerialization {
  /// StingTable used for byte[] to String
  final StringTable stringTable;

  /// Reader used for read buffer.
  late BinaryReader _reader;

  set reader(BinaryReader binaryReader) => _reader = binaryReader;

  BinaryReader get reader => _reader;

  /// Version of the data format used during serialization.
  int _version = 0;

  /// ID of the next deserialized object.
  int _nextId = 0;

  final Map<int, Object?> _objectMap = {};

  final Map<int, ValueReaderFunc> _valueReaderMap = {};

  bool _isDefined = false;

  PrimitiveValueDeserializer(this.stringTable) : super() {
    defineValueReaders();
  }

  bool readJSBoolean(bool value);

  num readJSNumber();

  BigInt? readJSBigInt();

  String? readJSString(StringLocation location, Object? relatedKey);

  Object? readJSArrayBuffer();

  Object? readJSRegExp();

  VoltronMap readJSObject();

  VoltronMap readJSMap();

  VoltronArray readJSSet();

  VoltronArray readDenseArray();

  VoltronArray readSparseArray();

  VoltronMap readJSError();

  Object readHostObject();

  Object? readTransferredJSArrayBuffer();

  Object? readSharedArrayBuffer();

  Object? readTransferredWasmModule();

  Object? readTransferredWasmMemory();

  void reset() {
    _objectMap.clear();
    _nextId = 0;
  }

  int readTag() {
    var tag;
    do {
      tag = reader.getByte();
    } while (tag == SerializationTag.kPadding);
    return tag;
  }

  int peekTag() {
    if (reader.position < reader.length) {
      var tag = reader.getByte();
      reader.position = -1;
      return tag;
    }
    return SerializationTag.kUnknownTag;
  }

  int readArrayBufferViewTag() {
    return ArrayBufferViewTag.fromTag(reader.getByte());
  }

  int readErrorTag() {
    return ErrorTag.fromTag(reader.getByte());
  }

  void readHeader() {
    if (readTag() == SerializationTag.kVersion) {
      _version = reader.getVarint();
      if (_version > SharedSerialization.latestVersion) {
        throw UnsupportedError(
            "Unable to deserialize cloned data due to invalid or unsupported version.");
      }
    }
  }

  int readZigZag() {
    var zigzag = reader.getVarint();
    var value = (zigzag >> 1) ^ -(zigzag & 1);
    return value;
  }

  num readDoubleWithRectification() {
    var doubleValue = reader.getDouble();
    var longValue = doubleValue.toInt();
    if (doubleValue == longValue) {
      return longValue;
    }
    return doubleValue;
  }

  BigInt readBigInt() {
    var bitField = reader.getVarint();
    var negative = (bitField & 1) != 0;
    bitField >>= 1;
    var bigInteger = BigInt.zero;
    for (var i = 0; i < bitField; i++) {
      var b = reader.getByte();
      for (var bit = 8 * i; bit < 8 * (i + 1); bit++) {
        if ((b & 1) != 0) {
          bigInteger = bigInteger.pow(bit);
        }
        b >>= 1;
      }
    }
    if (negative) {
      bigInteger = -bigInteger;
    }
    return bigInteger;
  }

  String readString(StringLocation location, Object? relatedKey) {
    var tag = readTag();
    if (tag == SerializationTag.kOneByteString) {
      return readOneByteString(location, relatedKey);
    } else if (tag == SerializationTag.kTwoByteString) {
      return readTwoByteString(location, relatedKey);
    } else if (tag == SerializationTag.kUtf8String) {
      return readUTF8String(location, relatedKey);
    } else {
      throw UnsupportedError("readString unexpected tag: $tag");
    }
  }

  String readOneByteString(StringLocation location, Object? relatedKey) {
    return readCommonString(StringEncoding.latin, location, relatedKey);
  }

  String readTwoByteString(StringLocation location, Object? relatedKey) {
    return readCommonString(StringEncoding.utf16Le, location, relatedKey);
  }

  String readUTF8String(StringLocation location, Object? relatedKey) {
    return readCommonString(StringEncoding.utf8, location, relatedKey);
  }

  String readCommonString(
      StringEncoding encoding, StringLocation location, Object? relatedKey) {
    var byteCount = reader.getVarint();
    if (byteCount < 0) {
      throw RangeError("readString out range error, bytgeCount : $byteCount");
    }
    var byteData = reader.getBytes(byteCount);
    return stringTable.lookup(byteData, encoding, location, relatedKey);
  }

  DateTime readDate() {
    var millis = reader.getDouble();
    return assignId(DateTime.fromMillisecondsSinceEpoch(millis as int));
  }

  Object readObjectReference() {
    var id = reader.getVarint();
    if (id < 0) {
      throw RangeError("readObjectReference id out of range : $id");
    }
    var object = _objectMap[id];
    if (object == null) {
      throw AssertionError("invalid object reference(@$id)");
    }
    return object;
  }

  void defineValueReader(int tag, ValueReaderFunc func) {
    if (_valueReaderMap.containsKey(tag)) {
      throw ArgumentError("A function with tag $tag has already been defined");
    }
    _valueReaderMap[tag] = func;
  }

  void defineValueReaders() {
    if (_isDefined) return;
    _isDefined = true;
    defineValueReader(SerializationTag.kTrue, (location, relatedKey) => true);
    defineValueReader(SerializationTag.kFalse, (location, relatedKey) => false);
    defineValueReader(
        SerializationTag.kTheHole, (location, relatedKey) => hole);
    defineValueReader(
        SerializationTag.kUndefined, (location, relatedKey) => undefined);
    defineValueReader(SerializationTag.kNull, (location, relatedKey) => nul);
    defineValueReader(
        SerializationTag.kInt32, (location, relatedKey) => readZigZag());
    defineValueReader(
        SerializationTag.kUInt32, (location, relatedKey) => reader.getVarint());
    defineValueReader(SerializationTag.kDouble,
        (location, relatedKey) => readDoubleWithRectification());
    defineValueReader(
        SerializationTag.kBigInt, (location, relatedKey) => readBigInt());
    defineValueReader(SerializationTag.kOneByteString, readOneByteString);
    defineValueReader(SerializationTag.kTwoByteString, readTwoByteString);
    defineValueReader(SerializationTag.kUtf8String, readUTF8String);
    defineValueReader(
        SerializationTag.kDate, (location, relatedKey) => readDate());
    defineValueReader(SerializationTag.kTrueObject,
        (location, relatedKey) => readJSBoolean(true));
    defineValueReader(SerializationTag.kFalseObject,
        (location, relatedKey) => readJSBoolean(false));
    defineValueReader(SerializationTag.kNumberObject,
        (location, relatedKey) => readJSNumber());
    defineValueReader(SerializationTag.kBigIntObject,
        (location, relatedKey) => readJSBigInt());
    defineValueReader(SerializationTag.kStringObject, readJSString);
    defineValueReader(
        SerializationTag.kRegexp, (location, relatedKey) => readJSRegExp());
    defineValueReader(SerializationTag.kArrayBuffer,
        (location, relatedKey) => readJSArrayBuffer());
    defineValueReader(SerializationTag.kArrayBufferTransfer,
        (location, relatedKey) => readTransferredJSArrayBuffer());
    defineValueReader(SerializationTag.kSharedArrayBuffer,
        (location, relatedKey) => readSharedArrayBuffer());
    defineValueReader(SerializationTag.kBeginJsObject,
        (location, relatedKey) => readJSObject());
    defineValueReader(
        SerializationTag.kBeginJsMap, (location, relatedKey) => readJSMap());
    defineValueReader(
        SerializationTag.kBeginJsSet, (location, relatedKey) => readJSSet());
    defineValueReader(SerializationTag.kBeginDenseJsArray,
        (location, relatedKey) => readDenseArray());
    defineValueReader(SerializationTag.kBeginSparseJsArray,
        (location, relatedKey) => readSparseArray());
    defineValueReader(SerializationTag.kObjectReference,
        (location, relatedKey) => readObjectReference());
    defineValueReader(SerializationTag.kWasmModuleTransfer,
        (location, relatedKey) => readTransferredWasmModule());
    defineValueReader(SerializationTag.kHostObject,
        (location, relatedKey) => readHostObject());
    defineValueReader(SerializationTag.kWasmMemoryTransfer,
        (location, relatedKey) => readTransferredWasmMemory());
    defineValueReader(
        SerializationTag.kError, (location, relatedKey) => readJSError());
  }

  Object? readValue(
      {int tag = SerializationTag.kUnknownTag,
      StringLocation location = StringLocation.topLevel,
      Object? relatedKey}) {
    if (tag == SerializationTag.kUnknownTag) {
      tag = readTag();
    }
    var fun = _valueReaderMap[tag];
    if (fun == null) {
      print("readValue expected tag $tag");
      if (_version < 13) {
        reader.position = -1;
        return readHostObject();
      }
      return undefined;
    } else {
      return fun(location, relatedKey);
    }
  }

  T assignId<T>(T object) {
    _objectMap[_nextId++] = object;
    return object;
  }
}
