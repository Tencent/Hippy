class VoltronPair<T1, T2> {
  VoltronPair(this.left, this.right);

  final T1 left;
  final T2 right;

  @override
  String toString() => 'Pair[$left, $right]';
}
