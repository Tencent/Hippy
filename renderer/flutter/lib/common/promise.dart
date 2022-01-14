import '../render.dart';

abstract class Promise {
  static const String kCallIdNoCallback = "-1";

  final String _callId;

  String get callId => _callId;

  Promise(this._callId);

  bool isCallback() => _callId != kCallIdNoCallback;

  void resolve(Object? value);
}

class NativePromise extends Promise {
  bool keep = true;
  final int _rootId;
  final RenderContext _context;

  NativePromise(RenderContext context, {required String callId, required int rootId})
      : _context = context, _rootId = rootId, super(callId);

  @override
  void resolve(Object? value) {
    if (!isCallback()) {
      return;
    }

    _context.bridgeManager.execNativeCallback(_rootId, _callId, value ?? 'unknown');
  }
}
