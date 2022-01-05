import '../adapter.dart';
import '../common.dart';
import '../engine.dart';
import '../util.dart';
import 'module.dart';
import 'promise.dart';

class StorageModule extends VoltronNativeModule {
  StorageAdapter? _storageAdapter;
  static const String kStorageModuleName = "StorageModule";
  static const String kFuncMultiGet = "multiGet";
  static const String kFuncMultiSet = "multiSet";
  static const String kFuncMultiRemove = "multiRemove";
  static const String kFuncGetAllKeys = "getAllKeys";

  StorageModule(EngineContext context) : super(context) {
    _storageAdapter = context.globalConfigs.storageAdapter;
  }

  @VoltronMethod(kFuncMultiGet)
  bool multiGet(VoltronArray keys, final JSPromise promise) {
    if (keys.size() <= 0) {
      promise.reject("Invalid Key");
      return true;
    }
    var storageAdapter = _storageAdapter;
    if (storageAdapter == null) {
      promise.reject("Database Null");
      return true;
    }
    storageAdapter.multiGet(keys).then((result) {
      if (result == null || result.isEmpty) {
        promise.resolve(null);
        return;
      }
      var data = VoltronArray();
      VoltronArray item;
      for (var kv in result) {
        item = VoltronArray();
        item.push(kv.key);
        item.push(kv.value);
        data.push(item);
      }
      promise.resolve(data);
    }).catchError((e) async {
      promise.reject(e);
    });
    return true;
  }

  @VoltronMethod(kFuncMultiSet)
  bool multiSet(VoltronArray keyValues, final JSPromise promise) {
    if (keyValues.size() <= 0) {
      promise.reject("Invalid keyValues");
      return true;
    }
    var storageAdapter = _storageAdapter;
    if (storageAdapter == null) {
      promise.reject("Database Null");
      return true;
    }
    var handleData = <StorageKeyValue>[];
    StorageKeyValue keyValue;
    VoltronArray array;
    String? key;
    String? value;
    for (var idx = 0; idx < keyValues.size(); idx++) {
      array = keyValues.get(idx);

      if (array.size() != 2) {
        promise.reject("Invalid Value");
        return true;
      }
      key = array.getString(0);
      if (key == null) {
        promise.reject("Invalid key");
        return true;
      }
      value = array.getString(1);
      if (value == null) {
        promise.reject("Invalid Value");
        return true;
      }
      keyValue = StorageKeyValue(key, value);
      handleData.add(keyValue);
    }
    storageAdapter.multiSet(handleData).then((data) {
      promise.resolve("success");
    }).catchError((e) async {
      promise.reject(e);
    });
    return true;
  }

  @VoltronMethod(kFuncMultiRemove)
  bool multiRemove(VoltronArray keys, final JSPromise promise) {
    if (keys.size() <= 0) {
      promise.reject("Invalid Key");
      return true;
    }
    if (_storageAdapter == null) {
      promise.reject("Database Null");
      return true;
    }
    _storageAdapter?.multiRemove(keys).then((data) {
      promise.resolve("success");
    }).catchError((e) async {
      promise.reject(e);
    });
    return true;
  }

  @VoltronMethod(kFuncGetAllKeys)
  bool getAllKeys(final JSPromise promise) {
    LogUtils.i('StorageModule', kFuncGetAllKeys);
    var storageAdapter = _storageAdapter;
    if (storageAdapter == null) {
      promise.reject("Database Null");
      return true;
    }
    storageAdapter
        .getAllKeys()
        .then(promise.resolve)
        .catchError(promise.reject);
    return true;
  }

  @override
  Map<String, Function> get extraFuncMap => {
        kFuncMultiGet: multiGet,
        kFuncMultiSet: multiSet,
        kFuncMultiRemove: multiRemove,
        kFuncGetAllKeys: getAllKeys
      };

  @override
  String get moduleName => kStorageModuleName;
}
