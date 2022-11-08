import 'manager.dart';
import 'resource_data_holder.dart';

mixin ProcessorCallback {
  void next();
  void onHandleCompleted();
}

mixin Processor {
  void handleRequestAsync(ResourceDataHolder holder, ProcessorCallback callback) {
    callback.next();
  }

  bool handleRequestSync(ResourceDataHolder holder) {
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
