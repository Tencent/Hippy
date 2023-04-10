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

import 'processor.dart';
import 'resource_data_holder.dart';
import 'vfs_wrapper.dart';

class VfsManager {
  static final Map<int, VfsManager> _vfsMap = {};
  final List<Processor> _processorChain = [];
  final NativeTraversalsWrapper _wrapper;

  int get id => _wrapper.id;

  static VfsManager? find(int id) {
    return _vfsMap[id];
  }

  VfsManager({NativeTraversalsWrapper? customWrapper})
      : _wrapper = customWrapper??DefaultVfsWrapper() {
    _wrapper.initWrapper();
    _vfsMap[_wrapper.id] = this;
  }

  void addProcessor(Processor processor) {
    addProcessorAtFirst(processor);
  }

  void addProcessorAtFirst(Processor processor) {
    _processorChain.insert(0, processor);
  }

  void addProcessorAtLast(Processor processor) {
    _processorChain.add(processor);
  }

  void removeProcessor(Processor processor) {
    _processorChain.remove(processor);
  }

  void destroy() {
    _processorChain.clear();
    _wrapper.destroyWrapper();
    _vfsMap.remove(_wrapper.id);
  }

  void fetchResourceAsync(
      String url, Map<String, String> params, FetchResourceCallback callback) {
    onFetchResourceStart();
    _fetchResourceAsyncImpl(url, params, callback, RequestFrom.local);
  }

  void nativeCallFetchResource(String url, Map<String, String> params, int requestId) {
    ResourceDataHolder holder = ResourceDataHolder(
        url: url, requestHeaders: params, requestFrom: RequestFrom.native, nativeRequestId: requestId);
    _traverseForward(holder, false);
  }

  Future<ResourceDataHolder> fetchResourceSync(String url, Map<String, String> params) async {
    onFetchResourceStart();
    ResourceDataHolder holder =
        await _fetchResourceSyncImpl(url, params, RequestFrom.local);
    onFetchResourceEnd(holder);
    return holder;
  }

  Future<ResourceDataHolder> _fetchResourceSyncImpl(
      String url, Map<String, String> params, RequestFrom from) async {
    ResourceDataHolder holder = ResourceDataHolder(
        url: url, requestHeaders: params, requestFrom: from);
    await _traverseForward(holder, true);
    return holder;
  }

  Future _fetchResourceAsyncImpl(String url, Map<String, String> params,
      FetchResourceCallback callback, RequestFrom from) async {
    ResourceDataHolder holder = ResourceDataHolder(
        url: url,
        requestHeaders: params,
        callback: callback,
        requestFrom: from);
    await _traverseForward(holder, false);
  }

  Future _traverseForward(ResourceDataHolder holder, bool isSync) async {
    int index = holder.index + 1;
    if (index < _processorChain.length) {
      holder.index = index;
      Processor processor = _processorChain[index];
      if (isSync) {
        bool goBack = await processor.handleRequestSync(holder);
        if (goBack) {
          _traverseGoBack(holder, true);
        } else {
          _traverseForward(holder, true);
        }
      } else {
        processor.handleRequestAsync(
            holder, _ForwardProcessorCallback(this, holder));
      }
    } else if (isSync) {
      if (holder.requestFrom == RequestFrom.local) {
        await _doNativeTraversalsSync(holder);
      } else if (holder.requestFrom == RequestFrom.native) {
        _traverseGoBack(holder, true);
      }
    } else {
      if (holder.requestFrom == RequestFrom.local) {
        performNativeTraversals(holder);
      } else if (holder.requestFrom == RequestFrom.native) {
        _traverseGoBack(holder, false);
      }
    }
  }

  void _traverseGoBack(ResourceDataHolder holder, bool isSync) {
    int index = holder.index - 1;
    if (index >= 0 && index < _processorChain.length) {
      holder.index = index;
      Processor processor = _processorChain[index];
      if (isSync) {
        processor.handleResponseSync(holder);
        _traverseGoBack(holder, true);
      } else {
        processor.handleResponseAsync(
            holder, _BackProcessorCallback(this, holder));
      }
    } else if (!isSync) {
      if (holder.requestFrom == RequestFrom.local) {
        onFetchResourceEnd(holder);
      } else if (holder.requestFrom == RequestFrom.native) {
        _onTraversalsEndAsync(holder);
      }
    }
  }

  void performNativeTraversals(final ResourceDataHolder holder) {
    _doNativeTraversalsAsync(holder,
        (ResourceDataHolder dataHolder) {
      _traverseGoBack(holder, false);
    });
  }

  void onFetchResourceStart() {
    // empty
  }

  void onFetchResourceEnd(final ResourceDataHolder holder) {
    holder.callback?.call(holder);
  }

  void _onTraversalsEndAsync(ResourceDataHolder holder) {
    _wrapper.onTraversalsEndAsync(holder);
  }

  void _doNativeTraversalsAsync(
      ResourceDataHolder holder, FetchResourceCallback callback) {
    _wrapper.doNativeTraversalsAsync(holder, callback);
  }

  Future _doNativeTraversalsSync(ResourceDataHolder holder) {
    return _wrapper.doNativeTraversalsSync(holder);
  }
}

class _ForwardProcessorCallback with ProcessorCallback {
  final VfsManager _manager;
  final ResourceDataHolder _holder;

  _ForwardProcessorCallback(this._manager, this._holder);

  @override
  void next() {
    _manager._traverseForward(_holder, false);
  }

  @override
  void onHandleCompleted() {
    _manager._traverseGoBack(_holder, false);
  }
}

class _BackProcessorCallback with ProcessorCallback {
  final VfsManager _manager;
  final ResourceDataHolder _holder;

  _BackProcessorCallback(this._manager, this._holder);

  @override
  void next() {
    // It only needs to be processed when traversing forward
  }

  @override
  void onHandleCompleted() {
    _manager._traverseGoBack(_holder, false);
  }
}

mixin NativeTraversalsWrapper {
  int get id;

  int initWrapper();

  void destroyWrapper();

  void onTraversalsEndAsync(ResourceDataHolder holder);

  void doNativeTraversalsAsync(
      ResourceDataHolder holder, FetchResourceCallback callback);

  Future doNativeTraversalsSync(ResourceDataHolder holder);
}
