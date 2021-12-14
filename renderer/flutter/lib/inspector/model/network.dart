import 'dart:convert';

import 'package:dio/dio.dart' as $dio;
import 'package:dio/dio.dart';
import '../../../adapter/http.dart';
import 'model.dart';

/// https://chromedevtools.github.io/devtools-protocol/tot/Network/#method-getResponseBody
class ResponseBody implements InspectorModel {
  String responseBody;

  ResponseBody(this.responseBody);

  Map toJson() {
    return {
      'body': responseBody,
      'base64Encoded': false,
    };
  }
}

/// https://chromedevtools.github.io/devtools-protocol/tot/Network/#event-requestWillBeSent
class RequestWillBeSent implements InspectorModel {
  final String requestId;
  final HttpRequest httpRequest;

  RequestWillBeSent(this.requestId, this.httpRequest);

  // TODO: bundleUrl
  String get documentURL => '';

  String get postData => httpRequest.getBody() ?? '';

  Map<String, String> get requestHeader {
    return httpRequest.getHeaders().map((key, value) {
      if (value is List) {
        return MapEntry(key, value.join(';'));
      }
      return MapEntry(key, value.toString());
    });
  }

  Request get request => Request(
        url: httpRequest.url ?? '',
        method: httpRequest.getMethod().toUpperCase(),
        header: requestHeader,
        postData: postData,
        hasPostData: postData != '',
        postDataEntries: [
          PostDataEntry(bytes: base64Encode(utf8.encode(postData))),
        ],
        mixedContentType: SecurityMixedContentType.none,
        initialPriority: ResourcePriority.veryHigh,
        referrerPolicy: ReferrerPolicy.strictOriginWhenCrossOrigin,

        // TODO 补充协议
        // urlFragment
        // isLinkPreload
        // trustTokenParams
      );

  Initiator get initiator => Initiator(type: InitiatorType.other);

  Map toJson() {
    return {
      // Request identifier.
      'requestId': requestId,
      // Loader identifier. Empty string if the request is fetched from worker.
      'loaderId': requestId,
      // URL of the document this request is loaded for
      'documentURL': documentURL,
      // Request data.
      'request': request,
      // https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-MonotonicTime
      // Monotonically increasing time in seconds since an arbitrary point in the past.
      'timestamp': NetworkUtil.getTimeStamp(),
      // https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-TimeSinceEpoch
      // UTC time in seconds, counted from January 1, 1970.
      'wallTime': NetworkUtil.getTimeStamp(),
      // Request initiator.
      'initiator': initiator,
      // https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-ResourceType
      // Type of this resource.(use ResourceType variable member)
      'type': ResourceType.fetch,

      /// TODO: 待补充的协议
      // // Redirect response data.
      // redirectResponse
      // // Unique frame identifier.
      // frameId
      // // Whether the request is initiated by a user gesture. Defaults to false.
      // hasUserGesture
    };
  }
}

/// https://chromedevtools.github.io/devtools-protocol/tot/Network/#event-loadingFinished
class LoadingFinished implements InspectorModel {
  final String requestId;
  final $dio.Response httpResponse;

  LoadingFinished(this.requestId, this.httpResponse);

  Map toJson() {
    return {
      'encodedDataLength': NetworkUtil.getEncodedDataLength(httpResponse.data),
      'requestId': requestId,
      'shouldReportCorbBlocking': false,
      'timestamp': NetworkUtil.getTimeStamp(),
    };
  }
}

/// https://chromedevtools.github.io/devtools-protocol/tot/Network/#event-responseReceived
class ResponseReceived implements InspectorModel {
  final String requestId;
  final $dio.Response httpResponse;

  ResponseReceived(this.requestId, this.httpResponse);

  int get timestamp =>
      DateTime.now().millisecondsSinceEpoch - int.parse(requestId);

  Map<String, String> get responseHeader {
    return httpResponse.headers.map
        .map((key, value) => MapEntry(key, value.join(';')));
  }

  Map<String, String> get requestHeader {
    return httpResponse.requestOptions.headers.map((key, value) {
      if (value is List) {
        return MapEntry(key, value.join(';'));
      }
      return MapEntry(key, value.toString());
    });
  }

