import 'package:voltron_renderer/common.dart';

extension VoltronMapParsing on Map {
  VoltronMap toVoltronMap() {
    var voltronMap = VoltronMap();
    forEach((key, value) {
      if (value is Map) {
        voltronMap.push(key, value.toVoltronMap());
      } else if (value is List) {
        voltronMap.push(key, value.toVoltronArray());
      } else if (value is VoltronMap) {
        voltronMap.push(key, value.toDeepVoltronMap());
      } else if (value is VoltronArray){
        voltronMap.push(key, value.toDeepVoltronArray());
      } else {
        voltronMap.push(key, value);
      }
    });
    return voltronMap;
  }

  Map toDeepMap() {
    var m = {};
    forEach((key, value) {
      if (value is Map) {
        m[key] = value.toDeepMap();
      } else if (value is List) {
        m[key] = value.toDeepList();
      } else if (value is VoltronMap) {
        m[key] = value.toMap();
      } else if (value is VoltronArray){
        m[key] = value.toList();
      } else {
        m[key] = value;
      }
    });
    return m;
  }
// ···
}

extension VoltronArrayParsing on List {
  VoltronArray toVoltronArray() {
    var voltronArray = VoltronArray();
    forEach((element) {
      if (element is Map) {
        voltronArray.push(element.toVoltronMap());
      } else if (element is List) {
        voltronArray.push(element.toVoltronArray());
      }  else if (element is VoltronMap) {
        voltronArray.push(element.toDeepVoltronMap());
      } else if (element is VoltronArray){
        voltronArray.push(element.toDeepVoltronArray());
      } else {
        voltronArray.push(element);
      }
    });
    return voltronArray;
  }

  List toDeepList () {
    var l = [];
    forEach((element) {
      if (element is Map) {
        l.add(element.toDeepMap());
      } else if (element is List) {
        l.add(element.toDeepList());
      }  else if (element is VoltronMap) {
        l.add(element.toMap());
      } else if (element is VoltronArray){
        l.add(element.toList());
      } else {
        l.add(element);
      }
    });
    return l;
  }
// ···
}

