import 'package:voltron_renderer/util/log_util.dart';

class DevRemoteServerData {
  static String debugUrlKey = 'debugUrl';
  String? _scheme;
  String? _host;
  String? _path;
  String? _versionId;
  String? _wsUrl;

  DevRemoteServerData(String remoteServerUrl) {
    parseUrl(remoteServerUrl);
  }

  /// parse url in remote debugging
  /// <p>url structure: http://host/versionId/index.bundle</p>
  ///
  /// @param remoteServerUrl remote debugging url
  void parseUrl(String remoteServerUrl) {
    if (remoteServerUrl == '') {
      return;
    }
    try {
      // final uri = Uri.parse('https://example.com/api/fetch?limit=10,20,30&max=100');
      final url = Uri.parse(remoteServerUrl);
      _scheme = url.scheme;
      _host = url.host;
      _path = url.path;
      int port = url.port;
      if (port > 0) {
        _host = "${_host!}:$port";
      }
      _wsUrl = url.queryParameters['debugUrl'];
      var tempPath = _path;
      if (tempPath != null && tempPath.startsWith("/")) {
        if (tempPath.startsWith("/")) {
          _path = tempPath.substring(1); // remove first character /
        }
        int index = tempPath.indexOf("/");
        if (index >= 0) {
          _versionId = tempPath.substring(0, index);
        }
      }
      LogUtils.i(
        "Hippy DevRemoteServerData",
        "parseUrl host:$_host, versionId:$_versionId",
      );
    } catch (e) {
      LogUtils.e(
        "Hippy DevRemoteServerData",
        "parseUrl error, ${e.toString()}",
      );
    }
  }

  bool isValid() {
    return _host != null &&
        _host != '' &&
        _versionId != null &&
        _versionId != '';
  }

  String? getHost() {
    return _host;
  }

  String? getVersionId() {
    return _versionId;
  }

  String? getPath() {
    return _path;
  }

  String? getScheme() {
    return _scheme;
  }

  String? getWsUrl() {
    return _wsUrl;
  }
}