  String get mimeType {
    final type = responseHeader['content-type'];
    if (type == null || type == '') {
      return MimeType.getType(httpResponse.requestOptions.responseType);
    }

    return type;
  }

  Response get response => Response(
        url: httpResponse.requestOptions.path,
        status: httpResponse.statusCode ?? 200,
        statusText: httpResponse.statusMessage ?? '',
        headers: responseHeader,
        mimeType: mimeType,
        requestHeaders: requestHeader,
        connectionReused: false,
        connectionId: int.parse(requestId),
        fromDiskCache: false,
        fromPrefetchCache: false,
        fromServiceWorker: false,
        encodedDataLength: NetworkUtil.getEncodedDataLength(httpResponse.data),
        securityState: SecurityState.secure,

        /// TODO: 待补充的协议
        // headersText
        // requestHeadersText
        // remoteIPAddress
        // remotePort
        // timing
        // serviceWorkerResponseSource
        // responseTime
        // cacheStorageCacheName
        // protocol
        // securityDetails
      );

  Map toJson() {
    return {
      // https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-RequestId
      // Request identifier.
      'requestId': requestId,
      // https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-LoaderId
      // Loader identifier. Empty string if the request is fetched from worker.
      'loaderId': requestId,
      // https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-MonotonicTime
      // Monotonically increasing time in seconds since an arbitrary point in the past.
      'timestamp': NetworkUtil.getTimeStamp(),
      // https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-ResourceType
      // Type of this resource.(use ResourceType variable member)
      'type': ResourceType.fetch,

      /// Response data.
      'response': response,

      /// TODO: 待补充的协议
      // // https://chromedevtools.github.io/devtools-protocol/tot/Page/#type-FrameId
      // frameId
    };
  }
}

/// https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-Request
class Request implements InspectorModel {
  /// Request URL (without fragment).
  final String url;

  /// Fragment of the requested URL starting with hash, if present.
  final String? urlFragment;

  /// HTTP request method.
  final String method;

  /// HTTP request headers.(Request / response headers as keys / values of JSON object.)
  final Map header;

  /// HTTP POST request data.
  final String? postData;

  /// True when the request has POST data. Note that postData might still be omitted when this flag is true when the data is too long.
  final bool? hasPostData;

  /// Request body elements. This will be converted from base64 to binary
  final List<PostDataEntry>? postDataEntries;

  /// The mixed content type of the request.(use SecurityMixedContentType variable member)
  final String? mixedContentType;

  /// Priority of the resource request at the time request is sent.(use ResourcePriority variable member)
  final String initialPriority;

  /// The referrer policy of the request.(use ReferrerPolicy variable member)
  final String referrerPolicy;

  /// Whether is loaded via link preload.
  final bool? isLinkPreload;

  /// Set for requests when the TrustToken API is used.
  /// Contains the parameters passed by the developer (e.g. via "fetch") as understood by the backend.
  final TrustTokenParams? trustTokenParams;

  Request({
    required this.url,
    this.urlFragment,
    required this.method,
    required this.header,
    this.postData,
    this.hasPostData,
    this.postDataEntries,
    this.mixedContentType,
    required this.initialPriority,
    required this.referrerPolicy,
    this.isLinkPreload,
    this.trustTokenParams,
  });

  Map toJson() {
    return {
      'url': url,
      if (urlFragment != null) 'urlFragment': urlFragment,
      'method': method,
      'header': header,
      if (postData != null) 'postData': postData,
      if (hasPostData != null) 'hasPostData': hasPostData,
      if (postDataEntries != null) 'postDataEntries': postDataEntries,
      if (mixedContentType != null) 'mixedContentType': mixedContentType,
      'initialPriority': initialPriority,
      'referrerPolicy': referrerPolicy,
      if (isLinkPreload != null) 'isLinkPreload': isLinkPreload,
      if (trustTokenParams != null) 'trustTokenParams': trustTokenParams,
    };
  }
}

