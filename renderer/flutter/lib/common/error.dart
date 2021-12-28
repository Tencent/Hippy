class JsError extends Error {
  final Object? _message;
  final String? _stack;

  String get msg => _message?.toString() ?? '';

  JsError([this._message, this._stack]);

  String toString() {
    if (_message != null) {
      return "Js error: ${Error.safeToString(_message)}, stack:$_stack";
    }
    return "Js error";
  }
}
