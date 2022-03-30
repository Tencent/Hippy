//
// Tencent is pleased to support the open source community by making
// Hippy available.
//
// Copyright (C) 2019 THL A29 Limited, a Tencent company.
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

import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:voltron_renderer/voltron_renderer.dart';

import '../engine.dart';
import 'module.dart';
import 'promise.dart';

class DialogModule extends VoltronNativeModule {
  static const String kDialogModuleName = "DialogModule";
  static const String kFuncToast = "toast";
  static const String kFuncAlert = "alert";
  static const String kFuncConfirm = "confirm";
  static const String kFuncPrompt = "prompt";
  EngineContext? _context;

  DialogModule(EngineContext context) : super(context) {
    _context = context;
  }

  ToastGravity _getToastGravity(gravity) {
    ToastGravity toastGravity;
    switch (gravity) {
      case 'top':
        toastGravity = ToastGravity.TOP;
        break;
      case 'center':
        toastGravity = ToastGravity.CENTER;
        break;
      case 'bottom':
        toastGravity = ToastGravity.BOTTOM;
        break;
      default:
        toastGravity = ToastGravity.BOTTOM;
        break;
    }
    return toastGravity;
  }

  Future<bool> _showDialog({
    required BuildContext context,
    required Widget content,
    Widget? title,
    String? textCancel,
    String? textOK,
  }) async {
    var actions = <Widget>[];
    if (textCancel != null) {
      actions.add(TextButton(
        child: Text(textCancel),
        onPressed: () => Navigator.pop(context, false),
      ));
    }
    if (textOK != null) {
      actions.add(TextButton(
        child: Text(textOK),
        onPressed: () => Navigator.pop(context, true),
      ));
    }
    var ret = await showDialog<bool>(
      context: context,
      builder: (_) => WillPopScope(
        child: AlertDialog(
          title: title,
          content: SingleChildScrollView(
            child: content,
          ),
          actions: actions,
        ),
        onWillPop: () async {
          Navigator.pop(context, false);
          return true;
        },
      ),
    );
    return ret ?? false;
  }

  @VoltronMethod(kFuncToast)
  bool toast(VoltronMap message, JSPromise promise) {
    var gravity = message.get('gravity') ?? 'bottom';
    var text = message.get('message') ?? '';
    Fluttertoast.showToast(
        msg: text,
        toastLength: Toast.LENGTH_SHORT,
        gravity: _getToastGravity(gravity),
        timeInSecForIosWeb: 1);
    return true;
  }

  @VoltronMethod(kFuncAlert)
  Future<bool> alert(int rootId, VoltronMap message, JSPromise promise) async {
    var text = message.get('message') ?? '';
    var textOK = message.get('textOK') ?? '确定';
    var buildContext = _context?.getInstance(rootId)?.rootKey.currentContext;
    var ret = false;
    if (buildContext != null) {
      ret = await _showDialog(
        context: buildContext,
        content: Text(text),
        textOK: textOK,
      );
    }
    promise.resolve(ret);
    return true;
  }

  @VoltronMethod(kFuncConfirm)
  Future<bool> confirm(
      int rootId, VoltronMap message, JSPromise promise) async {
    var text = message.get('message') ?? '';
    var textOK = message.get('textOK') ?? '确定';
    var textCancel = message.get('textOK') ?? '取消';
    var buildContext = _context?.getInstance(rootId)?.rootKey.currentContext;
    var ret = false;
    if (buildContext != null) {
      ret = await _showDialog(
        context: buildContext,
        content: Text(text),
        textCancel: textCancel,
        textOK: textOK,
      );
    }
    promise.resolve(ret);
    return true;
  }

  @VoltronMethod(kFuncPrompt)
  Future<bool> prompt(int rootId, VoltronMap message, JSPromise promise) async {
    var text = message.get('title') ?? '';
    var textOK = message.get('textOK') ?? '确定';
    var textCancel = message.get('textOK') ?? '取消';
    var buildContext = _context?.getInstance(rootId)?.rootKey.currentContext;
    String? value;
    if (buildContext != null) {
      String? inputText;
      var ret = await _showDialog(
        context: buildContext,
        title: Text(text),
        content: TextFormField(
          autofocus: false,
          obscureText: false,
          onChanged: (text) => inputText = text,
          textCapitalization: TextCapitalization.none,
        ),
        textCancel: textCancel,
        textOK: textOK,
      );
      if (ret == true) {
        value = inputText;
      }
    }
    promise.resolve(value);
    return true;
  }

  @override
  Map<String, Function> get extraFuncMap => {
        kFuncToast: toast,
        kFuncAlert: alert,
        kFuncConfirm: confirm,
        kFuncPrompt: prompt
      };

  @override
  String get moduleName => kDialogModuleName;
}
