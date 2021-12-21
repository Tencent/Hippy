import 'dart:convert';

import 'package:sprintf/sprintf.dart';

import '../common.dart';
import 'log_util.dart';

extension StringEx on String {
  String replaceKey() {
    return toUpperCase().replaceAll("-", "_");
  }
}

bool isEmpty(String? value) {
  return value == null || value.isEmpty;
}

String objectToJson(Object obj) {
  if (obj is String) {
    if (isEmpty(obj)) {
      return "\"\"";
    } else {
      return stringFormat(obj);
    }
  } else if (obj is num) {
    return obj.toString();
  } else if (obj is VoltronArray) {
    var sb = StringBuffer();
    sb.write("[");
    var length = obj.size();
    for (var i = 0; i < length; i++) {
      sb.write(objectToJson(obj.get(i)));
      if (i < length - 1) {
        sb.write(",");
      }
    }
    sb.write("]");
    return sb.toString();
  } else if (obj is VoltronMap) {
    var sb = StringBuffer();
    sb.write("{");
    dynamic keys = obj.keySet();
    var i = 0;
    for (String key in keys) {
      sb.write("\"$key\":");
      sb.write(objectToJson(obj.get(key)));
      if (i < obj.size() - 1) {
        sb.write(",");
      }
      i++;
    }
    sb.write("}");
    return sb.toString();
  } else if (obj is bool) {
    return obj.toString();
  }
  return "\"\"";
}

String stringFormat(String value) {
  var sb = StringBuffer();
  sb.write("\"");
  for (var i = 0; i < value.length; i++) {
    var char = value[i];
    switch (char) {
      case '"':
      case '\\':
      case '/':
        sb.write('\\$char');
        break;

      case '\t':
        sb.write("\\t");
        break;

      case '\b':
        sb.write("\\b");
        break;

      case '\n':
        sb.write("\\n");
        break;

      case '\r':
        sb.write("\\r");
        break;

      case '\f':
        sb.write("\\f");
        break;

      default:
        var codeUnit = char.codeUnitAt(0);
        if (codeUnit <= 0x1F) {
          sb.write(sprintf("\\u%04x", codeUnit));
        } else {
          sb.write(char);
        }
        break;
    }
  }

  sb.write("\"");
  return sb.toString();
}

Object? parseJsonString(String jsonString) {
  try {
    final decodeJson = json.decode(jsonString);
    return _parseJsonObject(decodeJson);
  } catch (e) {
    LogUtils.e("string_util", "parse json string($jsonString) error($e)");
  }
  return null;
}

Object _parseJsonObject(Object object) {
  if (object is String || object is num || object is bool) {
    return object;
  } else if (object is Map) {
    var map = VoltronMap();
    object.forEach((key, value) {
      map.push(key, _parseJsonObject(value));
    });
    return map;
  } else if (object is List) {
    var array = VoltronArray();
    for (var element in object) {
      array.push(_parseJsonObject(element));
    }
    return array;
  }

  return object;
}
