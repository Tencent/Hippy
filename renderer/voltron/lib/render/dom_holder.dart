import 'package:voltron_renderer/voltron_renderer.dart';


class DomHolder with Destroyable {
  final int _domInstanceId;
  final RenderContext _context;

  int get id => _domInstanceId;

  DomHolder(this._context): _domInstanceId = _context.bridgeManager.createDomInstance();

  @override
  void destroy() {
    if (_domInstanceId != 0) {
      _context.bridgeManager.destroyDomInstance(_domInstanceId);
    }
  }

  void addRoot(int rootId) {
    assert(_domInstanceId != 0);
    _context.bridgeManager.addRoot(_domInstanceId, rootId);
  }

  void removeRoot(int rootId) {
    _context.bridgeManager.removeRoot(_domInstanceId, rootId);
  }

}
