import 'package:voltron_renderer/common.dart';
import 'package:voltron_renderer/serialization/primitive_value_serializer.dart';

import 'serialization_tag.dart';

class Serializer extends PrimitiveValueSerializer {
  static Serializer? _serializer;
  static Serializer defaultSerializer() {
    var curSerializer =
        _serializer ?? Serializer();
    _serializer = curSerializer;
    return curSerializer;
  }

  @override
  bool writeValue(dynamic value) {
    if (super.writeValue(value)) {
      return true;
    }
    if (value is VoltronArray) {
      assignId(value);
      _writeJSArray(value);
    } else if (value is VoltronMap) {
      assignId(value);
      _writeJSObject(value);
    } else {
      return false;
    }
    return true;
  }

  void _writeJSObject(VoltronMap value) {
    writeTag(SerializationTag.kBeginJsObject);
    var keys = value.keySet();
    for (String key in keys) {
      writeString(key);
      writeValue(value.get(key));
    }
    writeTag(SerializationTag.kEndJsObject);
    writer.putVarint(keys.length);
  }

  void _writeJSArray(VoltronArray value) {
    int length = value.size();
    writeTag(SerializationTag.kBeginDenseJsArray);
    writer.putVarint(length);
    for (int i = 0; i < length; i++) {
      writeValue(value.get(i));
    }
    writeTag(SerializationTag.kEndDenseJsArray);
    writer.putVarint(0);
    writer.putVarint(length);
  }
}
