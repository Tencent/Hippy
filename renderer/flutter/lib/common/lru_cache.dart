import 'dart:collection';

class LruCache<K, V> {
  final LinkedHashMap<K, V> _map;

  int _size = 0;
  final int _maxSize;

  LruCache(int maxSize)
      // ignore: prefer_collection_literals
      : _map = LinkedHashMap<K, V>(),
        _maxSize = maxSize;

  V? get(K key) {
    assert(key != null);
    var mapValue = _map[key];
    if (mapValue != null) {
      // dart的LinkedHashMap是按照插入顺序排队的，为了符合lru cache要求，这里在get的时候重新插入元素，保证最近使用的最优先
      _map.remove(key);
      _map[key] = mapValue;
      return mapValue;
    } else {}

    return null;
  }

  V? put(K key, V value) {
    assert(key != null && value != null);
    V? previous;
    _size += _safeSizeOf(key, value);
    if (_map.containsKey(key)) {
      previous = _map[key];
      _size -= _safeSizeOf(key, previous);
    }
    _map[key] = value;

    trimToSize(_maxSize);
    return previous;
  }

  int _safeSizeOf(K key, V? value) {
    var result = sizeOf(key, value);
    assert(result >= 0);
    return result;
  }

  int sizeOf(K key, V? value) {
    return 1;
  }

  int get size => _size;

  void evictAll() => trimToSize(-1);

  void trimToSize(int maxSize) {
    while (true) {
      K key;
      V value;

      assert(size >= 0 && (_map.isNotEmpty || size == 0));

      if (size <= maxSize) {
        break;
      }

      MapEntry<K, V>? toEvict;
      for (var entry in _map.entries) {
        toEvict = entry;
      }

      if (toEvict == null) {
        break;
      }

      key = toEvict.key;
      value = toEvict.value;
      _map.remove(key);
      _size -= _safeSizeOf(key, value);
    }
  }
}
