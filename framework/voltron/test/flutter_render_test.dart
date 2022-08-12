import 'package:flutter_test/flutter_test.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {});

  tearDown(() {});

  int addNum(int a, int b) {
    return a + b;
  }

  test('dynamicFuncCall', () {
    Function function = addNum;
    expect(Function.apply(function, [1, 2]), 3);
  });
}
