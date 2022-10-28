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

import 'package:voltron_renderer/voltron_renderer.dart';

import '../adapter.dart';
import '../engine.dart';
import 'module.dart';
import 'promise.dart';

typedef TRequestWillBeSentHook = void Function(
  EngineContext context,
  String requestId,
  VoltronHttpRequest request,
);

typedef TResponseReceivedHook = void Function(
  EngineContext context,
  String requestId,
  VoltronHttpResponse? response,
);

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

  ///**
  /// * 发送请求
  /// *
  @VoltronMethod(kFetchMethodName)
  bool fetch(final VoltronMap request, final JSPromise promise) {
    VoltronHttpAdapter adapter = context.globalConfigs.httpAdapter ?? DefaultHttpAdapter();
    adapter.init(
      context: context,
      requestWillBeSentHook: requestWillBeSentHook,
      responseReceivedHook: responseReceivedHook,
    );
    adapter.fetch(request, promise);
    return true;
  }

  ///**
  /// * 设置指定url下的Cookie
  /// * @param url 指定url，其实也就是指定作用域，如：http://3g.qq.com
  /// * @param keyValue cookie key-value键值对集合，多个以分号";"隔开，如：name=harryguo。或者：name=harryguo;gender:male
  /// * @param expires 默认为空，过期时间，格式与http协议头response里的Set-Cookie相同，如：Thu, 08-Jan-2020 00:00:00 GMT
  /// *
  @VoltronMethod(kSetCookieMethodName)
  bool setCookie(String url, String keyValue, String expires, JSPromise promise) {
    VoltronHttpAdapter adapter = context.globalConfigs.httpAdapter ?? DefaultHttpAdapter();
    adapter.setCookie(url, keyValue, expires, promise);
    return true;
  }

  ///**
  /// * 获取指定url下的Cookie
  /// * @param url 指定url，其实也就是指定作用域，如：http://3g.qq.com
  /// *
  @VoltronMethod(kGetCookieMethodName)
  bool getCookie(String url, JSPromise promise) {
    VoltronHttpAdapter adapter = context.globalConfigs.httpAdapter ?? DefaultHttpAdapter();
    adapter.getCookie(url, promise);
    return true;
  }

  @override
  Map<String, Function> get extraFuncMap => {
        kFetchMethodName: fetch,
        kSetCookieMethodName: setCookie,
        kGetCookieMethodName: getCookie,
      };

  @override
  String get moduleName => kNetworkModuleName;
}
