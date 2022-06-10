import '../engine.dart';
import '../inspector.dart';

class DevFactory {
  static DevServerInterface create(
    GlobalConfigs configs,
    bool enableDev,
    String serverHost,
    String bundleName,
  ) {
    if (enableDev) {
      return new DevServerImpl(configs, serverHost, bundleName);
    } else {
      return new DevServerImplDisable(configs, serverHost);
    }
  }
}