/// https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-PostDataEntry
/// Post data entry for HTTP request
class PostDataEntry implements InspectorModel {
  final String? bytes;
  PostDataEntry({this.bytes});

  Map toJson() {
    return {
      if (bytes != null) 'bytes': bytes,
    };
  }
}

/// https://chromedevtools.github.io/devtools-protocol/tot/Security/#type-MixedContentType
/// A description of mixed content (HTTP resources on HTTPS pages), as defined by https://www.w3.org/TR/mixed-content/#categories
class SecurityMixedContentType {
  static String blockable = 'blockable';
  static String optionallyBlockable = 'optionally-blockable';
  static String none = 'none';
}

/// https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-ResourcePriority
/// Loading priority of a resource request.
class ResourcePriority {
  static String veryLow = 'VeryLow';
  static String low = 'Low';
  static String medium = 'Medium';
  static String high = 'High';
  static String veryHigh = 'VeryHigh';
}

/// The referrer policy of the request, as defined in https://www.w3.org/TR/referrer-policy/
/// https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Referrer-Policy
class ReferrerPolicy {
  /// 默认值
  /// 在没有指定任何策略的情况下用户代理的默认行为。
  /// 在同等安全级别的情况下，引用页面的地址会被发送(HTTPS->HTTPS)，但是在降级的情况下不会被发送 (HTTPS->HTTP)。
  static String noReferrerWhenDowngrade = 'no-referrer-when-downgrade';

  /// 无论是同源请求还是非同源请求，都发送完整的 URL（移除参数信息之后）作为引用地址。
  /// 这项设置会将受 TLS 安全协议保护的资源的源和路径信息泄露给非安全的源服务器。进行此项设置的时候要慎重考虑。
  static String unsafeUrl = 'unsafe-url';

  /// 整个 Referer  首部会被移除。访问来源信息不随着请求一起发送。
  static String noReferrer = 'no-referrer';

  /// 在任何情况下，仅发送文件的源作为引用地址。例如  https://example.com/page.html 会将 https://example.com/ 作为引用地址。
  static String origin = 'origin';

  /// 对于同源的请求，会发送完整的URL作为引用地址，但是对于非同源请求仅发送文件的源。
  static String originWhenCrossOrigin = 'origin-when-cross-origin';

  /// 对于同源的请求会发送引用地址，但是对于非同源请求则不发送引用地址信息。
  static String sameOrigin = 'same-origin';

  /// 在同等安全级别的情况下，发送文件的源作为引用地址(HTTPS->HTTPS)，但是在降级的情况下不会发送 (HTTPS->HTTP)。
  static String strictOrigin = 'strict-origin';

  /// 对于同源的请求，会发送完整的URL作为引用地址；在同等安全级别的情况下，发送文件的源作为引用地址(HTTPS->HTTPS)；
  /// 在降级的情况下不发送此首部 (HTTPS->HTTP)。
  static String strictOriginWhenCrossOrigin = 'strict-origin-when-cross-origin';
}

/// https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-TrustTokenParams
/// Determines what type of Trust Token operation is executed and depending on the type, some additional parameters.
/// The values are specified in third_party/blink/renderer/core/fetch/trust_token.idl.
class TrustTokenParams implements InspectorModel {
  /// use TrustTokenOperationType variable member
  final String type;

  /// use RefreshPolicy variable member
  final String refreshPolicy;

  /// Origins of issuers from whom to request tokens or redemption records.
  final List<String>? issuers;

  TrustTokenParams(
      {required this.type, required this.refreshPolicy, this.issuers});

  Map toJson() {
    return {
      'type': type,
      'refreshPolicy': refreshPolicy,
      if (issuers != null) 'issuers': issuers,
    };
  }
}

/// https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-TrustTokenOperationType
class TrustTokenOperationType {
  static String issuance = 'Issuance';
  static String redemption = 'Redemption';
  static String signing = 'Signing';
}

/// Only set for "token-redemption" type and determine whether to request a fresh SRR or use a still valid cached SRR.
class RefreshPolicy {
  static String useCached = 'UseCached';
  static String refresh = 'Refresh';
}

