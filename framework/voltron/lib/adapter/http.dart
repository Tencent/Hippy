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

import 'dart:convert';
import 'dart:io';

import 'package:dio/adapter.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:system_proxy/system_proxy.dart';
import 'package:voltron_renderer/voltron_renderer.dart';

import '../channel.dart' as channel;
import '../engine.dart';
import '../module.dart';

class VoltronHttpAdapter with Destroyable {
  EngineContext? context;
  TRequestWillBeSentHook? requestWillBeSentHook;
  TResponseReceivedHook? responseReceivedHook;

  void init({
    required EngineContext context,
    TRequestWillBeSentHook? requestWillBeSentHook,
    TResponseReceivedHook? responseReceivedHook,
  }) {
    context = context;
    requestWillBeSentHook = requestWillBeSentHook;
    responseReceivedHook = responseReceivedHook;
  }

  void fetch(final VoltronMap request, final JSPromise promise) {}

  @mustCallSuper
  void sendRequest(VoltronHttpRequest request, JSPromise promise) {
    var _context = context;
    if (_context != null) {
      requestWillBeSentHook?.call(_context, request.requestId, request);
    }
  }

  @mustCallSuper
  void onSuccess(VoltronHttpRequest request, VoltronHttpResponse response, JSPromise promise) {
    var _context = context;
    if (_context != null) {
      responseReceivedHook?.call(_context, request.requestId, response);
    }
  }

  @mustCallSuper
  void onFailed(VoltronHttpRequest request, VoltronHttpResponse response, JSPromise promise) {
    var _context = context;
    if (_context != null) {
      responseReceivedHook?.call(_context, request.requestId, response);
    }
  }

  void getCookie(String url, JSPromise promise) {}

  void setCookie(String url, String keyValue, String expires, JSPromise promise) {}

  @override
  void destroy() {}
}

class DefaultHttpAdapter extends VoltronHttpAdapter {
  @override
  void fetch(final VoltronMap request, final JSPromise promise) {
    VoltronHttpRequest? httpRequest = generateHttpRequest(request, promise);
    if (httpRequest != null) {
      sendRequest(httpRequest, promise);
    }
  }

  VoltronHttpRequest? generateHttpRequest(VoltronMap request, JSPromise promise) {
    var url = request.get<String>('url') ?? '';
    final method = request.get<String>("method") ?? '';
    if (isEmpty(url) || isEmpty(method)) {
      promise.reject("no valid url for request");
      return null;
    }
    var body = request.get<String>('body') ?? '';
    var httpRequest = VoltronHttpRequest(
      url: url,
      connectTimeout: 10 * 1000,
      receiveTimeout: 10 * 1000,
      useCaches: false,
      method: method,
      body: body,
    );
    var headers = request.get<VoltronMap>('headers');
    if (headers != null) {
      _voltronMapToRequestHeaders(httpRequest, headers);
    }
    return httpRequest;
  }

  void _voltronMapToRequestHeaders(
    VoltronHttpRequest httpRequest,
    VoltronMap headers,
  ) {
    for (var key in headers.keySet()) {
      final value = headers.get(key);
      if (value is VoltronArray) {
        var headerValueArray = <Object>[];
        for (var i = 0; i < value.size(); i++) {
          var v = value.get<Object>(i);
          if (v != null) {
            headerValueArray.add(v);
          }
        }
        httpRequest.addHeader(key, headerValueArray);
      } else {
        LogUtils.e(
          'NetworkModule _voltronMapToRequestHeaders',
          "Unsupported Request Header Type, Header Field Should All be an Array!!!",
        );
      }
    }
  }

