
import 'dart:async';
import 'dart:io';
import 'dart:typed_data';

import 'package:flutter/services.dart';
import 'package:voltron/adapter/http.dart';
import 'package:voltron_renderer/voltron_renderer.dart';
import 'package:voltron_vfs/voltron_vfs.dart';

class VoltronResourceLoader with ResourceLoader {
  static const _kTag = 'VoltronResourceLoader';
  final VoltronHttpAdapter _httpAdapter;

  VoltronResourceLoader(this._httpAdapter);

  @override
  void fetchResourceAsync(ResourceDataHolder holder, ProcessorCallback callback) {
    if (isWebUrl(holder.url)) {
      _loadRemoteResource(holder, (_) {
        callback.onHandleCompleted();
      });
    } else if (isFileUrl(holder.url)) {
      _loadLocalFileResource(holder).then((value) => callback.onHandleCompleted());
    } else if (isAssetsUrl(holder.url)) {
      _loadAssetsResource(holder).then((value) => callback.onHandleCompleted());
    } else {
      holder.resultCode = FetchResultCode.unknownSchemeError;
      callback.next();
    }
  }

  @override
  Future<bool> fetchResourceSync(ResourceDataHolder holder) async {
    if (isFileUrl(holder.url)) {
      await _loadLocalFileResource(holder);
      return true;
    }
    if (isAssetsUrl(holder.url)) {
      await _loadAssetsResource(holder);
      return true;
    }
    if (isWebUrl(holder.url)) {
      await _loadRemoteResourceSync(holder);
      return true;
    }

    return false;
  }


  Future _loadRemoteResourceSync(ResourceDataHolder holder) {
    var completer = Completer();
    _loadRemoteResource(holder, (_) {
      completer.complete();
    });
    return completer.future;
  }

  void _loadRemoteResource(ResourceDataHolder holder,
      FetchResourceCallback callback) {
    VoltronHttpRequest request = VoltronHttpRequest(url: holder.url);
    _httpAdapter.sendRequest(request).then((response) {
      if (response.statusCode == 200) {
        holder.buffer = Uint8List.fromList(response.data.toString().codeUnits);
        setResponseHeaderToHolder(holder, response);
      } else {
        holder.resultCode = FetchResultCode.remoteRequestFailedError;
        holder.errorMsg =
            "${"Could not connect to development server." + "URL: " + holder.url}  try to :adb reverse tcp:38989 tcp:38989 , code: ${response.statusCode}, message : ${response.statusMessage}";
        LogUtils.e(_kTag, holder.errorMsg);
      }
      callback(holder);
    });
  }

  Future _loadLocalFileResource(ResourceDataHolder holder) async {
    String fileName = splitFileName(holder.url);
    try {
      var file = File(fileName);
      if (await file.exists()) {
        holder.buffer = await file.readAsBytes();
        holder.resultCode = FetchResultCode.ok;
      } else {
        holder.resultCode = FetchResultCode.openLocalFileError;
        holder.errorMsg = 'Load ${holder.url} failed! File not existed';
        LogUtils.e(_kTag, holder.errorMsg);
      }
    } catch(e) {
      holder.resultCode = FetchResultCode.openLocalFileError;
      holder.errorMsg = 'Load ${holder.url} failed! ${e.toString()}';
      LogUtils.e(_kTag, holder.errorMsg);
    }
  }

  Future _loadAssetsResource(ResourceDataHolder holder) async {
    String assetsName = splitAssetsName(holder.url);
    try {
        holder.buffer = (await rootBundle.load(assetsName)).buffer.asUint8List();
        holder.resultCode = FetchResultCode.ok;
    } catch (e) {
      holder.resultCode = FetchResultCode.openLocalFileError;
      holder.errorMsg = 'Load ${holder.url} failed! ${e.toString()}';
      LogUtils.e(_kTag, holder.errorMsg);
    }
  }

  void setResponseHeaderToHolder(final ResourceDataHolder holder,
      VoltronHttpResponse response) {
    var rspHeaders = holder.responseHeaders??<String, String>{};

    rspHeaders["statusCode"] = response.statusCode.toString();
    Map<String, dynamic> headers = response.headerMap;
    if (headers.isEmpty) {
      holder.responseHeaders = rspHeaders;
      return;
    }
    for (var entry in headers.entries) {
      String key = entry.key;
      var value = entry.value;
      if (value is String) {
        rspHeaders[key] = value;
      } else if (value is List) {
        if (value.length == 1) {
          rspHeaders[key] = value[0].toString();
        } else {
          rspHeaders[key] = value.map((e) => e.toString()).join(';');
        }
      }
    }
    holder.responseHeaders = rspHeaders;
  }
}