/// https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-Initiator
class Initiator implements InspectorModel {
  /// use InitiatorType variable member
  final String type;

  /// Initiator JavaScript stack trace, set for Script only.
  final RuntimeStackTrace? stack;

  /// Initiator URL, set for Parser type or for Script type (when script is importing module) or for SignedExchange type.
  final String? url;

  /// Initiator line number, set for Parser type or for Script type (when script is importing module) (0-based).
  final int? lineNumber;

  /// Initiator column number, set for Parser type or for Script type (when script is importing module) (0-based)
  final int? columnNumber;

  /// Set if another request triggered this request (e.g. preflight).
  /// Unique request identifier.
  final String? requestId;

  Initiator({
    required this.type,
    this.stack,
    this.url,
    this.lineNumber,
    this.columnNumber,
    this.requestId,
  });

  Map toJson() {
    return {
      'type': type,
      if (stack != null) 'stack': stack,
      if (url != null) 'url': url,
      if (lineNumber != null) 'lineNumber': lineNumber,
      if (columnNumber != null) 'columnNumber': columnNumber,
      if (requestId != null) 'requestId': requestId,
    };
  }
}

/// Type of this initiator.
class InitiatorType {
  static String parser = 'parser';
  static String script = 'script';
  static String preload = 'preload';
  static String signedExchange = 'SignedExchange';
  static String preflight = 'preflight';
  static String other = 'other';
}

/// https://chromedevtools.github.io/devtools-protocol/tot/Runtime/#type-StackTrace
/// Call frames for assertions or error messages.
class RuntimeStackTrace implements InspectorModel {
  /// String label of this stack trace.
  /// For async traces this may be a name of the function that initiated the async call.
  final String? description;

  /// JavaScript function name.
  final List<RuntimeCallFrame> callFrames;

  /// Asynchronous JavaScript stack trace that preceded this stack, if available.
  final RuntimeStackTrace? parent;

  /// Asynchronous JavaScript stack trace that preceded this stack, if available.
  final RuntimeStackTraceId? parentId;

  RuntimeStackTrace({
    this.description,
    required this.callFrames,
    this.parent,
    this.parentId,
  });

  Map toJson() {
    return {
      if (description != null) 'description': description,
      'callFrames': callFrames,
      if (parent != null) 'parent': parent,
      if (parentId != null) 'parentId': parentId,
    };
  }
}

/// https://chromedevtools.github.io/devtools-protocol/tot/Runtime/#type-StackTraceId
class RuntimeStackTraceId implements InspectorModel {
  final String id;

  /// https://chromedevtools.github.io/devtools-protocol/tot/Runtime/#type-UniqueDebuggerId
  /// Unique identifier of current debugger.
  final String? debuggerId;

  RuntimeStackTraceId({
    required this.id,
    this.debuggerId,
  });

  Map toJson() {
    return {
      'id': id,
      if (debuggerId != null) 'debuggerId': debuggerId,
    };
  }
}

/// https://chromedevtools.github.io/devtools-protocol/tot/Runtime/#type-CallFrame
/// Stack entry for runtime errors and assertions.
class RuntimeCallFrame implements InspectorModel {
  /// JavaScript function name.
  final String functionName;

  /// https://chromedevtools.github.io/devtools-protocol/tot/Runtime/#type-ScriptId
  /// Unique script identifier.
  final String scriptId;

  /// JavaScript script name or url.
  final String url;

  /// JavaScript script line number (0-based).
  final int lineNumber;

  /// JavaScript script column number (0-based).
  final int columnNumber;

  RuntimeCallFrame({
    required this.functionName,
    required this.scriptId,
    required this.url,
    required this.lineNumber,
    required this.columnNumber,
  });

  Map toJson() {
    return {
      'functionName': functionName,
      'scriptId': scriptId,
      'url': url,
      'lineNumber': lineNumber,
      'columnNumber': columnNumber,
    };
  }
}

/// https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-Response
class Response implements InspectorModel {
  /// Response URL. This URL can be different from CachedResource.url in case of redirect.
  final String url;

  /// HTTP response status code.
  final int status;

