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
import 'package:keyboard_utils/keyboard_listener.dart' as keyboard_listener;
import 'package:keyboard_utils/keyboard_utils.dart';
import 'package:voltron_renderer/render.dart';

import '../controller.dart';
import '../style.dart';
import '../util.dart';
import 'view_model.dart';

class TextInputRenderViewModel extends RenderViewModel {
  static const String kTag = 'TextInputRenderViewModel';
  static const String kKeyboardTypeEmailAddress = "email";
  static const String kKeyboardTypeNumeric = "numeric";
  static const String kKeyboardTypePhonePad = "phone-pad";
  static const String kKeyboardTypePassword = "password";

  // 默认值
  String hint = "";

  // 是否可编辑
  bool editable = true;

  // 输入键盘相关
  int cursorColor = Colors.transparent.value; // 输入光标颜色
  TextInputAction textInputAction = TextInputAction.done;
  TextInputType textInputType = TextInputType.text;

  // 间距相关
  double paddingTop = 0.0;
  double paddingRight = 0.0;
  double paddingBottom = 0.0;
  double paddingLeft = 0.0;

  // 字体相关
  FontStyle fontStyle = FontStyle.normal;
  double fontSize = NodeProps.kDefaultFontSizeSp; // 字体大小
  FontWeight fontWeight = FontWeight.normal;
  double lineHeight = 0.0;
  String fontFamily = "normal";
  double letterSpacing = -1;
  int hintTextColor = 0xFF888888;
  int underLineColor = Colors.transparent.value;
  int textColor = Colors.transparent.value;
  TextAlign textAlign = TextAlign.start;
  TextAlignVertical? textAlignVertical = TextAlignVertical.top;
  int maxLength = 0;

  int numberOfLine = kMaxLineCount;

  late TextInputDispatcher dispatcher;

  bool obscureText = false;

  int _selStart = 0;
  int _selEnd = 0;
  String _text = "";
  FocusNodeProxy node = FocusNodeProxy();
  TextEditingControllerProxy controller = TextEditingControllerProxy();

  String returnKeyTypeStr = "";
  String keyboardTypeStr = "";
  TextAlignVertical? oldAlign = TextAlignVertical.top;

  EdgeInsets contentPadding = const EdgeInsets.all(0);

  final KeyboardUtils _keyboardUtils = KeyboardUtils();
  int? _keyboardUtilsListenerId;

  @override
  void onInit() {
    node.init();
    controller.init();

    node.addListener(() {
      dispatcher.onFocusChange(node.hasFocus);
    });

    _keyboardUtilsListenerId = _keyboardUtils.add(
      listener: keyboard_listener.KeyboardListener(willShowKeyboard: (height) {
        dispatcher.onKeyboardWillShow(height.toInt());
      }, willHideKeyboard: () {
        dispatcher.onKeyboardWillHide();
      }),
    );
  }

  void setTextInputType(String returnKeyType) {
    returnKeyTypeStr = returnKeyType;
    var returnKeyFlag = TextInputAction.done;
    switch (returnKeyType) {
      case "go":
        returnKeyFlag = TextInputAction.go;
        break;
      case "next":
        returnKeyFlag = TextInputAction.next;
        // numberOfLine = 1;
        break;
      case "none":
        returnKeyFlag = TextInputAction.none;
        break;
      case "previous":
        returnKeyFlag = TextInputAction.previous;
        // numberOfLine = 1;
        break;
      case "search":
        returnKeyFlag = TextInputAction.search;
        // numberOfLine = 1;
        break;
      case "send":
        returnKeyFlag = TextInputAction.send;
        // numberOfLine = 1;
        break;
      case "done":
        returnKeyFlag = TextInputAction.done;
        // numberOfLine = 1;
        break;
    }
    textInputAction = returnKeyFlag;
  }

