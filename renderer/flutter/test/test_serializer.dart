// @dart=2.9
import 'package:collection/collection.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:voltron_renderer/common.dart';
import 'package:voltron_renderer/util/extension_util.dart';

void testNum(num num) {
  var encodeList = num.encode();
  expect(encodeList.isNotEmpty, true);
  var decodeNum = encodeList.decode();
  expect(decodeNum, num);
}

void testMap(Map object) {
  var encodeList = VoltronMap.fromMap(object).encode();
  expect(encodeList.isNotEmpty, true);
  var decodeMap = (encodeList.decode() as VoltronMap).toMap();
  expect(const DeepCollectionEquality().equals(decodeMap, object), true);
}

void testVoltronMap(VoltronMap voltronMap) {
  var encodeList = voltronMap.encode();
  expect(encodeList.isNotEmpty, true);
  var decodeMap = (encodeList.decode() as VoltronMap).toMap();
  expect(const DeepCollectionEquality().equals(decodeMap, voltronMap.toMap()), true);
}

void main() {
  test('test serializer num', () {
    testNum(11);
    testNum(-11);
    testNum(0.5);
    testNum(-0.5);
    testNum(3.5);
  });

  test('test serializer map', () {
    testMap({
      'moduleName': 'EventDispatcher',
      'methodName': 'receiveNativeEvent',
      'params': ['hardwareBackPress', {'result': 'yes'}]
    });
  });

  test('test serializer voltron map', () {
    var map = VoltronMap();
    map.push("moduleName", 'EventDispatcher');
    map.push("methodName", 'receiveNativeEvent');
    var array = VoltronArray();
    array.push('hardwareBackPress');
    array.push(VoltronMap());
    map.push("params", array);
    testVoltronMap(map);

    map = VoltronMap();
    map.push("moduleName", 'Dimensions');
    map.push("methodName", 'set');
    var paramsMap = VoltronMap();
    var screenPhysicalPixelsMap = VoltronMap();
    var windowPhysicalPixelsMap = VoltronMap();
    screenPhysicalPixelsMap.push('width', 1440);
    screenPhysicalPixelsMap.push('height', 2392);
    screenPhysicalPixelsMap.push('scale', 3.5);
    screenPhysicalPixelsMap.push('fontScale', 1.0);
    screenPhysicalPixelsMap.push('statusBarHeight', 24.0);
    screenPhysicalPixelsMap.push('bottomBarHeight', 0.0);
    screenPhysicalPixelsMap.push('navigationBarHeight', 0.0);
    paramsMap.push('screenPhysicalPixels', screenPhysicalPixelsMap);
    windowPhysicalPixelsMap.push('width', 1440.0);
    windowPhysicalPixelsMap.push('height', 2392.0);
    windowPhysicalPixelsMap.push('fontScale', 1.0);
    windowPhysicalPixelsMap.push('statusBarHeight', 84.0);
    windowPhysicalPixelsMap.push('bottomBarHeight', 0.0);
    paramsMap.push('windowPhysicalPixels', windowPhysicalPixelsMap);
    map.push("params", paramsMap);
    testVoltronMap(map);
  });
}
