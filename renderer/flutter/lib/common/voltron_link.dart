/// voltron自定义的双向链表节点
class VoltronLinkNode<T> {
  /// 前向节点
  VoltronLinkNode<T>? prev;

  /// 后向节点
  VoltronLinkNode<T>? next;

  /// 节点值
  T? value;

  VoltronLinkNode({
    this.prev,
    this.next,
    this.value,
  });
}
