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

import 'dart:typed_data';

enum FetchResultCode {
  ok,
  openLocalFileError,
  notSupportSyncRemoteError,
  unknownSchemeError,
  remoteRequestFailedError,
  ffiError,
  encodeParamsError,
  invalidResultError,
  unknownError,
}

enum RequestFrom {
  native,
  local
}

FetchResultCode parseResultCode(int code) {
  switch (code) {
    case 0:
      return FetchResultCode.ok;
    case 1:
    case 2:
      return FetchResultCode.unknownSchemeError;
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
    case 9:
      return FetchResultCode.remoteRequestFailedError;
    default:
      return FetchResultCode.unknownError;
  }
}

typedef FetchResourceCallback = Function(ResourceDataHolder holder);

class ResourceDataHolder {
  final String url;
  final int nativeRequestId;
  int index = -1;
  Uint8List? buffer;
  Map<String, String>? requestHeaders;
  Map<String, String>? responseHeaders;
  FetchResourceCallback? callback;
  RequestFrom requestFrom = RequestFrom.local;
  FetchResultCode resultCode = FetchResultCode.ok;
  String errorMsg = "";

  ResourceDataHolder({
    required this.url,
    this.requestFrom = RequestFrom.local,
    this.requestHeaders,
    this.callback,
    this.nativeRequestId = -1
  });
}
