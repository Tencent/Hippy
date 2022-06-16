import '../engine.dart';

class DevServerHelper {
  final GlobalConfigs _configs;
  final String _serverHost;

  DevServerHelper(this._configs, this._serverHost);

  String createBundleURL(
    String host,
    String bundleName,
    bool devMode,
    bool hmr,
    bool jsMinify,
  ) {
    return "http://$host/$bundleName?dev=$devMode&hot=$hmr&minify=$jsMinify";
  }
}
