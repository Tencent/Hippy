import '../common.dart';
import '../style.dart';

VoltronMap combineProps(VoltronMap origin, VoltronMap diff, {int combineLevel = 0}) {
  var updateProps = VoltronMap();
  for (var diffKey in diff.keySet()) {
    final originValue = origin.get(diffKey);
    final diffValue = diff.get(diffKey);
    if (diffValue is bool ||
        diffValue is num ||
        diffValue is String ||
        diffValue == null) {
      if (originValue == diffValue) {
        continue;
      } else {
        updateProps.push(diffKey, diffValue);
        origin.push(diffKey, diffValue);
      }
    } else if (diffValue is VoltronArray || diffValue is VoltronMap) {
      updateProps.push(diffKey, diffValue);
      origin.push(diffKey, diffValue);
    }
  }

  return updateProps;
}
