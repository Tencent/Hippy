//
// Tencent is pleased to support the open source community by making
// Hippy available.
//
// Copyright (C) 2019 THL A29 Limited, a Tencent company.
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

import 'package:dio/dio.dart';
import 'package:voltron_renderer/util/log_util.dart';

import '../adapter/http.dart';
import '../bridge/voltron_api.dart';
import '../engine/js_engine_context.dart';

///  network request and response inpsector
class NetworkInspector {
  static const String kLogTag = "NetworkInspector";
  static const String kHttpRequestRequestId = "requestId";
  static const String kHttpRequestLoaderId = "loaderId";
  static const String kHttpRequestDocumentUrl = "documentURL";
  static const String kHttpRequestTAG = "request";
  static const String kHttpRequestTimestamp = "timestamp";
  static const String kHttpRequestWallTime = "wallTime";
  static const String kHttpRequestInitiator = "initiator";
  static const String kHttpRequestRedirectHasExtraInfo = "redirectHasExtraInfo";
  static const String kHttpRequestFrameId = "frameId";
  static const String kHttpRequestHasUserGesture = "hasUserGesture";
  static const String kHttpRequestUrl = "url";
  static const String kHttpRequestUrlFragment = "urlFragment";
  static const String kHttpRequestMethod = "method";
  static const String kHttpRequestHeaders = "headers";
  static const String kHttpRequestHasPostData = "hasPostData";
  static const String kHttpRequestPostData = "postData";
  static const String kHttpRequestPostDataEntries = "postDataEntries";
  static const String kHttpRequestMixedContentType = "mixedContentType";
  static const String kHttpRequestInitialPriority = "initialPriority";
  static const String kHttpRequestReferrerPolicy = "referrerPolicy";
  static const String kHttpRequestIsLinkPreload = "isLinkPreload";
  static const String kHttpRequestTrustTokenParams = "trustTokenParams";
  static const String kHttpRequestIsSameSite = "isSameSite";
  static const String kHttpRequestType = "type";
  static const String kHttpRequestBytes = "bytes";
  static const String kHttpResponseRequestId = "requestId";
  static const String kHttpResponseLoaderId = "loaderId";
  static const String kHttpResponseTimestamp = "timestamp";
  static const String kHttpResponseType = "type";
  static const String kHttpResponseResponse = "response";
  static const String kHttpResponseHasExtraInfo = "hasExtraInfo";
  static const String kHttpResponseFrameId = "frameId";
  static const String kHttpResponseUrl = "url";
  static const String kHttpResponseStatus = "status";
  static const String kHttpResponseStatusText = "statusText";
  static const String kHttpResponseHeaders = "headers";
  static const String kHttpResponseMimeType = "mimeType";
  static const String kHttpResponseRequestHeaders = "requestHeaders";
  static const String kHttpResponseConnectionReused = "connectionReused";
  static const String kHttpResponseConnectionId = "connectionId";
  static const String kHttpResponseRemoteIPAddress = "remoteIPAddress";
  static const String kHttpResponseRemotePort = "remotePort";
  static const String kHttpResponseFromDiskCache = "fromDiskCache";
  static const String kHttpResponseFromServiceWorker = "fromServiceWorker";
  static const String kHttpResponseFromPrefetchCache = "fromPrefetchCache";
  static const String kHttpResponseEncodedDataLength = "encodedDataLength";
  static const String kHttpResponseTiming = "timing";
  static const String kHttpResponseServiceWorkerResponseSource = "serviceWorkerResponseSource";
  static const String kHttpResponseResponseTime = "responseTime";
  static const String kHttpResponseCacheStorageCacheName = "cacheStorageCacheName";
  static const String kHttpResponseProtocol = "protocol";
  static const String kHttpResponseSecurityState = "securityState";
  static const String kLoadingFinishedRequestId = "requestId";
  static const String kLoadingFinishedTimestamp = "timestamp";
  static const String kLoadingFinishedEncodeDataLength = "encodedDataLength";
  static const String kLoadingFinishedShouldReportCorbBlocking = "shouldReportCorbBlocking";
  static const String kContentType = "content-type";

  /// default value list
  static const String kDefaultSecurityState = "secure";
  static const String kDefaultResponseType = "Fetch";
  static const String kDefaultRequestType = "Fetch";
  static const String kDefaultMixedContentType = "none";
  static const String kDefaultInitialPriority = "VeryHigh";
  static const String kDefaultReferrerPolicy = "strict-origin-when-cross-origin";

