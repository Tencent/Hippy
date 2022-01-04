import 'dart:typed_data';

import '../serialization.dart';
import '../util.dart';

extension TypeEx on Object {
  T? asType<T>() {
    if (this is T) {
      return this as T;
    }
    return null;
  }
}

extension BinaryUtilEx on Uint8List {
  T? decodeType<T>() {
    return decode()?.asType<T>();
  }

  Object? decode() {
    if (this.isEmpty) {
      return null;
    }
    var deserializer = Deserializer.defaultDeserializer();
    deserializer.reader = BinaryReader(buffer.asByteData());
    deserializer.reset();
    deserializer.readHeader();
    return deserializer.readValue();
  }
}

extension JSonBinaryUtilEx on String {
  T? decodeType<T>() {
    return decode()?.asType<T>();
  }

  Object? decode() {
    return parseJsonString(this);
  }
}
