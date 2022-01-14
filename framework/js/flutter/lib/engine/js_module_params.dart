import 'package:voltron_renderer/voltron_renderer.dart';

import 'bundle.dart';
import 'js_instance_context.dart';

class ModuleLoadParams {
  //
  // 必须参数 业务模块jsbundle中定义的组件名称。componentName对应的是js文件中的"appName"，比如：
  // var voltron = new Voltron({
  //     appName: "Demo",
  //     entryPage: App
  // });
  // */
  String componentName = "appName";

  // 可选参数 三选一设置 自己开发的业务模块的jsbundle的assets路径
  String? jsAssetsPath;
  // 可选参数 三选一设置 自己开发的业务模块的文件路径
  String? jsFilePath;
  // 可选参数 三选一设置 自己开发的业务模块的文件路径
  String? jsHttpPath;
  // 可选参数 传递给前端的rootview：比如：entryPage: class App extends Component
  VoltronMap? jsParams;
  // 可选参数 Bundle加载器，老式用法，不建议使用（若一定要使用，则会覆盖jsAssetsPath，jsFilePath的值）。参见jsAssetsPath，jsFilePath
  // 可选参数 code cache的名字，如果设置为空，则不启用code cache，默认为 ""
  String codeCacheTag = "";
  VoltronBundleLoader? bundleLoader;

  ModuleLoadParams();

  ModuleLoadParams.copy(ModuleLoadParams params) {
    jsAssetsPath = params.jsAssetsPath;
    jsFilePath = params.jsFilePath;
    jsHttpPath = params.jsHttpPath;
    componentName = params.componentName;
    jsParams = params.jsParams;
    codeCacheTag = params.codeCacheTag;
    bundleLoader = params.bundleLoader;
  }
}
