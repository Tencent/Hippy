typedef GenerateNativeItemFunc = int Function();
typedef FreeNativeItemFunc = void Function(int);

abstract class INativeHolder {
  int _nativePtr = 0;
  final FreeNativeItemFunc _free;

  INativeHolder(GenerateNativeItemFunc func, this._free) {
    _nativePtr = func();
  }

  int get nativePtr {
    return _nativePtr;
  }

  //  不需要使用的时候，需要主动调用free
  void free() {
    _free(_nativePtr);
  }
}
