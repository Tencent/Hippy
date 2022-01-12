import '../common.dart';
import '../engine.dart';
import 'module.dart';
import 'promise.dart';

class UtilsModule extends VoltronNativeModule {
  static const String kUtilsModuleName = "UtilsModule";
  static const String kFuncCheckAPI = "checkApi";
  EngineContext? _context;

  UtilsModule(EngineContext context) : super(context) {
    _context = context;
  }

  @VoltronMethod(kFuncCheckAPI)
  bool checkApi(VoltronMap message, JSPromise promise) {
    var nativeModuleMap = _context?.moduleManager.nativeModule;
    var jsModuleMap = _context?.moduleManager.jsModule;
    var controllerGeneratorMap = _context?.moduleManager.controllerGenerator;
    List? checkModuleList = message.get('module')?.toList();
    List? checkComponentList = message.get('component')?.toList();
    var result = VoltronMap();

    if (checkModuleList != null && checkModuleList.isNotEmpty) {
      var moduleResult = VoltronMap();
      for (var item in checkModuleList) {
        var ret = false;
        if (nativeModuleMap != null) {
          ret = nativeModuleMap[item] != null;
        }
        if (!ret && jsModuleMap != null) {
          ret = jsModuleMap[item] != null;
        }
        moduleResult.push(item, ret);
      }
      result.push('module', moduleResult);
    }

    if (checkComponentList != null &&
        controllerGeneratorMap != null &&
        checkComponentList.isNotEmpty) {
      var componentResult = VoltronMap();
      for (var item in checkComponentList) {
        componentResult.push(item, controllerGeneratorMap[item] != null);
      }
      result.push('component', componentResult);
    }

    promise.resolve(result);
    return true;
  }

  @override
  Map<String, Function> get extraFuncMap => {kFuncCheckAPI: checkApi};

  @override
  String get moduleName => kUtilsModuleName;
}
