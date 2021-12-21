import 'dart:io';

import 'package:dio/dio.dart';

import '../adapter.dart';
import '../channel.dart';
import '../common.dart';
import '../engine.dart';
import '../util.dart';
import 'module.dart';
import 'promise.dart';

typedef TRequestWillBeSentHook = void Function(
    EngineContext context, String requestId, HttpRequest request);
typedef TResponseReceivedHook = void Function(
    EngineContext context, String requestId, Response? response);

class NetworkModule extends VoltronNativeModule {
  static const String kNetworkModuleName = "network";
  static const String kFetchMethodName = "fetch";
  static const String kSetCookieMethodName = "setCookie";
  static const String kGetCookieMethodName = "getCookie";

  /// 发送请求前的钩子函数
  TRequestWillBeSentHook? requestWillBeSentHook;

  /// 请求成功响应的钩子函数
  TResponseReceivedHook? responseReceivedHook;

  NetworkModule(EngineContext context) : super(context);

  @VoltronMethod(kFetchMethodName)
  bool fetch(final VoltronMap request, final JSPromise promise) {
    var url = request.get<String>('url') ?? '';
    final method = request.get<String>("method") ?? '';
    if (isEmpty(url) || isEmpty(method)) {
      promise.reject("no valid url for request");
      return true;
    }

    var httpRequest = HttpRequest();
    httpRequest.connectTimeout = 10 * 1000;
    httpRequest.readTimeout = 10 * 1000;
    httpRequest.useCaches = false;
    httpRequest.method = method;
    httpRequest.url = url;
    var headers = request.get<VoltronMap>('headers');
    if (headers != null) {
      _voltronMapToRequestHeaders(httpRequest, headers);
    }
    var body = request.get<String>('body') ?? '';
    httpRequest.body = body;

    var configs = context.globalConfigs;
    HttpAdapter? adapter;
    adapter = configs.httpAdapter;
    if (adapter != null) {
      final requestId = DateTime.now().millisecondsSinceEpoch.toString();
      requestWillBeSentHook?.call(context, requestId, httpRequest);
      adapter.sendRequest(httpRequest).then((response) {
        responseReceivedHook?.call(context, requestId, response);
        var respMap = _handleHttpResponse(response);
        promise.resolve(respMap);
      }).catchError((e) {
        if (e is DioError) {
          final response = e.response;
          responseReceivedHook?.call(context, requestId, response);
          var errMap = VoltronMap();
          var responseMap = VoltronMap();
          responseMap.push("data", response?.data ?? '');
          responseMap.push("status", response?.statusCode ?? 'unknown');
          var headerMap = VoltronMap();
          final headers = response?.headers;
          if (headers != null) {
            headers.forEach((name, values) {
              headerMap.push(name, values.join(','));
            });
          }
          responseMap.push("headers", headerMap);
          errMap.push("response", responseMap);
          promise.reject(errMap);
        } else {
          promise.reject(e.toString());
        }
      });
    }
    return true;
  }

  VoltronMap _handleHttpResponse(Response response) {
    var respMap = VoltronMap();
    respMap.push("statusCode", response.statusCode);
    respMap.push("respBody", response.toString());
    respMap.push("statusLine", response.statusMessage);
    var headerMap = VoltronMap();
    var headers = response.headers;
    headers.forEach((key, value) {
      var oneHeaderFiled = VoltronArray();
      for (var item in value) {
        oneHeaderFiled.push(item);
      }
      headerMap.push(key, oneHeaderFiled);
    });

    respMap.push("respHeaders", headerMap);
    return respMap;
  }

  void _voltronMapToRequestHeaders(
      HttpRequest httpRequest, VoltronMap headers) {
    for (var key in headers.keySet()) {
      final value = headers.get(key);
      if (value is VoltronArray) {
        var headerValueArray = <Object>[];
        for (var i = 0; i < value.size(); i++) {
          headerValueArray.add(value.get(i));
        }
        httpRequest.addHeader(key, headerValueArray);
      } else {
        LogUtils.e('NetworkModule _voltronMapToRequestHeaders',
            "Unsupported Request Header Type, Header Field Should All be an Array!!!");
      }
    }
  }

  ///**
  /// * 设置指定url下的Cookie
  /// * @param url 指定url，其实也就是指定作用域，如：http://3g.qq.com
  /// * @param keyValue cookie key-value键值对集合，多个以分号";"隔开，如：name=harryguo。或者：name=harryguo;gender:male
  /// * @param expires 默认为空，过期时间，格式与http协议头response里的Set-Cookie相同，如：Thu, 08-Jan-2020 00:00:00 GMT
  /// *
  @VoltronMethod(kSetCookieMethodName)
  bool setCookie(
      String url, String keyValue, String expires, JSPromise promise) {
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
    CookieManager.getInstance().setCookie(url, cookies);
    promise.resolve(0);
    return true;
  }

  @VoltronMethod(kGetCookieMethodName)
  bool getCookie(String url, JSPromise promise) {
    CookieManager.getInstance().getCookie(url).then((value) {
      var cookieList = value;
      var result = '';
      for (var item in cookieList) {
        result += '${item.name}=${item.value};';
      }

      promise.resolve(result);
    });

    return true;
  }

  @override
  Map<String, Function> get extraFuncMap => {
        kFetchMethodName: fetch,
        kSetCookieMethodName: setCookie,
        kGetCookieMethodName: getCookie
      };

  @override
  String get moduleName => kNetworkModuleName;
}
