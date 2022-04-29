import 'package:voltron_renderer/style.dart';

class ImageVirtualNode extends VirtualNode {
  final int id;
  final int pid;
  final int index;

  ImageVirtualNode(this.id, this.pid, this.index) : super(id, pid, index);

  @override
  MethodPropProvider get provider => throw UnimplementedError();
}
