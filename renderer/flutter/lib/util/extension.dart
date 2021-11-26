extension AnyEx<T> on T  {
  void let(Function(T it) call) {
    call(this);
  }

  T also(Function(T it) call) {
    call(this);
    return this;
  }

  E? safeAs<E>() {
    var cur = this;
    if (cur is E) {
      return cur;
    }
    return null;
  }
}
