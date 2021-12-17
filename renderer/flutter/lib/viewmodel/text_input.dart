import 'package:flutter/material.dart';

import '../controller.dart';
import '../engine.dart';
import '../style.dart';
import '../util.dart';
import 'view_model.dart';

class TextInputRenderViewModel extends RenderViewModel {
  static const String keyboardTypeEmailAddress = "email";
  static const String keyboardTypeNumeric = "numeric";
  static const String keyboardTypePhonePad = "phone-pad";
  static const String keyboardTypePassword = "password";


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
  double fontSize = NodeProps.fontSizeSp; // 字体大小
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

  EdgeInsets contentPadding = EdgeInsets.all(0);

  void onInit() {
    node.init();
    controller.init();

    node.addListener(() {
      dispatcher.onFocusChange(node.hasFocus);
    });
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
    if (keyboardTypeNumeric.toLowerCase() == keyboardType.toLowerCase()) {
      flagsToSet = TextInputType.number;
    } else if (keyboardTypeEmailAddress.toLowerCase() ==
        keyboardType.toLowerCase()) {
      flagsToSet = TextInputType.emailAddress;
    } else if (keyboardTypePhonePad.toLowerCase() ==
        keyboardType.toLowerCase()) {
      flagsToSet = TextInputType.phone;
    } else if (keyboardTypePassword.toLowerCase() ==
        keyboardType.toLowerCase()) {
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
    textAlign = TextStyleNode.parseTextAlign(textAlignStr);
  }

  void setFontWeight(String fontWeightStr) {
    fontWeight = TextStyleNode.parseFontWeight(fontWeightStr);
  }

  void setFontStyle(String fontStyleStr) {
    fontStyle = TextStyleNode.parseFontStyle(fontStyleStr);
  }

  void setValue(String value) {
    LogUtils.d("text_input", "set value:$value");
    var selectionStart = controller.selection.start;
    var selectionEnd = controller.selection.end;

    LogUtils.d("text_input",
        "setText: selectionStart:$selectionStart selectionEnd:$selectionEnd");
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
      var insertStr =
          value.substring(selectionStart, value.length - sub2.length);
      LogUtils.d("text_input", "setText: InsertStr: [$insertStr]");
      var offset = selectionStart + insertStr.length;
      if (offset > value.length || offset < 0) {
        offset = value.length;
      }
      controller.value = TextEditingValue(
          text: value,
          selection: TextSelection.fromPosition(
              TextPosition(offset: offset, affinity: TextAffinity.downstream)));
    } else if (selectionStart < selectionEnd &&
        value.startsWith(sub1) &&
        value.endsWith(sub2)) {
      // 选中状态 && replace选中部分
      var replaceStr =
          value.substring(selectionStart, value.length - sub2.length);
      LogUtils.d("text_input", "setText: ReplaceStr: [$replaceStr]");
      var offsetStart = selectionStart;
      var offsetEnd = selectionStart + replaceStr.length;
      if (offsetEnd < 0 || offsetEnd > value.length) {
        offsetEnd = value.length;
      }
      controller.value = TextEditingValue(
          text: value,
          selection:
              TextSelection(baseOffset: offsetStart, extentOffset: offsetEnd));
    } else if (selectionStart == selectionEnd &&
        value.length < oldValue.length &&
        value.endsWith(sub2) &&
        value.startsWith(sub1.substring(
            0, selectionStart - (oldValue.length - value.length)))) {
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
          selection: TextSelection.fromPosition(TextPosition(
              offset: value.length, affinity: TextAffinity.downstream)));
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
      int id, int instanceId, String className, EngineContext context)
      : super(id, instanceId, className, context) {
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
  }
}
