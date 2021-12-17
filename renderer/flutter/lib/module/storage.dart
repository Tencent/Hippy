import '../adapter.dart';
import '../common.dart';
import '../engine.dart';
import '../util.dart';
import 'module.dart';
import 'promise.dart';

class StorageModule extends VoltronNativeModule {
  StorageAdapter? _storageAdapter;
  static const String storageModuleName = "StorageModule";
  static const String funcMultiGet = "multiGet";
  static const String funcMultiSet = "multiSet";
  static const String funcMultiRemove = "multiRemove";
  static const String funcGetAllKeys = "getAllKeys";

  StorageModule(EngineContext context) : super(context) {
    _storageAdapter = context.globalConfigs.storageAdapter;
  }

  @VoltronMethod(funcMultiGet)
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

  @VoltronMethod(funcMultiSet)
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

  @VoltronMethod(funcMultiRemove)
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

  @VoltronMethod(funcGetAllKeys)
  bool getAllKeys(final JSPromise promise) {
    LogUtils.i('StorageModule', funcGetAllKeys);
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
        funcMultiGet: multiGet,
        funcMultiSet: multiSet,
        funcMultiRemove: multiRemove,
        funcGetAllKeys: getAllKeys
      };

  @override
  String get moduleName => storageModuleName;
}
