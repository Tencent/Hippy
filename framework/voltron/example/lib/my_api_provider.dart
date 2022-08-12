import 'package:tencent_voltron_render/engine.dart';
import 'package:voltron_render_example/module/test_module.dart';
import 'package:voltron_renderer/voltron_renderer.dart';

class MyAPIProvider implements APIProvider {
  @override
  List<ModuleGenerator> get nativeModuleGeneratorList => [
        ModuleGenerator(
          TestModule.kModuleName,
          (context) => TestModule(context),
        ),
      ];

  @override
  List<JavaScriptModuleGenerator> get javaScriptModuleGeneratorList => [];

  @override
  List<ViewControllerGenerator> get controllerGeneratorList => [];
}