  /// HTTP response status text.
  final String statusText;

  /// https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-Headers
  /// HTTP response headers.
  final Map headers;

  /// HTTP response headers text.
  final String? headersText;

  /// Resource mimeType as determined by the browser.(use MimeType variable member)
  final String mimeType;

  /// Refined HTTP request headers that were actually transmitted over the network.
  final Map? requestHeaders;

  /// HTTP request headers text.
  final String? requestHeadersText;

  /// Specifies whether physical connection was actually reused for this request.
  final bool connectionReused;

  /// Physical connection id that was actually used for this request.
  final int connectionId;

  /// Remote IP address.
  final String? remoteIPAddress;

  /// Remote port
  final int? remotePort;

  /// Specifies that the request was served from the disk cache.
  final bool? fromDiskCache;

  /// Specifies that the request was served from the ServiceWorker.
  final bool? fromServiceWorker;

  /// Specifies that the request was served from the prefetch cache.
  final bool? fromPrefetchCache;

  /// Total number of bytes received for this request so far.
  final int encodedDataLength;

  /// Timing information for the given request.
  final ResourceTiming? timing;

  /// https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-ServiceWorkerResponseSource
  /// Response source of response from ServiceWorker.
  /// use ServiceWorkerResponseSource variable member
  final String? serviceWorkerResponseSource;

  /// https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-TimeSinceEpoch
  /// The time at which the returned response was generated.
  final int? responseTime;

  /// Cache Storage Cache Name
  final String? cacheStorageCacheName;

  /// Protocol used to fetch this request.
  final String? protocol;

  /// https://chromedevtools.github.io/devtools-protocol/tot/Security/#type-SecurityState
  /// use SecurityState variable member
  final String securityState;

  /// Security details for the request.
  final SecurityDetails? securityDetails;

  Response({
    required this.url,
    required this.status,
    required this.statusText,
    required this.headers,
    this.headersText,
    required this.mimeType,
    this.requestHeaders,
    this.requestHeadersText,
    required this.connectionReused,
    required this.connectionId,
    this.remoteIPAddress,
    this.remotePort,
    this.fromDiskCache,
    this.fromServiceWorker,
    this.fromPrefetchCache,
    required this.encodedDataLength,
    this.timing,
    this.serviceWorkerResponseSource,
    this.responseTime,
    this.cacheStorageCacheName,
    this.protocol,
    required this.securityState,
    this.securityDetails,
  });

  Map toJson() {
    return {
      'url': url,
      'status': status,
      'statusText': statusText,
      'headers': headers,
      if (headersText != null) 'headersText': headersText,
      'mimeType': mimeType,
      if (requestHeaders != null) 'requestHeaders': requestHeaders,
      if (requestHeadersText != null) 'requestHeadersText': requestHeadersText,
      'connectionReused': connectionReused,
      'connectionId': connectionId,
      if (remoteIPAddress != null) 'remoteIPAddress': remoteIPAddress,
      if (remotePort != null) 'remotePort': remotePort,
      if (fromDiskCache != null) 'fromDiskCache': fromDiskCache,
      if (fromServiceWorker != null) 'fromServiceWorker': fromServiceWorker,
      if (fromPrefetchCache != null) 'fromPrefetchCache': fromPrefetchCache,
      'encodedDataLength': encodedDataLength,
      if (timing != null) 'timing': timing,
      if (serviceWorkerResponseSource != null)
        'serviceWorkerResponseSource': serviceWorkerResponseSource,
      if (responseTime != null) 'responseTime': responseTime,
      if (cacheStorageCacheName != null)
        'cacheStorageCacheName': cacheStorageCacheName,
      if (protocol != null) 'protocol': protocol,
      'securityState': securityState,
      if (securityDetails != null) 'securityDetails': securityDetails,
    };
  }
}

/// https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-ResourceTiming
class ResourceTiming implements InspectorModel {
  /// Timing's requestTime is a baseline in seconds, while the other numbers are ticks in milliseconds relatively to this requestTime.
  final int requestTime;

  /// Started resolving proxy.
  final int proxyStart;

  /// Finished resolving proxy.
  final int proxyEnd;

