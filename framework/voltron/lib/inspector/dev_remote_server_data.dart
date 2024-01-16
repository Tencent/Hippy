//
// Tencent is pleased to support the open source community by making
// Hippy available.
//
// Copyright (C) 2022 THL A29 Limited, a Tencent company.
// All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

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
        _path = tempPath.substring(1); // remove first character /
        int index = _path?.indexOf("/") ?? -1;
        if (index >= 0) {
          _versionId = _path?.substring(0, index);
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
