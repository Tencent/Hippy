import 'dart:async';

import 'package:dio/dio.dart';
import 'package:path_provider/path_provider.dart';

import '../bridge.dart';
import '../util.dart';

abstract class VoltronBundleLoader {
  Future<bool> load(VoltronBridgeManager bridge, Callback callback);

  String? get path;

  String? get rawPath;

  String? get bundleUniKey;

  bool get canUseCodeCache;

  String get codeCacheTag;
}

class AssetBundleLoader implements VoltronBundleLoader {
  static const String kAssetsStr = "assets://";

  final String _assetPath;

  final bool _canUseCodeCache;

  final String _codeCacheTag;

  String get assetPath => _assetPath;

  const AssetBundleLoader(String assetPath,
      {bool canUseCodeCache = false, String codeCacheTag = ''})
      : _assetPath = assetPath,
        _canUseCodeCache = canUseCodeCache,
        _codeCacheTag = codeCacheTag;

  @override
  Future<bool> load(VoltronBridgeManager bridge, Callback callback) async {
    if (isEmpty(_assetPath)) {
      return false;
    }

    var result = false;
    var watch = Stopwatch();
    watch.start();
    try {
      result = await bridge.runScriptFromAssets(
          _assetPath, canUseCodeCache, codeCacheTag, (value) {
        watch.stop();
        LogUtils.profile("runScriptFromAssets", watch.elapsedMilliseconds);
        callback(value, null);
      });
    } catch (e) {
      callback(-1, StateError(e.toString()));
    }

    return result;
  }

  @override
  String get bundleUniKey => path;

  @override
  bool get canUseCodeCache => _canUseCodeCache;

  @override
  String get codeCacheTag => _codeCacheTag;

  @override
  String get path {
    if (!_assetPath.startsWith(kAssetsStr)) {
      return kAssetsStr + _assetPath;
    } else {
      return _assetPath;
    }
  }

  @override
  String get rawPath => _assetPath;
}

class FileBundleLoader implements VoltronBundleLoader {
  static const String kFileStr = "file://";

  final String? _filePath;

  final bool _canUseCodeCache;

  final String _codeCacheTag;

  FileBundleLoader(String? filePath,
      {bool canUseCodeCache = false, String codeCacheTag = ''})
      : _filePath = filePath,
        _canUseCodeCache = canUseCodeCache,
        _codeCacheTag = codeCacheTag;

  @override
  String? get bundleUniKey => path;

  @override
  bool get canUseCodeCache => _canUseCodeCache;

  @override
  String get codeCacheTag => _codeCacheTag;

  @override
  String? get path {
    var filePath = _filePath;
    if (filePath != null && !filePath.startsWith(kFileStr)) {
      return kFileStr + filePath;
    } else {
      return filePath;
    }
  }

  @override
  String? get rawPath => _filePath;

  @override
  Future<bool> load(VoltronBridgeManager bridge, Callback callback) async {
    if (isEmpty(_filePath)) {
      return false;
    }
    var result = false;
    var watch = Stopwatch();
    watch.start();
    try {
      result = await bridge.runScriptFromFile(
          _filePath!, _filePath!, _canUseCodeCache, _codeCacheTag, (value) {
        watch.stop();
        LogUtils.profile("runScriptFromFile", watch.elapsedMilliseconds);
        callback(value, null);
      });
    } catch (e) {
      callback(-1, StateError(e.toString()));
    }

    return result;
  }
}

class HttpBundleLoader implements VoltronBundleLoader {
  static const String kFileStr = "file://";

  String? _filePath;

  final String? _url;

  final bool _canUseCodeCache;

  final String _codeCacheTag;

  HttpBundleLoader(String? url,
      {bool canUseCodeCache = false, String codeCacheTag = ''})
      : _url = url,
        _canUseCodeCache = canUseCodeCache,
        _codeCacheTag = codeCacheTag;

  @override
  String? get bundleUniKey => _url;

  @override
  bool get canUseCodeCache => _canUseCodeCache;

  @override
  String get codeCacheTag => _codeCacheTag;

  @override
  String? get path {
    var filePath = _filePath;
    if (filePath != null && !filePath.startsWith(kFileStr)) {
      return kFileStr + filePath;
    } else {
      return filePath;
    }
  }

  @override
  String? get rawPath => _url;

  @override
  Future<bool> load(VoltronBridgeManager bridge, Callback callback) async {
    var reg = RegExp(r"^https?:\/\/");
    if (_url == null || isEmpty(_url) || !reg.hasMatch(_url!)) {
      return false;
    }
    _filePath = await downloadFile(_url!);
    var result = false;
    var watch = Stopwatch();
    watch.start();
    try {
      result = await bridge.runScriptFromFile(
          _filePath!, _filePath!, _canUseCodeCache, _codeCacheTag, (value) {
        watch.stop();
        LogUtils.profile("runScriptFromFile", watch.elapsedMilliseconds);
        callback(value, null);
      });
    } catch (e) {
      callback(-1, StateError(e.toString()));
    }

    return result;
  }
}

Future<String> downloadFile(String url) async {
  var tmp = await getTemporaryDirectory();
  LogUtils.i("downloadFile", url);
  var saveFilePath = '${tmp.path}jsbundle/index.bundle.js';
  await Dio().download(url, saveFilePath);
  return saveFilePath;
}
