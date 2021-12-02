import '../common/voltron_array.dart';
import '../common/voltron_map.dart';
import 'primitive_value_deserializer.dart';
import 'reader/binary_reader.dart';
import 'serialization_tag.dart';
import 'string/string_location.dart';
import 'string/string_table.dart';

class Deserializer extends PrimitiveValueDeserializer {
  Deserializer(StringTable stringTable) : super(stringTable);

  @override
  Object getHole() {
    return undefined;
  }

  @override
  Object? getNull() {
    return null;
  }

  @override
  Object getUndefined() {
    return Object();
  }

  @override
  VoltronArray readDenseArray() {
    var length = reader.getVarint();
    if (length < 0) {
      throw RangeError("readDenseArray expected length : $length");
    }
    var array = VoltronArray();
    assignId(array);
    for (var i = 0; i < length; i++) {
      var tag = readTag();
      if (tag != SerializationTag.kTheHole) {
        array.push(readValue(
            tag: tag, location: StringLocation.denseArrayItem, relatedKey: i));
      }
    }

    var read = _readJSProperties(null, SerializationTag.kEndDenseJsArray);
    var expected = reader.getVarint();
    if (read != expected) {
      throw UnsupportedError("unexpected number of properties");
    }

    var length2 = reader.getVarint();
    if (length != length2) {
      throw AssertionError("length ambiguity");
    }
    return array;
  }

  @override
  Object readHostObject() {
    return assignId(undefined);
  }

  @override
  Object? readJSArrayBuffer() {
    var byteLength = reader.getVarint();
    if (byteLength < 0) {
      throw RangeError("readJSArrayBuffer expected length: $byteLength");
    }
    reader.position = reader.position + byteLength;
    assignId(undefined);
    if (peekTag() == SerializationTag.kArrayBufferView) {
      readJSArrayBufferView();
    }
    return null;
  }

  @override
  BigInt? readJSBigInt() {
    return assignId(readBigInt());
  }

  @override
  bool readJSBoolean(bool value) {
    return assignId(value);
  }

  @override
  VoltronMap readJSError() {
    var message;
    var stack;
    var errorType;

    var done = false;
    while (!done) {
      var tag = readErrorTag();
      if (tag == ErrorTag.kUnknownTag) {
        break;
      }
      if (tag == ErrorTag.kEvalError) {
        errorType = "EvalError";
        break;
      } else if (tag == ErrorTag.kRangeError) {
        errorType = "RangeError";
        break;
      } else if (tag == ErrorTag.kReferenceError) {
        errorType = "ReferenceError";
        break;
      } else if (tag == ErrorTag.kSyntaxError) {
        errorType = "SyntaxError";
        break;
      } else if (tag == ErrorTag.kTypeError) {
        errorType = "TypeError";
        break;
      } else if (tag == ErrorTag.kURIError) {
        errorType = "URIError";
        break;
      } else if (tag == ErrorTag.kMessage) {
        message = readString(StringLocation.errorMessage, null);
        break;
      } else if (tag == ErrorTag.kStack) {
        stack = readString(StringLocation.errorStack, null);
        break;
      } else {
        if (tag != ErrorTag.kEnd) {
          throw AssertionError("ErrorTag: $tag");
        }
        done = true;
        break;
      }
    }

    var error = VoltronMap();
    error.push("message", message);
    error.push("stack", stack);
    error.push("type", errorType);
    assignId(error);
    return error;
  }

  @override
  VoltronMap readJSMap() {
    var object = VoltronMap();
    assignId(object);
    int tag;
    var read = 0;
    while ((tag = readTag()) != SerializationTag.kEndJsMap) {
      read++;
      var key = readValue(tag: tag, location: StringLocation.mapKey).toString();
      var value = readValue(location: StringLocation.mapValue, relatedKey: key);
      if (value != undefined) {
        if (key == "null") {
          object.push("NULL", value);
        } else {
          object.push(key, value);
        }
      }
    }
    var expected = reader.getVarint();
    if (2 * read != expected) {
      throw UnsupportedError("unexpected number of entries");
    }
    return object;
  }

  @override
  num readJSNumber() {
    return assignId(reader.getDouble());
  }

  @override
  VoltronMap readJSObject() {
    var object = VoltronMap();
    assignId(object);
    var read = _readJSProperties(object, SerializationTag.kEndJsObject);
    var expected = reader.getVarint();
    if (read != expected) {
      throw UnsupportedError("unexpected number of properties");
    }
    return object;
  }

