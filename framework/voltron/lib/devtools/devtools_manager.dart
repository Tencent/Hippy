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

import '../bridge.dart';

class DevtoolsManager {
  final bool _devMode;
  int _id = 0;

  DevtoolsManager(this._devMode);

  Future<int> create({
    required int workerManagerId,
    String dataDir = '',
    String wsUrl = '',
  }) async {
    if (!_devMode) return 0;
    _id = await VoltronApi.createDevtools(
      workerManagerId: workerManagerId,
      dataDir: dataDir,
      wsUrl: wsUrl,
    );
    return _id;
  }

  Future<void> destroy({
    bool isReload = false,
  }) async {
    if (!_devMode || _id <= 0) return;
    return await VoltronApi.destroyDevtools(
      _id,
      isReload,
    );
  }
}
