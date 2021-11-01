import 'dart:collection';

import 'voltron_array.dart';

class VoltronMap {
  final Map<String, Object?> _data = {};

  VoltronMap();

  VoltronMap.copy(VoltronMap? old) {
    if (old == null) {
      return;
    }

    for (final entry in old.entrySet()) {
      if (entry.value is VoltronMap) {
        push(entry.key, VoltronMap.copy(entry.value as VoltronMap));
      } else if (entry.value is VoltronArray) {
        push(entry.key, VoltronArray.copy(entry.value as VoltronArray));
      } else {
        push(entry.key, entry.value);
      }
    }
  }

  @override
  String toString() => _data.toString();

  bool containsKey(String key) => _data.containsKey(key);

  bool get isEmpty => keySet().isEmpty;

  int size() => _data.length;

  List<String> keySet() => _data.keys.toList();

  List<Object?> valueSet() => _data.values.toList();

  List<MapEntry<String, Object?>> entrySet() => _data.entries.toList();

  Map<String, Object?> get data => _data;

  T? get<T>(String key) {
    dynamic obj = _data[key];
    return obj is T ? obj : null;
  }

  /// 根据keyList获取含有指定key集合的VoltronMap
  VoltronMap getByKeyList(List<String> keyList) {
    final map = VoltronMap();
    for (final key in _data.keys) {
      if (keyList.contains(key)) {
        map.push(key, _data[key]);
      }
    }

    return map;
  }

  /// 使用新的key替换旧的key，value保持不变
  void replaceKey(String newKey, String oldKey) {
    final value = _data[oldKey];
    if (value == null) {
      return;
    }

    _data[newKey] = value;
    _data.remove(oldKey);
  }

  void remove(String key) => _data.remove(key);

  void removeAll(List<String> keyList) {
    for (final key in keyList) {
      remove(key);
    }
  }

  bool isNull(String key) => _data[key] == null;

  void pushNull(String key) => _data[key] = null;

  void push<T>(String key, T value) => _data[key] = value;

  void pushAll(VoltronMap? map) {
    if (null != map) {
      _data.addAll(map._data);
    }
  }

  void pushIfNotExist<T>(String key, T value) {
    final data = _data[key];
    if (data != null) {
      return;
    }

    push<T>(key, value);
  }

  void clear() {
    _data.clear();
  }

  @override
  bool operator ==(Object other) {
    if (!(other is VoltronMap)) {
      return false;
    }

    var flag = true;
    for (final key in _data.keys) {
      if (get(key) != other.get(key)) {
        flag = false;
        break;
      }
    }
    return flag;
  }

  @override
  int get hashCode {
    var code = 0;
    for (final value in _data.values) {
      code = code | value.hashCode;
    }
    return code;
  }

  Map<String, dynamic> toMap() {
    var ret = <String, dynamic>{};
    for (final entry in entrySet()) {
      if (entry.value is VoltronMap) {
        ret[entry.key] = (entry.value as VoltronMap).toMap();
      } else if (entry.value is VoltronArray) {
        ret[entry.key] = (entry.value as VoltronArray).toList();
      } else {
        ret[entry.key] = entry.value;
      }
    }
    return ret;
  }
}
