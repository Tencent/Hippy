import 'dart:convert';

import 'package:dio/dio.dart' as $dio;

import '../../../adapter/http.dart';
import '../../../engine/engine_context.dart';
import '../domain.dart';
import '../inspector.dart';
import '../model/model.dart';

String kNetworkDomainName = 'Network';

class NetworkDomain extends InspectDomain {
  /// 请求的数据缓存(key: requestId, value: responseData)，应用于Network.getResponseBody的协议
  final Map<String, String> _responseBodyCache = {};

  NetworkDomain(Inspector inspector) : super(inspector);

  @override
  String get name => kNetworkDomainName;

  @override
  void receiveFromFrontend(EngineContext context, int id, String method,
      Map<String, dynamic> params) {
    final strategyMap = {
      'getResponseBody': _handleGetResponseBody,
    };

    strategyMap[method]?.call(context, id, params);
  }

  /// https://chromedevtools.github.io/devtools-protocol/tot/Network/#method-getResponseBody
  void _handleGetResponseBody(
      EngineContext context, int id, Map<String, dynamic> params) {
    final requestId = params['requestId'];
    final data = _responseBodyCache[requestId];
    if (data == null) {
      return;
    }

    final responseBody = ResponseBody(data);
    sendToFrontend(context, id, responseBody);
    _responseBodyCache.remove(requestId);
  }

  /// https://chromedevtools.github.io/devtools-protocol/tot/Network/#event-requestWillBeSent
  void handleRequestWillBeSent(
      EngineContext context, String requestId, HttpRequest request) {
    final event = InspectorEvent(
        'Network.requestWillBeSent', RequestWillBeSent(requestId, request));
    sendEventToFrontend(context, event);
  }

  /// https://chromedevtools.github.io/devtools-protocol/tot/Network/#event-responseReceived
  void handleResponseReceived(
      EngineContext context, String requestId, $dio.Response response) {
    final event = InspectorEvent(
        'Network.responseReceived', ResponseReceived(requestId, response));
    try {
      final data = response.data;
      final responseBody = data is String ? data : json.encode(data);
      _responseBodyCache[requestId] = responseBody;
    } catch (e) {
      print(e);
    }

    sendEventToFrontend(context, event);
  }

  /// https://chromedevtools.github.io/devtools-protocol/tot/Network/#event-loadingFinished
  void handleLoadingFinished(
      EngineContext context, String requestId, $dio.Response response) {
    final event = InspectorEvent(
        'Network.loadingFinished', LoadingFinished(requestId, response));
    sendEventToFrontend(context, event);
  }
}
