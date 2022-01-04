import 'dart:typed_data';

import 'voltron_map.dart';

class VoltronArray {
  final List<Object?> _data = [];

  int size() => _data.length;

  T? get<T>(int index) {
    if (index >= 0 && index < _data.length) {
      dynamic obj = _data[index];
      if (obj is T) {
        return obj;
      }
    }

    return null;
  }

  VoltronArray? getArray(int index) {
    if (_data.length > index) {
      Object value = get(index);
      if (value is VoltronArray) {
        return value;
      }
    }
    return null;
  }

  String? getString(int index) {
    if (_data.length > index) {
      return get(index).toString();
    }
    return null;
  }

  void push<T>(T obj) => _data.add(obj);

  void pushNull() => _data.add(null);

  void clear() => _data.clear();

  List<dynamic> get data => _data;

  /// 获取数组中倒数第n项元素(order: 第n项)(默认：order = 1，返回倒数第一项的元素)
  T? getLastItemByOrder<T>([int order = 1]) {
    return get<T>(size() - order);
  }

  void set<T>(int index, T obj) {
    _data[index] = obj;
  }

  List<dynamic> toList() {
    return data.map((item) {
      if (item is VoltronMap) {
        return item.toMap();
      } else if (item is VoltronArray) {
        return item.toList();
      }
      return item;
    }).toList();
  }

  VoltronArray();

  VoltronArray.copy(VoltronArray old) {
    for (final value in old._data) {
      if (value is VoltronMap) {
        push(VoltronMap.copy(value));
      } else if (value is VoltronArray) {
        push(VoltronArray.copy(value));
      } else {
        push(value);
      }
    }
  }

  VoltronArray.fromList(List list) {
    for (final value in list) {
      if (value is Map) {
        push(VoltronMap.fromMap(value));
      } else if (value is List) {
        push(VoltronArray.fromList(value));
      } else {
        push(value);
      }
    }
  }

  @override
  String toString() {
    return _data.toString();
  }

  @override
  bool operator ==(Object other) {
    if (!(other is VoltronArray)) {
      return false;
    }

    var flag = true;
    for (var index = 0; index < _data.length; index++) {
      if (get(index) != other.get(index)) {
        flag = false;
        break;
      }
    }
    return flag;
  }

  @override
  int get hashCode {
    var code = 0;
    for (final item in _data) {
      code = code | item.hashCode;
    }
    return code;
  }
}

String bufferToString(Uint8List byteBuffer) {
  var buffer = StringBuffer();
  if (byteBuffer.isNotEmpty) {
    for (var item in byteBuffer) {
      buffer.write("0x${item.toRadixString(16)} ");
    }
  }
  return buffer.toString();
}
