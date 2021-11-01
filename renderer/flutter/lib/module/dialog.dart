import 'dart:collection';
import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';

import '../common/voltron_map.dart';

import '../engine/engine_context.dart';
import 'module.dart';
import 'promise.dart';

class DialogModule extends VoltronNativeModule {
  static const String dialogModuleName = "DialogModule";
  static const String funcToast = "toast";
  static const String funcAlert = "alert";
  static const String funcConfirm = "confirm";
  static const String funcPrompt = "prompt";
  EngineContext? _context;

  DialogModule(EngineContext context) : super(context) {
    _context = context;
  }

  ToastGravity _getToastGravity(gravity) {
    var toastGravity;
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
    return ret == null ? false : ret;
  }

  @VoltronMethod(funcToast)
  bool toast(VoltronMap message, Promise promise) {
    var gravity = message.get('gravity') ?? 'bottom';
    var text = message.get('message') ?? '';
    Fluttertoast.showToast(
        msg: text,
        toastLength: Toast.LENGTH_SHORT,
        gravity: _getToastGravity(gravity),
        timeInSecForIosWeb: 1);
    return true;
  }

  @VoltronMethod(funcAlert)
  Future<bool> alert(int rootId, VoltronMap message, Promise promise) async {
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

  @VoltronMethod(funcConfirm)
  Future<bool> confirm(int rootId, VoltronMap message, Promise promise) async {
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

  @VoltronMethod(funcPrompt)
  Future<bool> prompt(int rootId, VoltronMap message, Promise promise) async {
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
        funcToast: toast,
        funcAlert: alert,
        funcConfirm: confirm,
        funcPrompt: prompt
      };

  @override
  String get moduleName => dialogModuleName;
}