  /// Started DNS address resolve.
  final int dnsStart;

  /// Finished DNS address resolve.
  final int dnsEnd;

  /// Started connecting to the remote host.
  final int connectStart;

  /// Connected to the remote host.
  final int connectEnd;

  /// Started SSL handshake.
  final int sslStart;

  /// Finished SSL handshake.
  final int sslEnd;

  /// Started running ServiceWorker. EXPERIMENTAL
  final int workerStart;

  /// Finished Starting ServiceWorker. EXPERIMENTAL
  final int workerReady;

  /// Started fetch event. EXPERIMENTAL
  final int workerFetchStart;

  /// Settled fetch event respondWith promise. EXPERIMENTAL
  final int workerRespondWithSettled;

  /// Started sending request.
  final int sendStart;

  /// Finished sending request.
  final int sendEnd;

  /// Time the server started pushing request. EXPERIMENTAL
  final int pushStart;

  /// Time the server finished pushing request. EXPERIMENTAL
  final int pushEnd;

  /// Finished receiving response headers.
  final int receiveHeadersEnd;

  ResourceTiming({
    required this.requestTime,
    required this.proxyStart,
    required this.proxyEnd,
    required this.dnsStart,
    required this.dnsEnd,
    required this.connectStart,
    required this.connectEnd,
    required this.sslStart,
    required this.sslEnd,
    required this.workerStart,
    required this.workerReady,
    required this.workerFetchStart,
    required this.workerRespondWithSettled,
    required this.sendStart,
    required this.sendEnd,
    required this.pushStart,
    required this.pushEnd,
    required this.receiveHeadersEnd,
  });

  Map toJson() {
    return {
      'requestTime': requestTime,
      'proxyStart': proxyStart,
      'proxyEnd': proxyEnd,
      'dnsStart': dnsStart,
      'dnsEnd': dnsEnd,
      'connectStart': connectStart,
      'connectEnd': connectEnd,
      'sslStart': sslStart,
      'sslEnd': sslEnd,
      'workerStart': workerStart,
      'workerReady': workerReady,
      'workerFetchStart': workerFetchStart,
      'workerRespondWithSettled': workerRespondWithSettled,
      'sendStart': sendStart,
      'sendEnd': sendEnd,
      'pushStart': pushStart,
      'pushEnd': pushEnd,
      'receiveHeadersEnd': receiveHeadersEnd,
    };
  }
}

/// https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-ServiceWorkerResponseSource
class ServiceWorkerResponseSource {
  static String cacheStorage = 'cache-storage';
  static String httpCache = 'http-cache';
  static String fallbackCode = 'fallback-code';
  static String network = 'network';
}

/// https://chromedevtools.github.io/devtools-protocol/tot/Security/#type-SecurityState
/// The security level of a page or resource.
class SecurityState {
  static String unknown = 'unknown';
  static String neutral = 'neutral';
  static String insecure = 'insecure';
  static String secure = 'secure';
  static String info = 'info';
  static String insecureBroken = 'insecure-broken';
}

/// https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-SecurityDetails
class SecurityDetails implements InspectorModel {
  /// Protocol name (e.g. "TLS 1.2" or "QUIC").
  final String protocol;

  /// Key Exchange used by the connection, or the empty string if not applicable.
  final String keyExchange;

  /// (EC)DH group used by the connection, if applicable.
  final String? keyExchangeGroup;

  /// Cipher name.
  final String cipher;

  /// TLS MAC. Note that AEAD ciphers do not have separate MACs.
  final String? mac;

  /// https://chromedevtools.github.io/devtools-protocol/tot/Security/#type-CertificateId
  /// An internal certificate ID value.
  final int certificateId;

  /// Certificate subject name.
  final String subjectName;

  /// Subject Alternative Name (SAN) DNS names and IP addresses.
  final List<String> sanList;

  /// Name of the issuing CA.
  final String issuer;

  /// https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-TimeSinceEpoch
  /// Certificate valid from date.
  final int validFrom;

  /// https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-TimeSinceEpoch
  /// Certificate valid to (expiration) date
  final int validTo;