  void setKeyboardType(String keyboardType) {
    keyboardTypeStr = keyboardType;
    obscureText = false;
    var flagsToSet = TextInputType.text;
    if (kKeyboardTypeNumeric.toLowerCase() == keyboardType.toLowerCase()) {
      flagsToSet = TextInputType.number;
    } else if (kKeyboardTypeEmailAddress.toLowerCase() == keyboardType.toLowerCase()) {
      flagsToSet = TextInputType.emailAddress;
    } else if (kKeyboardTypePhonePad.toLowerCase() == keyboardType.toLowerCase()) {
      flagsToSet = TextInputType.phone;
    } else if (kKeyboardTypePassword.toLowerCase() == keyboardType.toLowerCase()) {
      flagsToSet = TextInputType.visiblePassword;
      obscureText = true;
    }
    textInputType = flagsToSet;
  }

  void setMultiLine(bool multiline) {
    if (multiline) {
      oldAlign = textAlignVertical;
      textInputType = TextInputType.multiline;
      textInputAction = TextInputAction.newline;
      textAlignVertical = TextAlignVertical.top;
    } else {
      textAlignVertical = oldAlign;
      setTextInputType(returnKeyTypeStr);
      setKeyboardType(keyboardTypeStr);
      numberOfLine = 1;
    }
  }

  void setTextAlign(String textAlignStr) {
    var align = TextAlign.start;
    if ("auto" == (textAlignStr)) {
      align = TextAlign.start;
    } else if ("left" == (textAlignStr)) {
      align = TextAlign.left;
    } else if ("right" == (textAlignStr)) {
      align = TextAlign.right;
    } else if ("center" == (textAlignStr)) {
      align = TextAlign.center;
    } else if ("justify" == (textAlignStr)) {
      align = TextAlign.justify;
    } else {
      LogUtils.e(kTag, "Invalid textAlign: $textAlign");
    }
    textAlign = align;
  }

  int _parseArgument(String weight) {
    return weight.length == 3 &&
            weight.endsWith("00") &&
            weight.codeUnitAt(0) <= '9'.codeUnitAt(0) &&
            weight.codeUnitAt(0) >= '1'.codeUnitAt(0)
        ? 100 * (weight.codeUnitAt(0) - '0'.codeUnitAt(0))
        : -1;
  }

  void setFontWeight(String fontWeightStr) {
    var tempFontWeight = FontWeight.normal;
    if ("bold" == fontWeightStr) {
      tempFontWeight = FontWeight.bold;
    } else if ("normal" == fontWeightStr) {
      tempFontWeight = FontWeight.normal;
    } else {
      var fontWeightNumeric = _parseArgument(fontWeightStr);
      if (fontWeightNumeric != -1) {
        if (fontWeightNumeric <= 100) {
          tempFontWeight = FontWeight.w100;
        } else if (fontWeightNumeric <= 200) {
          tempFontWeight = FontWeight.w200;
        } else if (fontWeightNumeric <= 300) {
          tempFontWeight = FontWeight.w300;
        } else if (fontWeightNumeric <= 400) {
          tempFontWeight = FontWeight.w400;
        } else if (fontWeightNumeric <= 500) {
          tempFontWeight = FontWeight.w500;
        } else if (fontWeightNumeric <= 600) {
          tempFontWeight = FontWeight.w600;
        } else if (fontWeightNumeric <= 700) {
          tempFontWeight = FontWeight.w700;
        } else if (fontWeightNumeric <= 800) {
          tempFontWeight = FontWeight.w800;
        } else {
          tempFontWeight = FontWeight.w900;
        }
      }
    }
    fontWeight = tempFontWeight;
  }

  FontStyle parseFontStyle(String fontStyleStr) {
    var fontStyle = FontStyle.normal;
    if ("italic" == fontStyleStr) {
      fontStyle = FontStyle.italic;
    } else if ("normal" == fontStyleStr) {
      fontStyle = FontStyle.normal;
    }

    return fontStyle;
  }

  void setFontStyle(String fontStyleStr) {
    fontStyle = parseFontStyle(fontStyleStr);
  }

