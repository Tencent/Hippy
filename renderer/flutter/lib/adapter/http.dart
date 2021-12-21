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
  static const int kDefaultTimeoutMs = 3000;
  int _connectTimeout = kDefaultTimeoutMs;
  int _receiveTimeout = kDefaultTimeoutMs;
  int _sendTimeout = kDefaultTimeoutMs;
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
      addHeader(HttpHeaderReq.kUserAgent, userAgent);
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
