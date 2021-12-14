export 'css.dart';
export 'dom.dart';
export 'network.dart';
export 'page.dart';

/// 调试数据模型
// ignore: one_member_abstracts
abstract class InspectorModel {
  Map toJson();
}