  /// on network request response callback invoke with httpResponse
  /// more details, see https://chromedevtools.github.io/devtools-protocol/tot/Network/#event-responseReceived
  void onResponseReceived(EngineContext context, String requestId, Response? httpResponse) {
    final responseHeader = httpResponse?.headers.map.map((key, value) => MapEntry(key, value.join(';'))) ?? {};
    final requestHeader = httpResponse?.requestOptions.headers.map((key, value) {
          if (value is List) {
            return MapEntry(key, value.join(';'));
          }
          return MapEntry(key, value.toString());
        }) ?? {};
    String mimeType = responseHeader[kContentType] ?? "";
    if (mimeType.isEmpty) {
      mimeType = MimeType.getType(httpResponse?.requestOptions?.responseType);
    }

    final responseContentMap = {
      kHttpResponseUrl: httpResponse?.requestOptions.path,
      kHttpResponseStatus: httpResponse?.statusCode ?? HttpStatus.ok,
      kHttpResponseStatusText: httpResponse?.statusMessage ?? '',
      kHttpResponseHeaders: responseHeader,
      kHttpResponseMimeType: mimeType,
      kHttpResponseRequestHeaders: requestHeader,
      kHttpResponseConnectionReused: false,
      kHttpResponseConnectionId: int.parse(requestId),
      kHttpResponseFromDiskCache: false,
      kHttpResponseFromPrefetchCache: false,
      kHttpResponseFromServiceWorker: false,
      kHttpResponseEncodedDataLength: NetworkUtil.getEncodedDataLength(httpResponse?.data),
      kHttpResponseSecurityState: kDefaultSecurityState,
    };
    final responseMap = {
      kHttpResponseRequestId: requestId,
      kHttpResponseLoaderId: requestId,
      kHttpResponseTimestamp: NetworkUtil.getTimeStamp(),
      kHttpResponseType: kDefaultResponseType,
      kHttpResponseResponse: responseContentMap
    };
    final data = httpResponse?.data;
    final responseBody = data is String ? data : json.encode(data);
    VoltronApi.notifyResponseReceived(context.engineId, requestId, json.encode(responseMap), responseBody);

    final loadingFinishMap = {
      kLoadingFinishedEncodeDataLength: NetworkUtil.getEncodedDataLength(httpResponse?.data),
      kLoadingFinishedRequestId: requestId,
      kLoadingFinishedShouldReportCorbBlocking: false,
      kLoadingFinishedTimestamp: NetworkUtil.getTimeStamp(),
    };
    VoltronApi.notifyLoadingFinished(context.engineId, requestId, json.encode(loadingFinishMap));
  }

  /// on network request will be sent to server invoke width HttpRequest
  /// more details, see https://chromedevtools.github.io/devtools-protocol/tot/Network/#event-requestWillBeSent
  void onRequestWillBeSent(EngineContext context, String requestId, HttpRequest request) {
    final Map<String, String> requestHeader = request.getHeaders().map((key, value) {
      if (value is List) {
        return MapEntry(key, value.join(';'));
      }
      return MapEntry(key, value.toString());
    });
    final postData = request.getBody() ?? '';
    final entryMap = {kHttpRequestBytes: base64Encode(utf8.encode(postData))};
    final requestMap = {
      kHttpRequestUrl: request.url ?? "",
      kHttpRequestMethod: request.getMethod().toUpperCase(),
      kHttpRequestHeaders: requestHeader,
      kHttpRequestPostData: postData,
      kHttpRequestHasPostData: postData.isNotEmpty,
      kHttpRequestPostDataEntries: [entryMap],
      kHttpRequestMixedContentType: kDefaultMixedContentType,
      kHttpRequestInitialPriority: kDefaultInitialPriority,
      kHttpRequestReferrerPolicy: kDefaultReferrerPolicy
    };
    final timeStamp = NetworkUtil.getTimeStamp();
    final defaultInitiatorMap = {"type": "other"};
    final jsonMap = {
      kHttpRequestRequestId: requestId,
      kHttpRequestLoaderId: requestId,
      kHttpRequestDocumentUrl: "",
      kHttpRequestTAG: requestMap,
      kHttpRequestTimestamp: timeStamp,
      kHttpRequestWallTime: timeStamp,
      kHttpRequestInitiator: defaultInitiatorMap,
      kHttpRequestType: kDefaultRequestType
    };
    final result = json.encode(jsonMap);
    VoltronApi.notifyRequestWillBeSent(context.engineId, requestId, result);
  }
}

/// Resource mimeType as determined by the browser.
class MimeType {
  static const String json = 'application/json';
  static const String stream = 'stream';
  static const String plain = 'plain';
  static const String bytes = 'bytes';
  static const String unknown = 'unknown';
  static const Map<ResponseType, String> typeStrategyMap = {
    ResponseType.json: json,
    ResponseType.stream: stream,
    ResponseType.plain: plain,
    ResponseType.bytes: bytes,
  };

  static String getType(ResponseType? type) {
    return typeStrategyMap[type] ?? unknown;
  }
}


class NetworkUtil {
  /// get current time as milliseconds
  static int getTimeStamp() {
    return (DateTime.now().millisecondsSinceEpoch / 1000).round();
  }

  static int getEncodedDataLength(dynamic data) {
    try {
      if (data is String) {
        return data.length;
      }
      return json.encode(data).length;
    } catch (e) {
      LogUtils.e(NetworkInspector.kLogTag, "getEncodedDataLength error:" +  e.toString());
      return 0;
    }
  }
}
