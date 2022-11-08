import 'processor.dart';
import 'resource_data_holder.dart';

class VfsManager {
  final List<Processor> _processorChain = [];
  final NativeTraversalsWrapper _wrapper;

  VfsManager({required NativeTraversalsWrapper customWrapper})
      : _wrapper = customWrapper {
    _wrapper.initWrapper();
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
  }

  void fetchResourceAsync(
      String url, Map<String, String> params, FetchResourceCallback callback) {
    onFetchResourceStart();
    _fetchResourceAsyncImpl(url, params, callback, RequestFrom.local);
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
        bool goBack = processor.handleRequestSync(holder);
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
  int initWrapper();

  void destroyWrapper();

  void onTraversalsEndAsync(ResourceDataHolder holder);

  void doNativeTraversalsAsync(
      ResourceDataHolder holder, FetchResourceCallback callback);

  Future doNativeTraversalsSync(ResourceDataHolder holder);
}
