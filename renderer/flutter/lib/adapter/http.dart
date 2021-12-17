import 'dart:io';
import 'package:dio/adapter.dart';
import 'package:dio/dio.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:system_proxy/system_proxy.dart';

import '../channel.dart' as channel;
import '../common.dart';
import '../util.dart';

class HttpAdapter with Destroyable {
  Future<Response> sendRequest(HttpRequest request) async {
    // fillHeader
    var headerMap = request.getHeaders();
    var headers = <String, dynamic>{};
    headerMap.forEach((k, v) {
      print(v.runtimeType);
      if (v is String) {
        headers[k] = v;
      } else if (v is List) {
        headers[k] = v[v.length - 1];
      } else if (v is VoltronArray) {
        var len = v.size();
        headers[k] = v.get(len - 1);
      }
    });
    var proxy = await SystemProxy.getProxySettings().catchError((e) {
      LogUtils.i("HttpAdapter getProxySettings", e.toString());
    });

    var dio = Dio(BaseOptions(
        method: request.getMethod(),
        connectTimeout: request.getConnectTimeout(),
        receiveTimeout: request.getReceiveTimeout(),
        sendTimeout: request.getSendTimeout(),
        headers: headers,
        followRedirects: request.getFollowRedirects()));

    if (proxy != null && proxy['host'] != null && proxy['port'] != null) {
      (dio.httpClientAdapter as DefaultHttpClientAdapter).onHttpClientCreate =
          (client) {
        // 设置代理
        client.findProxy = (uri) {
          return 'PROXY ${proxy['host']}:${proxy['port']}';
        };
        // 解决Android https
        client.badCertificateCallback = (cert, host, port) {
          return Platform.isAndroid;
        };
      };
    }

    dio.interceptors
        .add(CookieManager(channel.CookieManager.getInstance().cookieJar));
    try {
      var response =
          await dio.request(request.url ?? '', data: request.getBody());
      LogUtils.i("HttpAdapter sendRequest", response.toString());
      return response;
    } on DioError catch (e) {
      LogUtils.e("HttpAdapter sendRequest error", e.toString());
      return e.response!;
    }
  }

  @override
  void destroy() {}
}

class HttpRequest {
  static const int defaultTimeoutMs = 3000;
  int _connectTimeout = defaultTimeoutMs;
  int _receiveTimeout = defaultTimeoutMs;
  int _sendTimeout = defaultTimeoutMs;
  bool _useCaches = true;
  bool _followRedirects = true;
  String _method = "GET";

  String? _url;
  String? _body;
  String? _userAgent;
  late Map<String, Object> _mHeaderMap;

  HttpRequest() {
    _mHeaderMap = {};
    _initUserAgent();
    var userAgent = _userAgent;
    if (userAgent != null) {
      addHeader(HttpHeaderReq.userAgent, userAgent);
      LogUtils.i("HttpRequest user_agent", userAgent);
    } else {
      LogUtils.e("HttpRequest", "user_agent is null!");
    }
  }

  String? get url {
    return _url;
  }

  set url(String? url) {
    _url = url;
  }

  void addHeader(String name, Object value) {
    _mHeaderMap[name] = value;
  }

  Map<String, Object> getHeaders() {
    return _mHeaderMap;
  }

  int getConnectTimeout() {
    return _connectTimeout;
  }

  set connectTimeout(int time) {
    _connectTimeout = time;
  }

  int getReceiveTimeout() {
    return _receiveTimeout;
  }

  set sendTimeout(int time) {
    _sendTimeout = time;
  }

  int getSendTimeout() {
    return _sendTimeout;
  }

  set readTimeout(int time) {
    _receiveTimeout = time;
  }

  bool isUseCaches() {
    return _useCaches;
  }

  set useCaches(bool useCaches) {
    _useCaches = useCaches;
  }

  String getMethod() {
    return _method;
  }

  set method(String method) {
    _method = method;
  }

  String? getBody() {
    return _body;
  }

  set body(String body) {
    _body = body;
  }

  bool getFollowRedirects() {
    return _followRedirects;
  }

  set followRedirects(bool followRedirects) {
    _followRedirects = followRedirects;
  }

  void _initUserAgent() {
    if (_userAgent == null) {
      var info = '';
      final platInfo = channel.PlatformManager.getInstance();
      info += '${platInfo.osVersion}; ';

      info += (platInfo.language);
      info += "-${platInfo.country}";

      if (platInfo.apiLevel > 3 &&
          platInfo.codeName == 'REL' &&
          platInfo.model.isNotEmpty) {
        info += '; ${platInfo.model}';
      }

      if (platInfo.deviceId.isNotEmpty) {
        info += " Build/${platInfo.deviceId}";
      }

      final userAgent =
          'Mozilla/5.0 (Linux; U; Android $info) AppleWebKit/533.1 (KHTML, like Gecko) Mobile Safari/533.1';

      _userAgent = userAgent;
    }
  }
}

class HttpResponse {}

class HttpHeaderReq {
  static const String accept = "Accept";
  static const String host = "Host";
  static const String acceptLanguage = "Accept-Language";
  static const String acceptEncoding = "Accept-Encoding";
  static const String contentLength = "Content-Length";
  static const String contentType = "Content-Type";
  static const String userAgent = "User-Agent";
  static const String referer = "Referer";
  static const String range = "Range";
  static const String connection = "Connection";
  static const String cookie = "Cookie";
  static const String qCookie = "QCookie";
  static const String qua = "Q-UA";
  static const String qGuid = "Q-GUID";
  static const String qAuth = "Q-Auth";
  static const String xOnlineHost = "X-Online-Host";
  static const String qua2 = "Q-UA2";
  static const String qEncrypt = "QQ-S-Encrypt";
  static const String qsZip = "QQ-S-ZIP";
  static const String qExtInfo = "Q-EXT-INF";
  static const String contentEncryptKey = "qbkey";
  static const String qToken = "Q-Token";
}

class HttpHeaderRsp {
  static const String location = "Location";
  static const String setCookie = "Set-Cookie";
  static const String setCookie2 = "Set-Cookie2";
  static const String server = "Server";
  static const String contentType = "Content-Type";
  static const String contentLength = "Content-Length";
  static const String contentEncoding = "Content-Encoding";
  static const String charset = "Charset";
  static const String transferEncoding = "Transfer-Encoding";
  static const String lastModify = "Last-Modified";
  static const String byteRanges = "Byte-Ranges";
  static const String cacheControl = "Cache-Control";
  static const String connection = "Connection";
  static const String contentRange = "Content-Range";
  static const String contentDisposition = "Content-Disposition";
  static const String eTag = "ETag";
  static const String retryAfter = "Retry-After";

  static const String qEncrypt = "QQ-S-Encrypt";
  static const String qsZip = "QQ-S-ZIP";
  static const String qToken = "tk";
  static const String tokenExpireSpan = "maxage";
  static const String wupEnv = "env";
}
