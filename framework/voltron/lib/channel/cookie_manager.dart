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

import 'dart:io';

import 'package:cookie_jar/cookie_jar.dart';
import 'package:webview_cookie_manager/webview_cookie_manager.dart';

CookieJar cookieJar = CookieJar();

enum CookieDelegateType {
  dio, // dio_cookie_manager
  native, // webview_cookie_manager
  origin // 自定义cookie_manager
}

class CookieManager {
  static final CookieManager _singleton = CookieManager();
  CookieDelegate? _delegate;

  static CookieManager getInstance() {
    return _singleton;
  }

  void setCookieDelegate(CookieDelegateType type, {CookieDelegate? originDelegate}) {
    switch(type) {
      case CookieDelegateType.dio:
        _delegate = _CookieJarDelegateImpl();
        break;
      case CookieDelegateType.native:
        _delegate = _WebviewCookieDelegateImpl();
        break;
      case CookieDelegateType.origin:
        _delegate = originDelegate??  _CookieJarDelegateImpl();
        break;
    }
  }

  void setCookie(String url, List<Cookie> cookies) {
    _delegate?.setCookie(url, cookies);
  }

  Future<List<Cookie>> getCookie(String url) {
    return _delegate?.getCookie(url) ?? Future.value([]);
  }
}

mixin CookieDelegate {
  void setCookie(String url, List<Cookie> cookies);

  Future<List<Cookie>> getCookie(String url);
}

class _CookieJarDelegateImpl with CookieDelegate {
  CookieJar cookieJar = CookieJar();

  @override
  void setCookie(String url, List<Cookie> cookies) {
    cookieJar.saveFromResponse(Uri.parse(url), cookies);
  }

  @override
  Future<List<Cookie>> getCookie(String url) {
    return cookieJar.loadForRequest(Uri.parse(url));
  }

}

class _WebviewCookieDelegateImpl with CookieDelegate {
  final cookieManager = WebviewCookieManager();

  @override
  void setCookie(String url, List<Cookie> cookies) {
    cookieManager.setCookies(cookies, origin: url);
  }

  @override
  Future<List<Cookie>> getCookie(String url) {
    return cookieManager.getCookies(url);
  }
}
