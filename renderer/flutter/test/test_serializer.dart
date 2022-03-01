// @dart=2.9
import 'package:flutter_test/flutter_test.dart';
import 'package:voltron_renderer/util/extension_util.dart';

void main() {
  void testNum(num num) {
    var encodeList = num.encode();
    expect(encodeList.isNotEmpty, true);
    var decodeNum = encodeList.decode();
    expect(decodeNum, num);
  }

  test('test serializer num', () {
    testNum(11);
    testNum(-11);
    testNum(0.5);
    testNum(-0.5);
  });
}
