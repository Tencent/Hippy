import 'processor.dart';
import 'resource_data_holder.dart';

mixin ResourceLoader {
  void fetchResourceAsync(ResourceDataHolder holder, ProcessorCallback callback);
  Future<bool> fetchResourceSync(ResourceDataHolder holder);
}
