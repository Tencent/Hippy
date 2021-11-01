import 'dart:io';

import '../common/voltron_array.dart';
import '../common/voltron_map.dart';
import '../dom/manager.dart';
import '../engine/engine_context.dart';
import '../util/log_util.dart';
import '../widget/root.dart';
import 'module.dart';
import 'promise.dart';

@NativeModule(UIManagerModule.uiModuleName)
class UIManagerModule extends VoltronNativeModule {
  static const String moduleTag = "UIManagerModule";
  static const String uiModuleName = "UIManagerModule";
  static const String propOptionType = "optionType";
  static const String funcCreateNode = "createNode";
  static const String funcUpdateNode = "updateNode";
  static const String funcDeleteNode = "deleteNode";
  static const String funcFlushBatch = "flushBatch";
  static const String funcCallUIFunction = "callUIFunction";
  static const String funcMeasureInWindow = "measureInWindow";
  static const String funcStartBatch = "startBatch";
  static const String funcEndBatch = "endBatch";

  static const String propParam = "param";
  static const String propID = "id";
  static const String propPID = "pId";
  static const String propIndex = "index";
  static const String propName = "name";
  static const String propTagName = "tagName";
  static const String propProps = "props";

  UIManagerModule(EngineContext context) : super(context);

  @override
  Map<String, Function> get extraFuncMap => {
        funcCreateNode: createNode,
        funcDeleteNode: deleteNode,
        funcUpdateNode: updateNode,
        funcFlushBatch: flushBatch,
        funcCallUIFunction: callUIFunction,
        funcMeasureInWindow: measureInWindow,
        funcStartBatch: startBatch,
        funcEndBatch: endBatch
      };

  @override
  String get moduleName => UIManagerModule.uiModuleName;

  @VoltronMethod(funcCreateNode)
  bool createNode(int rootID, VoltronArray voltronArray, Promise promise) {
    var rootView = context.getInstance(rootID);
    var domManager = context.domManager;
    if (rootView != null) {
      var len = voltronArray.size();
      var info = <String, int>{};
      for (var i = 0; i < len; i++) {
        VoltronMap nodeArray = voltronArray.get(i);
        var tag = nodeArray.get(propID) ?? 0;
        var pTag = nodeArray.get(propPID) ?? 0;
        var index = nodeArray.get(propIndex) ?? 0;
        var className = nodeArray.get(propName) ?? '';
        var tagName = nodeArray.get(propTagName) ?? '';
        if (!info.containsKey(className)) {
          info[className] = 0;
        }
        var value = info[className];
        if (value != null) {
          info[className] = value + 1;
        }
        var props = nodeArray.get(propProps) ?? null;
        domManager.createNode(
            rootView, tag, pTag, index, className, tagName, props);
      }

      context.engineMonitor.setCreateNodeInfo(len, info);
    }

    return false;
  }

  @VoltronMethod(funcUpdateNode)
  bool updateNode(int rootID, VoltronArray updateArray, Promise promise) {
    var rootView = context.getInstance(rootID);
    var domManager = context.domManager;
    if (updateArray.size() > 0 && rootView != null) {
      var len = updateArray.size();
      var info = <String, int>{};
      for (var i = 0; i < len; i++) {
        VoltronMap nodeMap = updateArray.get(i);
        var id = nodeMap.get(propID) ?? 0;
        var name = nodeMap.get(propName) ?? '';
        if (!info.containsKey(name)) {
          info[name] = 0;
        }
        var value = info[name];
        if (value != null) {
          info[name] = value + 1;
        }
        VoltronMap props = nodeMap.get(propProps);
        domManager.updateNode(id, props, rootView);
      }
      context.engineMonitor.setUpdateNodeInfo(len, info);
    }

    return false;
  }

  @VoltronMethod(funcDeleteNode)
  bool deleteNode(int rootId, VoltronArray delete, Promise promise) {
    LogUtils.dDom("delete node(page:$rootId), params:($delete)");
    var domManager = context.domManager;
    if (delete.size() > 0) {
      var len = delete.size();
      var info = <String, int>{};
      for (var i = 0; i < len; i++) {
        VoltronMap nodeMap = delete.get(i);
        var id = nodeMap.get(propID) ?? 0;
        var name = nodeMap.get(propName) ?? '';
        if (!info.containsKey(name)) {
          info[name] = 0;
        }
        var value = info[name];
        if (value != null) {
          info[name] = value + 1;
        }
        domManager.deleteNode(rootId, id);
      }
      context.engineMonitor.setDeleteNodeInfo(len, info);
    }
    return false;
  }

  @VoltronMethod(funcFlushBatch)
  bool flushBatch(int rootId, VoltronArray voltronArray, Promise promise) {
    LogUtils.i(moduleTag, "flush batch:$rootId");
    if (voltronArray.size() > 0) {
      var len = voltronArray.size();
      for (var i = 0; i < len; i++) {
        VoltronMap paramsMap = voltronArray.get(i);
        String optionType = paramsMap.get(propOptionType);
        switch (optionType) {
          case funcCreateNode:
            createNode(rootId, paramsMap.get(propParam), promise);
            break;
          case funcUpdateNode:
            updateNode(rootId, paramsMap.get(propParam), promise);
            break;
          case funcDeleteNode:
            deleteNode(rootId, paramsMap.get(propParam), promise);
            break;
        }
      }
    }
    return false;
  }

  @VoltronMethod(funcCallUIFunction)
  bool callUIFunction(VoltronArray voltronArray, Promise promise) {
    var domManager = context.domManager;
    if (voltronArray.size() > 0) {
      var offset = 0;
      if (Platform.isIOS) {
        offset = 1;
      }
      int id = voltronArray.get(offset);
      String functionName = voltronArray.get(offset + 1);
      VoltronArray array = voltronArray.get(offset + 2);
      domManager.dispatchUIFunction(id, functionName, array, promise);
    }

    return true;
  }

  @VoltronMethod(funcMeasureInWindow)
  bool measureInWindow(int id, Promise promise) {
    LogUtils.i(moduleTag, "measureInWindow:$id");
    var domManager = context.domManager;
    domManager.measureInWindow(id, promise);
    LogUtils.d(moduleTag, "measure in window($id, promise:$promise)");
    return true;
  }

  @VoltronMethod(funcStartBatch)
  bool startBatch(String renderID, Promise promise) {
    LogUtils.i(moduleTag, "startBatch:$renderID");
    var domManager = context.domManager;
    domManager.renderBatchStart(renderID);
    context.engineMonitor.startBatch();
    return false;
  }

  @VoltronMethod(funcEndBatch)
  bool endBatch(String renderID, Promise promise) {
    LogUtils.i(moduleTag, "endBatch:$renderID");
    var domManager = context.domManager;
    domManager.renderBatchEnd(renderID);
    context.engineMonitor.endBatch();
    return false;
  }
}
