// import 'dart:convert';
// import 'package:dio/dio.dart' as $dio;
//
// import '../../adapter/http.dart';
// import '../../engine/engine_context.dart';
// import 'domain.dart';
//
// class Inspector {
//   final Map<String, InspectDomain> _domainRegistrar = {};
//
//   /// 需要同步刷新页面快照的方法集合
//   final _needSyncScreenShotAgainMethodList = [
//     'CSS.setStyleTexts',
//     'DOM.removeNode',
//   ];
//
//   /// 单例模式
//   static final Inspector _instance = Inspector._internal();
//   factory Inspector() => _instance;
//   Inspector._internal() {
//     // 注册各个域模块
//     registerDomain(DomDomain(this));
//     registerDomain(PageDomain(this));
//     registerDomain(CssDomain(this));
//     registerDomain(NetworkDomain(this));
//   }
//
//   /// 注册inspector的调试域
//   void registerDomain(InspectDomain domain) {
//     _domainRegistrar[domain.name] = domain;
//   }
//
//   void sendToFrontend<T>(EngineContext context, int id, T? result) {
//     final bridgeManager = context.bridgeManager;
//     if (bridgeManager.isDevModule == false) {
//       return;
//     }
//
//     bridgeManager.sendWebSocketMessage(jsonEncode({
//       'id': id,
//       'result': result,
//     }));
//   }
//
//   void sendEventToFrontend<T>(EngineContext context, T data) {
//     final bridgeManager = context.bridgeManager;
//     if (bridgeManager.isDevModule == false) {
//       return;
//     }
//
//     bridgeManager.sendWebSocketMessage(jsonEncode(data));
//   }
//
//   bool receiveFromFrontend(EngineContext context, Map<String, dynamic> data) {
//     final int id = data['id'] ?? 0;
//     final String paramsMethod = data['method'] ?? '';
//     final domainParamList = paramsMethod.split('.');
//     final Map<String, dynamic> params = data['params'] ?? {};
//
//     if (domainParamList.length == 2) {
//       final domain = _domainRegistrar[domainParamList[0]];
//       if (domain == null) {
//         return false;
//       }
//
//       final method = domainParamList[1];
//       domain.invoke(context, id, method, params);
//       // 部分方法需要强制刷新一下快照，防止界面快照同步滞后
//       if (_needSyncScreenShotAgainMethodList.contains(paramsMethod)) {
//         Future.delayed(Duration(milliseconds: 100), () {
//           final pageDomain = _domainRegistrar[kPageDomianName] as PageDomain;
//           pageDomain.handleSyncScreenShot(context);
//         });
//       }
//       return true;
//     }
//
//     return false;
//   }
//
//   /// 同步更新Document
//   void updateDocument(EngineContext context) {
//     final domDomain = _domainRegistrar[kDomDomainName] as DomDomain;
//     domDomain.handleDocumentUpdated(context);
//   }
//
//   /// 拦截准备发送网络请求的钩子函数
//   void requestWillBeSent(
//       EngineContext context, String requestId, HttpRequest request) {
//     final networkDomain = _domainRegistrar[kNetworkDomainName] as NetworkDomain;
//     networkDomain.handleRequestWillBeSent(context, requestId, request);
//   }
//
//   /// 拦截网络请求成功响应的钩子函数
//   void responseReceived(
//       EngineContext context, String requestId, $dio.Response? response) {
//     if (response == null) {
//       return;
//     }
//
//     final networkDomain = _domainRegistrar[kNetworkDomainName] as NetworkDomain;
//     networkDomain.handleResponseReceived(context, requestId, response);
//     // 需要发起loading完成，才会触发Network.getResponseBody获取响应数据
//     networkDomain.handleLoadingFinished(context, requestId, response);
//   }
// }
