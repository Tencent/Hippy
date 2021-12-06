import '../common/voltron_array.dart';
import '../common/voltron_map.dart';
import '../dom/prop.dart';

VoltronMap diffProps(VoltronMap? from, VoltronMap to, int diffLevel) {
  if (from == null) {
    return to;
  }
  var updateProps = VoltronMap();
  for (var fromKey in from.keySet()) {
    final fromValue = from.get(fromKey);
    final toValue = to.get(fromKey);
    if (fromValue is bool ||
        fromValue is num ||
        fromValue is String ||
        fromValue == null) {
      if (fromValue == toValue) {
        continue;
      } else {
        updateProps.push(fromKey, toValue);
      }
    } else if (fromValue is VoltronArray) {
      if ((toValue is VoltronArray)) {
        var diffResult = diffArray(fromValue, toValue, diffLevel + 1);
        //这里diffResult == null标识属性没有更新
        if (diffResult != null /* && diffResult.size() > 0*/) {
          updateProps.push(fromKey, toValue);
        }
      } else {
        // toValue(Array)没有的时候，要给个默认值
        updateProps.push(fromKey, null);
      }
    } else if (fromValue is VoltronMap) {
      if ((toValue is VoltronMap)) {
        var diffResult = diffProps(fromValue, toValue, diffLevel + 1);
        if (diffResult.size() > 0) {
          if (diffLevel == 0 && fromKey == NodeProps.style) {
            updateProps.push(fromKey, diffResult);
          } else {
            updateProps.push(fromKey, toValue);
          }
        }
      } else if (diffLevel == 0 && fromKey == NodeProps.style) {
        //style is null
        var diffResult = diffProps(fromValue, VoltronMap(), diffLevel + 1);
        updateProps.push(fromKey, diffResult);
      } else {
        // toValue没有的时候，要给个默认值
        updateProps.push(fromKey, null);
      }
    }
  }

  for (var toEntry in to.entrySet()) {
    var key = toEntry.key;
    if (from.keySet().contains(key)) {
      continue;
    }

    var value = toEntry.value;
    updateProps.push(key, value);
  }
  return updateProps;
}

VoltronArray? diffArray(
    VoltronArray fromValue, VoltronArray toValue, int diffLevel) {
  if (fromValue.size() != toValue.size()) {
    return toValue;
  }
  var size = fromValue.size();

  for (var i = 0; i < size; i++) {
    Object from = fromValue.get(i);
    Object to = toValue.get(i);
    // 这里默认from & to的类型相同
    if (from is bool || from is num || from is String) {
      if (from != to) {
        return toValue;
      }
    } else if (from is num) {
      if (from != to) {
        return toValue;
      }
    } else if (from is VoltronArray) {
      if (to is VoltronArray) {
        var diffResult = diffArray(from, to, diffLevel);
        if (diffResult != null) {
          return toValue;
        }
      }
    } else if (from is VoltronMap) {
      if (to is VoltronMap) {
        var diffResult = diffProps(from, to, diffLevel);
        if (diffResult.size() > 0) {
          return toValue;
        }
      }
    }
  }
  return null;
}
