//
//  Generated file. Do not edit.
//

// clang-format off

#include "generated_plugin_registrant.h"

#include <connectivity_plus_windows/connectivity_plus_windows_plugin.h>
#include <tencent_voltron_render/tencent_voltron_render_plugin.h>

void RegisterPlugins(flutter::PluginRegistry* registry) {
  ConnectivityPlusWindowsPluginRegisterWithRegistrar(
      registry->GetRegistrarForPlugin("ConnectivityPlusWindowsPlugin"));
  TencentVoltronRenderPluginRegisterWithRegistrar(
      registry->GetRegistrarForPlugin("TencentVoltronRenderPlugin"));
}
