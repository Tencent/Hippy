import 'package:voltron_vfs/resource_data_holder.dart';

import 'manager.dart';

class VfsWrapper with NativeTraversalsWrapper {
  VfsWrapper() {

  }

  @override
  int initWrapper() {
    // TODO: implement initWrapper
    throw UnimplementedError();
  }

  @override
  void destroyWrapper() {
    // TODO: implement destroyWrapper
  }

  @override
  void doNativeTraversalsAsync(ResourceDataHolder holder, FetchResourceCallback callback) {
    // TODO: implement doNativeTraversalsAsync
  }

  @override
  Future doNativeTraversalsSync(ResourceDataHolder holder) {
    // TODO: implement doNativeTraversalsSync
  }


  @override
  void onTraversalsEndAsync(ResourceDataHolder holder) {
    // TODO: implement onTraversalsEndAsync
  }

}