  void setValue(String value) {
    LogUtils.d("text_input", "set value:$value");
    var selectionStart = controller.selection.start;
    var selectionEnd = controller.selection.end;

    LogUtils.d("text_input", "setText: selectionStart:$selectionStart selectionEnd:$selectionEnd");
    var oldValue = controller.text;

    if (value == oldValue) {
      // 不需要重复设置
      return;
    }

    var sub1 = oldValue.substring(0, selectionStart);
    var sub2 = oldValue.substring(selectionEnd);

    LogUtils.d("text_input", "setText: sub1:[$sub1]  sub2:[$sub2]");

    if (selectionStart == selectionEnd &&
        value.length > oldValue.length &&
        value.startsWith(sub1) &&
        value.endsWith(sub2)) {
      // 未选中状态 && insert
      var insertStr = value.substring(selectionStart, value.length - sub2.length);
      LogUtils.d("text_input", "setText: InsertStr: [$insertStr]");
      var offset = selectionStart + insertStr.length;
      if (offset > value.length || offset < 0) {
        offset = value.length;
      }
      controller.value = TextEditingValue(
          text: value,
          selection: TextSelection.fromPosition(
              TextPosition(offset: offset, affinity: TextAffinity.downstream)));
    } else if (selectionStart < selectionEnd && value.startsWith(sub1) && value.endsWith(sub2)) {
      // 选中状态 && replace选中部分
      var replaceStr = value.substring(selectionStart, value.length - sub2.length);
      LogUtils.d("text_input", "setText: ReplaceStr: [$replaceStr]");
      var offsetStart = selectionStart;
      var offsetEnd = selectionStart + replaceStr.length;
      if (offsetEnd < 0 || offsetEnd > value.length) {
        offsetEnd = value.length;
      }
      controller.value = TextEditingValue(
          text: value, selection: TextSelection(baseOffset: offsetStart, extentOffset: offsetEnd));
    } else if (selectionStart == selectionEnd &&
        value.length < oldValue.length &&
        value.endsWith(sub2) &&
        value.startsWith(sub1.substring(0, selectionStart - (oldValue.length - value.length)))) {
      // 未选中状态 && delete
      var delLen = oldValue.length - value.length;
      var offset = selectionEnd - delLen;
      if (offset < 0) {
        offset = 0;
      }
      if (offset > value.length) {
        offset = value.length;
      }
      controller.value = TextEditingValue(
          text: value,
          selection: TextSelection.fromPosition(
              TextPosition(offset: offset, affinity: TextAffinity.downstream)));
    } else {
      controller.value = TextEditingValue(
          text: value,
          selection: TextSelection.fromPosition(
              TextPosition(offset: value.length, affinity: TextAffinity.downstream)));
    }
  }

  void focus() {
    LogUtils.i("text_input", "focus text input");
    node.focus();
  }

  void dismiss() {
    var _currentContext = currentContext;
    if (_currentContext != null) {
      // 将焦点交回给上一层，隐藏软键盘
      LogUtils.i("text_input", "dismiss text input");
      FocusScope.of(_currentContext).requestFocus();
    }
  }

  void blur() {
    node.unfocus();
    var _currentContext = currentContext;
    if (_currentContext != null) {
      LogUtils.i("text_input", "blur text input");
      // 将焦点交回给上一层，隐藏软键盘
      FocusScope.of(_currentContext).requestFocus();
    }
  }

  TextInputRenderViewModel(
    int id,
    int instanceId,
    String className,
    RenderContext context,
  ) : super(id, instanceId, className, context) {
    dispatcher = TextInputDispatcher(context, id, controller);

    controller.addListener(() {
      var curSelStart = controller.selection.start;
      var curSelEnd = controller.selection.end;

      // 处理光标变化
      if (_selStart != curSelStart || _selEnd != curSelEnd) {
        _selStart = curSelStart;
        _selEnd = curSelEnd;
        dispatcher.onSelectionChanged(_selStart, _selEnd);
      }

      // 处理input内容变化
      var curText = controller.text;
      var v = controller.controller?.value;
      // 这里要考虑iOS原生中文输入法中存在候选词的情况，候选词变更不触发前端change事件
      if (v != null && !v.isComposingRangeValid) {
        if (_text != curText) {
          _text = curText;
          dispatcher.onChangeText(_text);
        }
      }
    });
  }

  @override
  void onViewModelDestroy() {
    super.onViewModelDestroy();
    node.unfocus();
    dismiss();
  }

  @override
  void onDispose() {
    super.onDispose();
    controller.dispose();
    node.dispose();
    _keyboardUtils.unsubscribeListener(subscribingId: _keyboardUtilsListenerId);
    if (_keyboardUtils.canCallDispose()) {
      _keyboardUtils.dispose();
    }
  }
}
