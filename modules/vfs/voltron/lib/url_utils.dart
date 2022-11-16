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

const _kPrefixFile = 'file://';
const _kPrefixAssets = 'assets://';
const _kPrefixHttp = 'http://';
const _kPrefixHttps = 'https://';

bool isHttpUrl(String url) {
  return url.isNotEmpty && url.substring(0, _kPrefixHttp.length).toLowerCase() == _kPrefixHttp;
}

bool isHttpsUrl(String url) {
  return url.isNotEmpty && url.substring(0, _kPrefixHttps.length).toLowerCase() == _kPrefixHttps;
}

bool isFileUrl(String url) {
  return url.isNotEmpty && url.substring(0, _kPrefixFile.length).toLowerCase() == _kPrefixFile;
}

String splitFileName(String url) {
  if (isFileUrl(url)) {
    return url.substring(_kPrefixFile.length);
  }
  return '';
}

bool isAssetsUrl(String url) {
  return url.isNotEmpty && url.substring(0, _kPrefixAssets.length).toLowerCase() == _kPrefixAssets;
}

String splitAssetsName(String url) {
  if (isAssetsUrl(url)) {
    return url.substring(_kPrefixAssets.length);
  }
  return '';
}

bool isWebUrl(String url) {
  return isHttpUrl(url) || isHttpsUrl(url);
}
