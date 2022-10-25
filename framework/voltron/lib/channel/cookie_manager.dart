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
import 'package:dio/dio.dart';
import 'package:webview_cookie_manager/webview_cookie_manager.dart';

enum CookieDelegateType {
  dio, // dio_cookie_manager
  native, // webview_cookie_manager
  origin // 自定义cookie_manager
}

class CookieManager extends Interceptor with CookieDelegate {
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

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    getCookie(options.uri.toString()).then((cookies) {
      var cookie = _getCookies(cookies);
      if (cookie.isNotEmpty) {
        options.headers[HttpHeaders.cookieHeader] = cookie;
      }
      handler.next(options);
    }).catchError((e, stackTrace) {
      var err = DioError(requestOptions: options, error: e);
      err.stackTrace = stackTrace;
      handler.reject(err, true);
    });
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    _saveCookies(response)
        .then((_) => handler.next(response))
        .catchError((e, stackTrace) {
      var err = DioError(requestOptions: response.requestOptions, error: e);
      err.stackTrace = stackTrace;
      handler.reject(err, true);
    });
  }

  @override
  void onError(DioError err, ErrorInterceptorHandler handler) {
    if (err.response != null) {
      _saveCookies(err.response!)
          .then((_) => handler.next(err))
          .catchError((e, stackTrace) {
        var _err = DioError(
          requestOptions: err.response!.requestOptions,
          error: e,
        );
        _err.stackTrace = stackTrace;
        handler.next(_err);
      });
    } else {
      handler.next(err);
    }
  }

  Future<void> _saveCookies(Response response) async {
    var cookies = response.headers[HttpHeaders.setCookieHeader];

    if (cookies != null) {
      await setCookie(
        response.requestOptions.uri.toString(),
        cookies.map((str) => Cookie.fromSetCookieValue(str)).toList(),
      );
    }
  }

  String _getCookies(List<Cookie> cookies) {
    return cookies.map((cookie) => '${cookie.name}=${cookie.value}').join('; ');
  }

  @override
  Future setCookie(String url, List<Cookie> cookies) {
    return _delegate?.setCookie(url, cookies) ?? Future.value();
  }

  @override
  Future<List<Cookie>> getCookie(String url) {
    return _delegate?.getCookie(url) ?? Future.value([]);
  }
}

mixin CookieDelegate {
  Future setCookie(String url, List<Cookie> cookies);

  Future<List<Cookie>> getCookie(String url);
}

class _CookieJarDelegateImpl with CookieDelegate {
  CookieJar cookieJar = CookieJar();

  @override
  Future setCookie(String url, List<Cookie> cookies) {
    return cookieJar.saveFromResponse(Uri.parse(url), cookies);
  }

  @override
  Future<List<Cookie>> getCookie(String url) {
    return cookieJar.loadForRequest(Uri.parse(url));
  }

}

class _WebviewCookieDelegateImpl with CookieDelegate {
  final cookieManager = WebviewCookieManager();

  @override
  Future setCookie(String url, List<Cookie> cookies) {
    return cookieManager.setCookies(cookies, origin: url);
  }

  @override
  Future<List<Cookie>> getCookie(String url) {
    return cookieManager.getCookies(url);
  }
}