  @override
  void sendRequest(VoltronHttpRequest request, JSPromise promise) async {
    super.sendRequest(request, promise);
    var headers = _fillHeader(request);
    var proxy = await SystemProxy.getProxySettings().catchError((e) {
      LogUtils.i("HttpAdapter getProxySettings", e.toString());
    });
    var dio = Dio(
      BaseOptions(
        method: request.method,
        connectTimeout: request.connectTimeout,
        receiveTimeout: request.receiveTimeout,
        sendTimeout: request.getSendTimeout(),
        headers: headers,
        followRedirects: request.getFollowRedirects(),
      ),
    );
    if (proxy != null && proxy['host'] != null && proxy['port'] != null) {
      (dio.httpClientAdapter as DefaultHttpClientAdapter).onHttpClientCreate = (client) {
        // 设置代理
        client.findProxy = (uri) {
          return 'PROXY ${proxy['host']}:${proxy['port']}';
        };
        // 解决Android https
        client.badCertificateCallback = (cert, host, port) {
          return Platform.isAndroid;
        };
        return null;
      };
    }
    dio.interceptors.add(channel.CookieManager.getInstance());
    try {
      var dioResponse = await dio.request(request.url, data: request.body);
      LogUtils.i("HttpAdapter sendRequest", dioResponse.toString());
      var voltronHttpResponse = VoltronHttpResponse(
        statusCode: dioResponse.statusCode ?? VoltronHttpResponse.unknownStatus,
        statusMessage: dioResponse.statusMessage ?? '',
        headerMap: dioResponse.headers.map,
        requestOptions: dioResponse.requestOptions,
        data: dioResponse.data,
      );
      onSuccess(request, voltronHttpResponse, promise);
    } on DioError catch (e) {
      LogUtils.e("HttpAdapter sendRequest error", e.toString());
      var voltronHttpResponse = VoltronHttpResponse(
        statusCode: e.response?.statusCode ?? VoltronHttpResponse.unknownStatus,
        statusMessage: e.error.toString(),
        headerMap: e.response?.headers.map ?? {},
        requestOptions: e.requestOptions,
        data: e.response?.data ?? {},
      );
      onFailed(request, voltronHttpResponse, promise);
    }
  }

  Map<String, dynamic> _fillHeader(VoltronHttpRequest request) {
    var headerMap = request.getHeaders();
    var headers = <String, dynamic>{};
    headerMap.forEach((k, v) {
      if (v is String) {
        headers[k] = v;
      } else if (v is List) {
        headers[k] = v[v.length - 1];
      } else if (v is VoltronArray) {
        var len = v.size();
        headers[k] = v.get(len - 1);
      }
    });
    return headers;
  }

  @override
  void onSuccess(VoltronHttpRequest request, VoltronHttpResponse response, JSPromise promise) {
    super.onSuccess(request, response, promise);
    var respMap = VoltronMap();
    respMap.push("statusCode", response.statusCode);
    var rspBody = '';
    try {
      rspBody = json.encode(response.data);
    } catch (e) {
      rspBody = response.data.toString();
    }
    respMap.push("respBody", rspBody);
    respMap.push("statusLine", response.statusMessage);
    var headers = response.headerMap;
    headers.forEach((key, value) {
      if (key.toLowerCase() == HttpHeaderRsp.kSetCookie.toLowerCase()) {
        channel.CookieManager.getInstance().setCookie(request.url, value);
      }
    });
    respMap.push("respHeaders", response.headerMap.toVoltronMap());
    respMap.push("respBody", rspBody);
    promise.resolve(respMap);
  }

  @override
  void onFailed(VoltronHttpRequest request, VoltronHttpResponse response, JSPromise promise) {
    super.onFailed(request, response, promise);
    promise.reject(response.statusMessage);
  }

  @override
  void getCookie(String url, JSPromise promise) {
    channel.CookieManager.getInstance().getCookie(url).then((value) {
      var cookieList = value;
      var result = '';
      for (var item in cookieList) {
        result += '${item.name}=${item.value};';
      }
      promise.resolve(result);
    }).catchError((error) {
      promise.reject(error);
    });
  }

  @override
  void setCookie(String url, String keyValue, String expires, JSPromise promise) {
    var cookies = <Cookie>[];
    var keyValueList = keyValue.split(';');
    for (var item in keyValueList) {
      var cookieInfo = item.split('=');
      var cookieItem = Cookie(cookieInfo[0], cookieInfo[1]);
      if (!isEmpty(expires)) {
        cookieItem.expires = DateTime.parse(expires);
      }
      cookies.add(cookieItem);
    }
    channel.CookieManager.getInstance().setCookie(url, cookies);
    promise.resolve(0);
  }

  @override
  void destroy() {}
}

class VoltronHttpRequest {
  static const int kDefaultTimeoutMs = 3000;
  int connectTimeout = kDefaultTimeoutMs;
  int receiveTimeout = kDefaultTimeoutMs;
  int _sendTimeout = kDefaultTimeoutMs;
  bool useCaches = true;
  bool _followRedirects = true;
  final String method;

  final String url;
  final String body;
  String? _userAgent;
  late String requestId = '';
  Map<String, Object> headerMap = {};

