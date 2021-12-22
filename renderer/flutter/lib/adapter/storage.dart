import 'dart:math';

import 'package:sqflite/sqflite.dart';

import '../common.dart';
import '../util.dart';

typedef StorageCallback = void Function(
    bool success, Object data, String errorMsg);

class StorageAdapter with Destroyable {
  static final int kMaxSqlKeys = 999;
  late SQLiteHelper _sqLiteHelper;

  //
  // Query value of the database
  // @param keys
  // @param callback
  //
  StorageAdapter() {
    _sqLiteHelper = SQLiteHelper();
  }

  Future<List<StorageKeyValue>?> multiGet(VoltronArray keys) async {
    var database = await _sqLiteHelper.getDatabase();
    if (database == null) {
      throw 'Database Error';
    }
    var columns = <String>[SQLiteHelper.kColumnKey, SQLiteHelper.kColumnValue];
    var finalData = <dynamic>[];
    var resultList = <StorageKeyValue>[];
    StorageKeyValue kv;
    try {
      // 批量获取 一次性最多获取MAX_SQL_KEYS条
      for (var keyStart = 0; keyStart < keys.size(); keyStart += kMaxSqlKeys) {
        var keyCount = min(keys.size() - keyStart, kMaxSqlKeys);
        var args = <String>[];
        for (var i = 0; i < keyCount; i++) {
          args.add(keys.get(keyStart + i));
        }
        var batch = database.batch();
        for (var arg in args) {
          batch.query(_sqLiteHelper.getTableName(),
              columns: columns,
              where: '${SQLiteHelper.kColumnKey} = ?',
              whereArgs: [arg]);
        }
        List<dynamic> result = await batch.commit();
        finalData.addAll(result);
      }
      // 将结果封装一下 以map的形式返回
      for (List list in finalData) {
        for (Map<String, dynamic> map in list) {
          kv = StorageKeyValue(
              map[SQLiteHelper.kColumnKey], map[SQLiteHelper.kColumnValue]);
          resultList.add(kv);
        }
      }
      return resultList;
    } catch (e) {
      LogUtils.e('flutterRender', e.toString());
      return null;
    } finally {
      //todo 一些关闭操作
    }
  }

  //
  // Insert value into the database
  // @param keyValues
  // @param callback
  //
  Future<void> multiSet(List<StorageKeyValue> keyValues) async {
    var database = await _sqLiteHelper.getDatabase();
    if (database == null) {
      throw 'Database Error';
    }
    try {
      // 事务的形式进行批量插入，性能问题待测试
      await database.transaction((txn) async {
        String sql;
        for (var keyValue in keyValues) {
          sql =
              "INSERT OR REPLACE INTO ${_sqLiteHelper.getTableName()} VALUES ('${keyValue.key}','${keyValue.value}');";
          await txn.execute(sql);
        }
      });
      return;
    } catch (e) {
      LogUtils.e('flutterRender', e.toString());
    } finally {
      //todo 一些关闭操作
    }
  }

  //
  // Remove value from the database
  // @param keys
  // @param callback
  //
  Future<List<dynamic>?> multiRemove(VoltronArray keys) async {
    var database = await _sqLiteHelper.getDatabase();
    if (database == null) {
      throw 'Database Error';
    }
    try {
      var resultList = <dynamic>[];
      // 批量移除，最多一次性移除MAX_SQL_KEYS行
      for (var keyStart = 0; keyStart < keys.size(); keyStart += kMaxSqlKeys) {
        var keyCount = min(keys.size() - keyStart, kMaxSqlKeys);
        var args = <String>[];
        for (var i = 0; i < keyCount; i++) {
          args.add(keys.get(keyStart + i));
        }
        var batch = database.batch();
        for (var arg in args) {
          batch.delete(_sqLiteHelper.getTableName(),
              where: '${SQLiteHelper.kColumnKey} = ?', whereArgs: [arg]);
        }
        List<dynamic> result = await batch.commit();
        resultList.addAll(result);
      }
      return resultList;
    } catch (e) {
      LogUtils.e('flutterRender', e.toString());
      return null;
    } finally {}
  }

  Future<VoltronArray?> getAllKeys() async {
    var database = await _sqLiteHelper.getDatabase();
    if (database == null) {
      throw 'Database Error';
    }
    try {
      var resultList = VoltronArray();
      dynamic result = await database.query(_sqLiteHelper.getTableName(),
          columns: [SQLiteHelper.kColumnKey]);
      for (Map<String, dynamic> keyMap in result) {
        resultList.push(keyMap[SQLiteHelper.kColumnKey]);
      }
      return resultList;
    } catch (e) {
      LogUtils.e('flutterRender', e.toString());
      return null;
    } finally {}
  }

  @override
  void destroy() {
    _sqLiteHelper.destroy();
  }
}

class StorageKeyValue {
  final String key;
  final String value;

  const StorageKeyValue(this.key, this.value);
}

class SQLiteHelper {
  static final String kColumnKey = "key";
  static final String kColumnValue = "value";
  static final String kTableStorage = "Voltron_engine_storage";
  static final String kDatabaseName = "VoltronStorage";
  static final int kDatabaseVersion = 1;
  static final String kStatementCreateTable =
      "CREATE TABLE IF NOT EXISTS $kTableStorage($kColumnKey TEXT PRIMARY KEY , $kColumnValue TEXT NOT NULL,UNIQUE($kColumnValue))";
  Database? _db;

  SQLiteHelper();

  Future<Database> open(String path) async {
    var db =
        await openDatabase(path, version: kDatabaseVersion, onCreate: onCreate);
    return db;
  }

  Future<void> onCreate(Database db, int version) async {
    db.execute(kStatementCreateTable);
  }

  void onUpgrade(Database db, int oldVersion, int newVersion) {
    if (oldVersion != newVersion) {
      deleteDatabase();
      onCreate(db, newVersion);
    }
  }

  Future<Database?> getDatabase() async {
    await ensureDatabase();
    return _db;
  }

  String getTableName() {
    return kTableStorage;
  }

  Future<void> ensureDatabase() async {
    var db = _db;
    if (db != null && db.isOpen) {
      return;
    }

    _db = await open(kDatabaseName);
    db = _db;
    if (db != null) {
      List<Map>? result = await db.rawQuery(
          "SELECT DISTINCT tbl_name FROM sqlite_master WHERE tbl_name = '$kTableStorage'",
          null);
      if (result.isNotEmpty) {
        return;
      }
      db.execute(kStatementCreateTable);
    }
  }

  void deleteDatabase() {}

  void destroy() {
    var db = _db;
    if (db != null && db.isOpen) {
      db.close();
      _db = null;
    }
  }
}
