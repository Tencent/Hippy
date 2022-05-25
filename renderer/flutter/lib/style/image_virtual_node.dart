import 'package:flutter/material.dart';
import 'package:voltron_renderer/style.dart';

class ImageVirtualNode extends VirtualNode {
  final int id;
  final int pid;
  final int index;

  ImageVirtualNode(this.id, this.pid, this.index) : super(id, pid, index);

  @override
  MethodPropProvider get provider => {};

  WidgetSpan createSpan() {
    return const WidgetSpan(
      child: SizedBox(
        width: 0,
        height: 0,
      ),
    );
  }
}