  @override
  Object? readJSRegExp() {
    readString(StringLocation.eVoid, null);
    reader.getVarint();
    return assignId(undefined);
  }

  @override
  VoltronArray readJSSet() {
    var array = VoltronArray();
    assignId(array);
    int tag;
    var read = 0;
    while ((tag = readTag()) != SerializationTag.kEndJsSet) {
      read++;
      var value = readValue(tag: tag, location: StringLocation.setItem);
      array.push(value);
    }
    var expected = reader.getVarint();
    if (read != expected) {
      throw UnsupportedError("unexpected number of values");
    }
    return array;
  }

  @override
  String? readJSString(StringLocation location, Object? relatedKey) {
    return assignId(readString(location, relatedKey));
  }

  @override
  Object? readSharedArrayBuffer() {
    reader.getVarint();
    assignId(undefined);
    if (peekTag() == SerializationTag.kArrayBufferView) {
      readJSArrayBufferView();
    }
    return null;
  }

  @override
  VoltronArray readSparseArray() {
    var length = reader.getVarint();
    var array = VoltronArray();
    assignId(array);

    int tag;
    var read = 0;
    while ((tag = readTag()) != SerializationTag.kEndSparseJsArray) {
      read++;
      var key = readValue(tag: tag, location: StringLocation.sparseArrayKey);
      var value =
          readValue(location: StringLocation.sparseArrayItem, relatedKey: key);

      var index = -1;
      if (key is num) {
        index = key.toInt();
      } else if (key is String) {
        try {
          index = int.parse(key);
        } on FormatException {
          // ignore not parsable string
        }
      }
      if (index >= 0) {
        var spaceNeeded = (index + 1) - array.size();
        if (spaceNeeded == 1) {
          // Fast path, item are ordered in general ECMAScript(VM) implementation
          array.push(value);
        } else {
          // Slow path, universal
          for (var i = 0; i < spaceNeeded; i++) {
            array.pushNull();
          }
          array.set(index, value);
        }
      }
    }

    var expected = reader.getVarint();
    if (read != expected) {
      throw UnsupportedError("unexpected number of properties");
    }
    var length2 = reader.getVarint();
    if (length != length2) {
      throw AssertionError("length ambiguity");
    }
    return array;
  }

  @override
  Object? readTransferredJSArrayBuffer() {
    reader.getVarint();
    assignId(undefined);
    if (peekTag() == SerializationTag.kArrayBufferView) {
      readJSArrayBufferView();
    }
    return null;
  }

  @override
  Object? readTransferredWasmMemory() {
    reader.getVarint();
    readSharedArrayBuffer();
    assignId(undefined);
    return null;
  }

  @override
  Object? readTransferredWasmModule() {
    reader.getVarint();
    assignId(undefined);
    return null;
  }

  int _readJSProperties(VoltronMap? object, int endTag) {
    final StringLocation keyLocation, valueLocation;
    if (endTag == SerializationTag.kEndDenseJsArray) {
      keyLocation = StringLocation.denseArrayKey;
      valueLocation = StringLocation.denseArrayItem;
    } else if (endTag == SerializationTag.kEndJsObject) {
      keyLocation = StringLocation.objectKey;
      valueLocation = StringLocation.objectValue;
    } else {
      throw ArgumentError("_readJSProperties Illegal endTag: $endTag");
    }

    int tag;
    var count = 0;
    while ((tag = readTag()) != endTag) {
      count++;
      var key = readValue(tag: tag, location: keyLocation);
      var value = readValue(location: valueLocation, relatedKey: key);

      if (object != null && value != undefined) {
        if (key is num) {
          object.push(key.toString(), value);
        } else if (key is String) {
          if (key == "null") {
            object.push("NULL", value);
          } else {
            object.push(key.toString(), value);
          }
        } else {
          throw AssertionError(
              "Object key is not of String(null) nor Number type");
        }
      }
    }
    return count;
  }

  void readJSArrayBufferView() {
    var arrayBufferViewTag = readTag();
    if (arrayBufferViewTag != SerializationTag.kArrayBufferView) {
      throw AssertionError(
          "readJSArrayBufferView ArrayBufferViewTag: $arrayBufferViewTag");
    }

    reader.getVarint();
    reader.getVarint();
    readArrayBufferViewTag();

    assignId(undefined);
  }
}
