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

import 'package:flutter/services.dart';

import 'package:voltron_renderer/voltron_renderer.dart';

import '../engine.dart';
import 'module.dart';
import 'promise.dart';

class ClipboardModule extends VoltronNativeModule {
  static const String kClipboardModuleName = "ClipboardModule";
  static const String kTag = 'ClipboardModule';

  static const String kGetStringMethodName = "getString";
  static const String kSetStringMethodName = "setString";

  ClipboardModule(EngineContext context) : super(context);

  @VoltronMethod(kGetStringMethodName)
  bool getString(JSPromise promise) {
    Clipboard.getData('text/plain').then((data) {
      promise.resolve(data?.text ?? '');
    }).catchError((err) {
      LogUtils.d(kTag, err.toString());
      promise.reject(err.toString());
    });
    return true;
  }

  @VoltronMethod(kSetStringMethodName)
  bool setString(String text, JSPromise promise) {
    Clipboard.setData(ClipboardData(text: text)).then((data) {
      promise.resolve(text);
    }).catchError((err) {
      LogUtils.d(kTag, err.toString());
      promise.reject(err.toString());
    });
    return true;
  }

  @override
  Map<String, Function> get extraFuncMap =>
      {kGetStringMethodName: getString, kSetStringMethodName: setString};

  @override
  String get moduleName => kClipboardModuleName;
}
