#import "TencentVoltronRenderPlugin.h"
#if __has_include(<voltron_render/voltron_render-Swift.h>)
#import <voltron_render/voltron_render-Swift.h>
#else
// Support project import fallback if the generated compatibility header
// is not copied when this plugin is created as a library.
// https://forums.swift.org/t/swift-static-libraries-dont-copy-generated-objective-c-header/19816
#import "voltron_render-Swift.h"
#endif

@implementation TencentVoltronRenderPlugin
+ (void)registerWithRegistrar:(NSObject<FlutterPluginRegistrar>*)registrar {
  [SwiftTencentVoltronRenderPlugin registerWithRegistrar:registrar];
}
@end
