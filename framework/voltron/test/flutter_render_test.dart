//
// Tencent is pleased to support the open source community by making
// Hippy available.
//
// Copyright (C) 2022 THL A29 Limited, a Tencent company.
// All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

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
