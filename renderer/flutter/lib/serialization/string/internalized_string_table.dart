import 'dart:collection';
import 'dart:typed_data';

import '../../common.dart';
import 'direct_string_table.dart';
import 'string_encoding.dart';
import 'string_location.dart';
import 'string_table.dart';

class InternalizedStringTable extends DirectStringTable {
  // region key
  static final int _kMaxKeyCalcLength = 32;
  static final int _kKeyTableSize = 2 * 1024;
  static final List<String?> _kKeyTable = List.filled(_kKeyTableSize, null);

  // region value - local
  static const int _kValueCacheSize = 32;
  final LruCache<int, String> _valueCache = LruCache(_kValueCacheSize);

  static final List<int> kBase64ImgHeader = "data:image".codeUnits;

  static const String kImgUrlPropName = "uri";
  static const String kImgSrcPropName = "src";
  static const String kImageSourcePropName = "source";

  final Map<String, List<int>> _cacheablesProperty = {
    kImgUrlPropName: kBase64ImgHeader,
    kImgSrcPropName: kBase64ImgHeader,
    kImageSourcePropName: kBase64ImgHeader
  };

  static int _hashCodeOfBuffer(ByteData byteData) {
    var hash = 5381;
    for (var i = 0, j = byteData.lengthInBytes; i < j; i++) {
      hash = ((hash << 5) + hash) + byteData.getUint8(i);
    }
    return hash;
  }

  static int _stringHash(ByteData byteData) {
    var h = 0;
    for (var i = 0, j = byteData.lengthInBytes; i < j; i++) {
      h = 31 * h + byteData.getUint8(i);
    }
    return h;
  }

  static bool _equals(
      ByteData byteData, StringEncoding encoding, String cachedString) {
    var bytesPerCharacter = encoding == StringEncoding.utf16Le ? 2 : 1;
    var count = cachedString.length;
    // fast negative check
    if (byteData.lengthInBytes / bytesPerCharacter != count) {
      return false;
    }

    for (var i = 0; i < count; i++) {
      // MAX_KEY_CALC_LENGTH set to 32, use charAt method to iterate the chars in a String has more efficient
      var c = cachedString[i].codeUnits.first;
      if (byteData.getUint8(i) != c ||
          (bytesPerCharacter == 2 && byteData.getUint8(i + 1) != (c >> 8))) {
        return false;
      }
    }

    return true;
  }

  String _lookupKey(
      ByteData byteData, StringEncoding encoding, StringLocation location) {
    if (byteData.lengthInBytes > _kMaxKeyCalcLength ||
        encoding == StringEncoding.utf8) {
      return super.lookup(byteData, encoding, location, null);
    }

    var hashCode = _hashCodeOfBuffer(byteData);
    var hashIndex = (_kKeyTableSize - 1) & hashCode;
    var internalized = _kKeyTable[hashIndex];
    if (internalized != null && _equals(byteData, encoding, internalized)) {
      return internalized;
    }
    internalized = super.lookup(byteData, encoding, location, null);
    _kKeyTable[hashIndex] = internalized;
    return internalized;
  }

  String _lookupValue(ByteData byteData, StringEncoding encoding,
      StringLocation location, Object? relatedKey) {
    if (relatedKey is String) {
      var valuePrefix = _cacheablesProperty[relatedKey];
      if (valuePrefix != null) {
        var cacheables = true;

        for (var i = 0; i < valuePrefix.length; i++) {
          if (valuePrefix[i] != byteData.getUint8(i)) {
            cacheables = false;
            break;
          }
        }

        String? value;
        var hashCode = -1;
        if (cacheables) {
          hashCode = _stringHash(byteData);
          value = _valueCache.get(hashCode);
        }

        if (value == null) {
          value = super.lookup(byteData, encoding, location, relatedKey);
          if (cacheables) {
            _valueCache.put(hashCode, value);
          }
        }
        return value;
      }
    }

    return super.lookup(byteData, encoding, location, relatedKey);
  }

  @override
  String lookup(ByteData byteData, StringEncoding encoding,
      StringLocation location, Object? relatedKey) {
    switch (location) {
      case StringLocation.objectKey:
      case StringLocation.denseArrayKey:
      case StringLocation.sparseArrayKey:
        {}
        return _lookupKey(byteData, encoding, location);
      case StringLocation.objectValue:
      case StringLocation.denseArrayItem:
      case StringLocation.sparseArrayItem:
      case StringLocation.mapValue:
        return _lookupValue(byteData, encoding, location, relatedKey);
      case StringLocation.errorMessage:
      case StringLocation.errorStack:
      case StringLocation.regexp:
      case StringLocation.setItem:
      case StringLocation.topLevel:
        return super.lookup(byteData, encoding, location, relatedKey);
      case StringLocation.eVoid:
        return "";
      default:
        throw ArgumentError("lookup expected location : $location");
    }
  }

  @override
  void release() {
    _valueCache.evictAll();
    super.release();
  }
}
