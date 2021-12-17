import '../common/voltron_map.dart';

import 'bundle.dart';
import 'instance_context.dart';

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
  // 可选参数 方便对将本View和Context进行绑定。对于这种场景时有用：某些View组件的创建先于业务模块初始化的时机（也就是View组件的预先创建、预加载）。
  InstanceContext? instanceContext;
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
    instanceContext = params.instanceContext;
    codeCacheTag = params.codeCacheTag;
    bundleLoader = params.bundleLoader;
  }
}