  VoltronHttpRequest({
    required this.method,
    required this.url,
    required this.body,
    connectTimeout = kDefaultTimeoutMs,
    receiveTimeout = kDefaultTimeoutMs,
    useCaches = true,
    headerMap = const {},
  }) {
    requestId = DateTime.now().millisecondsSinceEpoch.toString();
    _initUserAgent();
    addHeader(HttpHeaderReq.kUserAgent, _userAgent!);
  }

  void addHeader(String name, Object value) {
    headerMap[name] = value;
  }

  Map<String, Object> getHeaders() {
    return headerMap;
  }

  set sendTimeout(int time) {
    _sendTimeout = time;
  }

  int getSendTimeout() {
    return _sendTimeout;
  }

  bool getFollowRedirects() {
    return _followRedirects;
  }

  set followRedirects(bool followRedirects) {
    _followRedirects = followRedirects;
  }

  void _initUserAgent() {
    if (_userAgent == null) {
      final platInfo = channel.PlatformManager.getInstance();
      const trailStr = 'Hippy/Voltron';
      if (Platform.isAndroid) {
        _userAgent =
        'Mozilla/5.0 (Linux; Android ${platInfo.osVersion}; ${platInfo.model} Build/${platInfo.deviceId}; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/106.0.5249.126 Mobile Safari/537.36 $trailStr';
      } else if (Platform.isIOS) {
        _userAgent =
        'Mozilla/5.0 (iPhone; CPU ${platInfo.model} OS ${platInfo.osVersion.replaceAll('.', '_')} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${platInfo.osVersion} Mobile/15E148 $trailStr';
      } else if (Platform.isMacOS) {
        _userAgent =
        'Mozilla/5.0 (Macintosh; Intel Mac OS X ${platInfo.osVersion.replaceAll('.', '_')}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36 Version/${platInfo.osVersion} $trailStr';
      } else if (Platform.isWindows) {
        /// TODO wait to perfect
        _userAgent =
        'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko $trailStr';
      }
    }
  }
}

class VoltronHttpResponse {
  static const int unknownStatus = -1;
  final int statusCode;
  final Map<String, dynamic> headerMap;
  final String statusMessage;
  final Object data;
  final RequestOptions requestOptions;

  VoltronHttpResponse({
    required this.statusCode,
    required this.headerMap,
    required this.statusMessage,
    required this.data,
    required this.requestOptions,
  });
}

class HttpHeaderReq {
  static const String kAccept = "Accept";
  static const String kHost = "Host";
  static const String kAcceptLanguage = "Accept-Language";
  static const String kAcceptEncoding = "Accept-Encoding";
  static const String kContentLength = "Content-Length";
  static const String kContentType = "Content-Type";
  static const String kUserAgent = "User-Agent";
  static const String kReferer = "Referer";
  static const String kRange = "Range";
  static const String kConnection = "Connection";
  static const String kCookie = "Cookie";
  static const String kQCookie = "QCookie";
  static const String kQua = "Q-UA";
  static const String kQGuid = "Q-GUID";
  static const String kQAuth = "Q-Auth";
  static const String kXOnlineHost = "X-Online-Host";
  static const String kQua2 = "Q-UA2";
  static const String kQEncrypt = "QQ-S-Encrypt";
  static const String kQsZip = "QQ-S-ZIP";
  static const String kQExtInfo = "Q-EXT-INF";
  static const String kContentEncryptKey = "qbkey";
  static const String kQToken = "Q-Token";
}

class HttpHeaderRsp {
  static const String kLocation = "Location";
  static const String kSetCookie = "Set-Cookie";
  static const String kSetCookie2 = "Set-Cookie2";
  static const String kServer = "Server";
  static const String kContentType = "Content-Type";
  static const String kContentLength = "Content-Length";
  static const String kContentEncoding = "Content-Encoding";
  static const String kCharset = "Charset";
  static const String kTransferEncoding = "Transfer-Encoding";
  static const String kLastModify = "Last-Modified";
  static const String kByteRanges = "Byte-Ranges";
  static const String kCacheControl = "Cache-Control";
  static const String kConnection = "Connection";
  static const String kContentRange = "Content-Range";
  static const String kContentDisposition = "Content-Disposition";
  static const String kETag = "ETag";
  static const String kRetryAfter = "Retry-After";

  static const String kQEncrypt = "QQ-S-Encrypt";
  static const String kQsZip = "QQ-S-ZIP";
  static const String kQToken = "tk";
  static const String kTokenExpireSpan = "maxage";
  static const String kWupEnv = "env";
}
