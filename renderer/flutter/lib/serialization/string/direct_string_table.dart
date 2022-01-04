import 'dart:convert';
import 'dart:typed_data';
// ignore: import_of_legacy_library_into_null_safe
import 'package:utf/utf.dart';
import 'string_encoding.dart';
import 'string_location.dart';
import 'string_table.dart';

class DirectStringTable extends StringTable {
  @override
  String lookup(ByteData byteData, StringEncoding encoding,
      StringLocation location, Object? relatedKey) {
    if (location == StringLocation.eVoid) {
      return "";
    }

    var dataList = byteData.buffer.asUint8List();
    if (encoding == StringEncoding.latin) {
      // iso-8896-1标准
      return Latin1Codec().decode(dataList);
    } else if (encoding == StringEncoding.utf16Le) {
      // utf16-le标准
      return decodeUtf16le(dataList);
    } else {
      return Utf8Codec().decode(dataList);
    }
  }

  @override
  void release() {}
}
