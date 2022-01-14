import 'controller.dart';

class ViewControllerGenerator {
  final String _name;
  final Generator<VoltronViewController, Object?> _generator;
  final bool _isLazy;

  ViewControllerGenerator(this._name, this._generator, [this._isLazy = false]);

  String get name => _name;

  VoltronViewController get generateController => _generator(null);

  bool get isLazy => _isLazy;
}

typedef Generator<T, V> = T Function(V params);
