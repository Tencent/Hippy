import '../common/voltron_map.dart';
import '../widget/root.dart';

abstract class DomActionInterceptor {
  VoltronMap onCreateNode(
      int tagId, RootWidgetViewModel rootView, VoltronMap? props);

  VoltronMap onUpdateNode(
      int tagId, RootWidgetViewModel rootView, VoltronMap props);

  void onDeleteNode(int tagId);
}
