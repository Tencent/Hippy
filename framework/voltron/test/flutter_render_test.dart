import 'package:flutter_test/flutter_test.dart';
import 'package:voltron/inspector/dev_remote_server_data.dart';

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

  test('dev_server_data', () {
    final data = DevRemoteServerData('http://1.1.1.1:8080/abcdefg/index.bundle?debugUrl=ws%3A%2F%2F0.0.0.0%3A8080%2Fdebugger-proxy');
    expect(data.isValid(), true);
    expect(data.getVersionId(), 'abcdefg');
    expect(data.getHost(), '1.1.1.1:8080');
  });
}
