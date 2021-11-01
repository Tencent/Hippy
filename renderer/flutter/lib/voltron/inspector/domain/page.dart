import 'package:flutter/scheduler.dart';

import '../../../engine/engine_context.dart';
import '../domain.dart';
import '../inspector.dart';
import '../model/model.dart';

String kPageDomianName = 'Page';

class PageDomain extends InspectDomain {
  int _lastSentSessionID = 0;
  bool _isFramingScreenCast = false;
  EngineContext? _currentEngineContext;

  /// 是否可以同步页面快照，需要有第一次postFrameCallback后，才能获取
  bool _canSyncScreenShot = false;

  PageDomain(Inspector inspector) : super(inspector);

  @override
  String get name => kPageDomianName;

  @override
  void receiveFromFrontend(EngineContext context, int id, String method,
      Map<String, dynamic> params) {
    final strategyMap = {
      'startScreencast': _handleStartScreencast,
      'stopScreencast': _handleStopScreencast,
      'screencastFrameAck': _handleScreencastFrameAck,
      'getResourceContent': _handleGetResourceContent,
      'reload': _handleReload,
    };

    sendToFrontend(context, id, {});
    strategyMap[method]?.call(context, id, params);
  }

  /// https://chromedevtools.github.io/devtools-protocol/tot/Page/#event-screencastFrame
  void _handlePostFrameCallback(Duration timeStamp) async {
    final context = _currentEngineContext;
    if (context == null) {
      return;
    }

    _canSyncScreenShot = true;
    final sessionId = timeStamp.inMilliseconds;
    await handleSyncScreenShot(context, sessionId);
    _lastSentSessionID = sessionId;
  }

  /// 同步界面快照，sessionId为-1时，只同步一次
  Future<void> handleSyncScreenShot(EngineContext context,
      [int sessionId = -1]) async {
    if (!_canSyncScreenShot) {
      return;
    }

    final screenShot = await ScreencastFrame.getScreenShot(context);
    final event = InspectorEvent(
        'Page.screencastFrame', ScreencastFrame(screenShot, sessionId));
    sendEventToFrontend(context, event);
  }

  /// https://chromedevtools.github.io/devtools-protocol/tot/Page/#method-startScreencast
  /// Compressed image data requested by the startScreencast.
  void _handleStartScreencast(
      EngineContext context, int id, Map<String, dynamic> params) {
    _isFramingScreenCast = true;
    _currentEngineContext = context;
    SchedulerBinding.instance?.addPostFrameCallback(_handlePostFrameCallback);
    SchedulerBinding.instance?.scheduleFrame();
  }

  /// https://chromedevtools.github.io/devtools-protocol/tot/Page/#method-stopScreencast
  /// Stops sending each frame in the screencastFrame.
  void _handleStopScreencast(
      EngineContext context, int id, Map<String, dynamic> params) {
    _isFramingScreenCast = false;
  }

  /// https://chromedevtools.github.io/devtools-protocol/tot/Page/#method-screencastFrameAck
  /// Acknowledges that a screencast frame has been received by the frontend.
  void _handleScreencastFrameAck(
      EngineContext context, int id, Map<String, dynamic> params) {
    _currentEngineContext = context;
    final int ackSessionID = params['sessionId'];
    if (ackSessionID == _lastSentSessionID && _isFramingScreenCast) {
      SchedulerBinding.instance?.addPostFrameCallback(_handlePostFrameCallback);
    }
  }

  /// https://chromedevtools.github.io/devtools-protocol/tot/Page/#method-getResourceContent
  /// Returns content of the given resource.
  void _handleGetResourceContent(
      EngineContext context, int id, Map<String, dynamic> params) {
    // TODO: 补充content, devTool.controller.view.elementManager.controller.bundle.content
    sendToFrontend(context, id, {'content': '', 'base64Encoded': false});
  }

  /// https://chromedevtools.github.io/devtools-protocol/tot/Page/#method-reload
  /// Reloads given page optionally ignoring the cache.
  void _handleReload(
      EngineContext context, int id, Map<String, dynamic> params) {
    // TODO: await elementManager.controller.reload();
  }
}
