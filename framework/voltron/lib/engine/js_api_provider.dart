//
// Tencent is pleased to support the open source community by making
// Hippy available.
//
// Copyright (C) 2022 THL A29 Limited, a Tencent company.
// All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import 'package:voltron_renderer/voltron_renderer.dart';

import '../module.dart';
import 'js_engine_context.dart';

abstract class APIProvider {
  List<ModuleGenerator> get nativeModuleGeneratorList;

  List<JavaScriptModuleGenerator> get javaScriptModuleGeneratorList;

  List<ViewControllerGenerator> get controllerGeneratorList;
}

class ModuleGenerator {
  final String _name;
  final Generator<VoltronNativeModule, EngineContext> _generator;

  ModuleGenerator(this._name, this._generator);

  String get name => _name;

  VoltronNativeModule generateModule(EngineContext context) => _generator(context);
}

class JavaScriptModuleGenerator {
  final String _name;
  final Generator<JavaScriptModule, EngineContext> _generator;

  JavaScriptModuleGenerator(this._name, this._generator);

  String get name => _name;

  JavaScriptModule generateJsModule(EngineContext context) => _generator(context);
}

class CoreApi implements APIProvider {
  CoreApi();

  @override
  List<ViewControllerGenerator> get controllerGeneratorList => [
        ViewControllerGenerator(
          DivController.kClassName,
          (object) => DivController(),
        ),
        ViewControllerGenerator(
          TextController.kClassName,
          (object) => TextController(),
        ),
        ViewControllerGenerator(
          ListViewController.kClassName,
          (object) => ListViewController(),
        ),
        ViewControllerGenerator(
          ListItemViewController.kClassName,
          (object) => ListItemViewController(),
        ),
        ViewControllerGenerator(
          ListPullHeaderViewController.kClassName,
          (object) => ListPullHeaderViewController(),
        ),
        ViewControllerGenerator(
          ListPullFooterViewController.kClassName,
          (object) => ListPullFooterViewController(),
        ),
        ViewControllerGenerator(
          RefreshWrapperController.kClassName,
          (object) => RefreshWrapperController(),
        ),
        ViewControllerGenerator(
          RefreshItemController.kClassName,
          (object) => RefreshItemController(),
        ),
        ViewControllerGenerator(
          ScrollViewController.kClassName,
          (object) => ScrollViewController(),
        ),
        ViewControllerGenerator(
          ImageController.kClassName,
          (object) => ImageController(),
        ),
        ViewControllerGenerator(
          TextInputController.kClassName,
          (object) => TextInputController(),
        ),
        ViewControllerGenerator(
          ModalController.kClassName,
          (object) => ModalController(),
        ),
        ViewControllerGenerator(
          ViewPagerController.kClassName,
          (object) => ViewPagerController(),
        ),
        ViewControllerGenerator(
          ViewPagerItemController.kClassName,
          (object) => ViewPagerItemController(),
        ),
        ViewControllerGenerator(
          WebViewViewController.kClassName,
          (object) => WebViewViewController(),
        ),
        ViewControllerGenerator(
          WaterfallViewController.kClassName,
          (object) => WaterfallViewController(),
        ),
        ViewControllerGenerator(
          WaterfallItemViewController.kClassName,
          (object) => WaterfallItemViewController(),
        ),
        ViewControllerGenerator(
          RootNodeController.kClassName,
          (object) => RootNodeController(),
        ),
      ];

  @override
  List<JavaScriptModuleGenerator> get javaScriptModuleGeneratorList => [
        JavaScriptModuleGenerator(
          EventDispatcher.kModuleName,
          EventDispatcher.new,
        ),
        JavaScriptModuleGenerator(
          Dimensions.kModuleName,
          Dimensions.new,
        ),
      ];

  @override
  List<ModuleGenerator> get nativeModuleGeneratorList => [
        ModuleGenerator(
          TimeModule.kTimerModuleName,
          TimeModule.new,
        ),
        ModuleGenerator(
          ConsoleModule.kConsoleModuleName,
          ConsoleModule.new,
        ),
        ModuleGenerator(
          ExceptionModule.kExceptionModuleName,
          ExceptionModule.new,
        ),
        ModuleGenerator(
          DeviceEventModule.kDeviceModuleName,
          DeviceEventModule.new,
        ),
        ModuleGenerator(
          NetworkModule.kNetworkModuleName,
          NetworkModule.new,
        ),
        ModuleGenerator(
          NetInfoModule.kNetInfoModuleName,
          NetInfoModule.new,
        ),
        ModuleGenerator(
          StorageModule.kStorageModuleName,
          StorageModule.new,
        ),
        ModuleGenerator(
          UtilsModule.kUtilsModuleName,
          UtilsModule.new,
        ),
        ModuleGenerator(
          WebsocketModule.kWebSocketModuleName,
          WebsocketModule.new,
        ),
        ModuleGenerator(
          ClipboardModule.kClipboardModuleName,
          ClipboardModule.new,
        ),
        ModuleGenerator(
          ImageLoaderModule.kImageLoaderModuleName,
          ImageLoaderModule.new,
        )
      ];
}
