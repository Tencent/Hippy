import 'dart:math';

import 'package:sqflite/sqflite.dart';

import '../common/destroy.dart';
import '../common/voltron_array.dart';
import '../util/log_util.dart';

typedef StorageCallback = void Function(
    bool success, Object data, String errorMsg);

class StorageAdapter with Destroyable {
  static final int maxSqlKeys = 999;
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
    var columns = <String>[SQLiteHelper.columnKey, SQLiteHelper.columnValue];
    var finalData = <dynamic>[];
    var resultList = <StorageKeyValue>[];
    StorageKeyValue kv;
    try {
      // 批量获取 一次性最多获取MAX_SQL_KEYS条
      for (var keyStart = 0; keyStart < keys.size(); keyStart += maxSqlKeys) {
        var keyCount = min(keys.size() - keyStart, maxSqlKeys);
        var args = <String>[];
        for (var i = 0; i < keyCount; i++) {
          args.add(keys.get(keyStart + i));
        }
        var batch = database.batch();
        for (var arg in args) {
          batch.query(_sqLiteHelper.getTableName(),
              columns: columns,
              where: '${SQLiteHelper.columnKey} = ?',
              whereArgs: [arg]);
        }
        List<dynamic> result = await batch.commit();
        finalData.addAll(result);
      }
      // 将结果封装一下 以map的形式返回
      for (List list in finalData) {
        for (Map<String, dynamic> map in list) {
          kv = StorageKeyValue(
              map[SQLiteHelper.columnKey], map[SQLiteHelper.columnValue]);
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
      for (var keyStart = 0; keyStart < keys.size(); keyStart += maxSqlKeys) {
        var keyCount = min(keys.size() - keyStart, maxSqlKeys);
        var args = <String>[];
        for (var i = 0; i < keyCount; i++) {
          args.add(keys.get(keyStart + i));
        }
        var batch = database.batch();
        for (var arg in args) {
          batch.delete(_sqLiteHelper.getTableName(),
              where: '${SQLiteHelper.columnKey} = ?', whereArgs: [arg]);
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
          columns: [SQLiteHelper.columnKey]);
      for (Map<String, dynamic> keyMap in result) {
        resultList.push(keyMap[SQLiteHelper.columnKey]);
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
  static final String columnKey = "key";
  static final String columnValue = "value";
  static final String tableStorage = "Voltron_engine_storage";
  static final String databaseName = "VoltronStorage";
  static final int databaseVersion = 1;
  static final String statementCreateTable =
      "CREATE TABLE IF NOT EXISTS $tableStorage($columnKey TEXT PRIMARY KEY , $columnValue TEXT NOT NULL,UNIQUE($columnValue))";
  Database? _db;

  SQLiteHelper();

  Future<Database> open(String path) async {
    var db =
        await openDatabase(path, version: databaseVersion, onCreate: onCreate);
    return db;
  }

  Future<void> onCreate(Database db, int version) async {
    db.execute(statementCreateTable);
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
    return tableStorage;
  }

  Future<void> ensureDatabase() async {
    var db = _db;
    if (db != null && db.isOpen) {
      return;
    }

    _db = await open(databaseName);
    db = _db;
    if (db != null) {
      List<Map>? result = await db.rawQuery(
          "SELECT DISTINCT tbl_name FROM sqlite_master WHERE tbl_name = '$tableStorage'",
          null);
      if (result.isNotEmpty) {
        return;
      }
      db.execute(statementCreateTable);
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
