//
//  Generated file. Do not edit.
//

import FlutterMacOS
import Foundation

import connectivity_plus_macos
import device_info_plus_macos
import package_info_plus_macos
import path_provider_macos
import shared_preferences_macos
import sqflite
import tencent_voltron_render

func RegisterGeneratedPlugins(registry: FlutterPluginRegistry) {
  ConnectivityPlugin.register(with: registry.registrar(forPlugin: "ConnectivityPlugin"))
  DeviceInfoPlusMacosPlugin.register(with: registry.registrar(forPlugin: "DeviceInfoPlusMacosPlugin"))
  FLTPackageInfoPlusPlugin.register(with: registry.registrar(forPlugin: "FLTPackageInfoPlusPlugin"))
  PathProviderPlugin.register(with: registry.registrar(forPlugin: "PathProviderPlugin"))
  SharedPreferencesPlugin.register(with: registry.registrar(forPlugin: "SharedPreferencesPlugin"))
  SqflitePlugin.register(with: registry.registrar(forPlugin: "SqflitePlugin"))
  TencentVoltronRenderPlugin.register(with: registry.registrar(forPlugin: "TencentVoltronRenderPlugin"))
}
