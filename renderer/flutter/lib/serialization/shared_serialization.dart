import 'dart:ffi';

abstract class SharedSerialization {
  static final int latestVersion = 13;

  var _nul;
  Object get nul => _nul;

  var _undefined;
  Object get undefined => _undefined;

  var _hole;
  Object get hole => _hole;

  SharedSerialization() {
    _nul = getNull();
    _undefined = getUndefined();
    _hole = getHole();
  }

  Object getUndefined();

  Object? getNull();

  Object getHole();
}
