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

import 'package:voltron_vfs/resource_loader.dart';

import 'resource_data_holder.dart';

mixin ProcessorCallback {
  void next();
  void onHandleCompleted();
}

mixin Processor {
  void handleRequestAsync(ResourceDataHolder holder, ProcessorCallback callback) {
    callback.next();
  }

  Future<bool> handleRequestSync(ResourceDataHolder holder) async {
    return false;
  }

  void handleResponseAsync(ResourceDataHolder holder,
      ProcessorCallback callback) {
    // The callback must be called after the response is processed
    callback.onHandleCompleted();
  }

  void handleResponseSync(ResourceDataHolder holder) {
    // Need do nothing by default
  }
}

class DefaultProcessor with Processor {
  final ResourceLoader _resourceLoader;

  DefaultProcessor(this._resourceLoader);

  @override
  void handleRequestAsync(ResourceDataHolder holder, ProcessorCallback callback) {
    if (_checkResourceData(holder)) {
      callback.onHandleCompleted();
    } else {
      _resourceLoader.fetchResourceAsync(holder, callback);
    }
  }

  @override
  Future<bool> handleRequestSync(ResourceDataHolder holder) async {
    if (_checkResourceData(holder)) {
      return true;
    }
    return await _resourceLoader.fetchResourceSync(holder);
  }

  bool _checkResourceData(ResourceDataHolder holder) {
    if (holder.resultCode != FetchResultCode.ok) {
      return false;
    }
    if (holder.buffer != null && (holder.buffer?.length??0) > 0) {
      return true;
    }
    return false;
  }

}