  final List<SignedCertificateTimestamp> signedCertificateTimestampList;

  /// https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-CertificateTransparencyCompliance
  /// (use CertificateTransparencyCompliance variable member)
  final String certificateTransparencyCompliance;

  SecurityDetails({
    required this.protocol,
    required this.keyExchange,
    this.keyExchangeGroup,
    required this.cipher,
    this.mac,
    required this.certificateId,
    required this.subjectName,
    required this.sanList,
    required this.issuer,
    required this.validFrom,
    required this.validTo,
    required this.signedCertificateTimestampList,
    required this.certificateTransparencyCompliance,
  });

  Map toJson() {
    return {
      'protocol': protocol,
      'keyExchange': keyExchange,
      if (keyExchangeGroup != null) 'keyExchangeGroup': keyExchangeGroup,
      'cipher': cipher,
      if (mac != null) 'mac': mac,
      'certificateId': certificateId,
      'subjectName': subjectName,
      'sanList': sanList,
      'issuer': issuer,
      'validFrom': validFrom,
      'validTo': validTo,
      'signedCertificateTimestampList': signedCertificateTimestampList,
      'certificateTransparencyCompliance': certificateTransparencyCompliance,
    };
  }
}

/// https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-SignedCertificateTimestamp
class SignedCertificateTimestamp implements InspectorModel {
  /// Validation status.
  final String status;

  /// Origin.
  final String origin;

  /// Log name / description.
  final String logDescription;

  /// Log ID.
  final String logId;

  /// https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-TimeSinceEpoch
  /// Issuance date.
  final int timestamp;

  /// Hash algorithm.
  final String hashAlgorithm;

  /// Signature algorithm.
  final String signatureAlgorithm;

  /// Signature data.
  final String signatureData;

  SignedCertificateTimestamp({
    required this.status,
    required this.origin,
    required this.logDescription,
    required this.logId,
    required this.timestamp,
    required this.hashAlgorithm,
    required this.signatureAlgorithm,
    required this.signatureData,
  });

  Map toJson() {
    return {
      'status': status,
      'origin': origin,
      'logDescription': logDescription,
      'logId': logId,
      'timestamp': timestamp,
      'hashAlgorithm': hashAlgorithm,
      'signatureAlgorithm': signatureAlgorithm,
      'signatureData': signatureData,
    };
  }
}

/// https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-CertificateTransparencyCompliance
/// Whether the request complied with Certificate Transparency policy.
class CertificateTransparencyCompliance {
  static String unknown = 'unknown';
  static String notCompliant = 'not-compliant';
  static String compliant = 'compliant';
}

/// https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-ResourceType
/// Resource type as it was perceived by the rendering engine.
class ResourceType {
  static String document = 'Document';
  static String stylesheet = 'Stylesheet';
  static String image = 'Image';
  static String media = 'Media';
  static String font = 'Font';
  static String script = 'Script';
  static String textTrack = 'TextTrack';
  static String xhr = 'XHR';
  static String fetch = 'Fetch';
  static String eventSource = 'EventSource';
  static String webSocket = 'WebSocket';
  static String manifest = 'Manifest';
  static String signedExchange = 'SignedExchange';
  static String ping = 'Ping';
  static String cspViolationReport = 'CSPViolationReport';
  static String preflight = 'Preflight';
  static String other = 'Other';
}

/// Resource mimeType as determined by the browser.
class MimeType {
  static String json = 'application/json';
  static String stream = 'stream';
  static String plain = 'plain';
  static String bytes = 'bytes';
  static String unknown = 'unknown';
  static Map<ResponseType, String> typeStrategyMap = {
    ResponseType.json: json,
    ResponseType.stream: stream,
    ResponseType.plain: plain,
    ResponseType.bytes: bytes,
  };

  static String getType(ResponseType type) {
    return typeStrategyMap[type] ?? unknown;
  }
}

/// 网络工具类
class NetworkUtil {
  /// 获取当前时间戳(单位：秒)
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
      print('getEncodedDataLength error: ${e.toString()}');
      return 0;
    }
  }
}
