import 'package:flutter/material.dart';

import '../common.dart';
import '../controller.dart';
import '../engine.dart';
import '../module.dart';
import '../render.dart';
import '../style.dart';
import '../util.dart';
import '../viewmodel.dart';
import '../widget.dart';

class TextInputController extends BaseViewController<TextInputRenderViewModel> {
  static const String className = "TextInput";
  static const String tag = "TextInputController";

  static const String defaultValue = "defaultValue";
  static const String validator = "validator";
  static const String editable = "editable";
  static const String caretColorReact = "caret-color";
  static const String caretColorVue = "caretColor";
  static const String multiline = "multiline";
  static const String returnKeyType = "returnKeyType";
  static const String keyboardType = "keyboardType";
  static const String maxLengthProp = "maxLength";
  static const String onSelectionChange = "onSelectionChange";
  static const String valueProp = "value";
  static const String placeholder = "placeholder";
  static const String placeholderTextColorReact = "placeholder-text-color";
  static const String placeholderTextColorVue = "placeholderTextColor";
  static const String numberOfLines = "numberOfLines";
  static const String underlineColor = "underlineColorAndroid";
  static const String lineHeight = "lineHeight";
  static const String onChangeText = "onChangeText";
  static const String onEndEditing = "onEndEditing";
  static const String onFocus = "onFocus";
  static const String onBlur = "onBlur";
  static const String onContentSizeChange = "onContentSizeChange";

  static const String clearFunction = "clear";
  static const String commandFocus = "focusTextInput";
  static const String commandBlur = "blurTextInput";
  static const String commandGetValue = "getValue";
  static const String commandSetValue = "setValue";
  // 注意这里由于js侧使用了错误拼写，这里暂时不能修改成正确的拼写，否则会导致无法成功调用
  static const String commandKeyboardDismiss = "dissmiss";

  @override
  TextInputRenderViewModel createRenderViewModel(
      RenderNode node, EngineContext context) {
    return TextInputRenderViewModel(node.id, node.rootId, name, context);
  }

  @override
  Widget createWidget(
      BuildContext context, TextInputRenderViewModel renderViewModel) {
    return TextInputWidget(renderViewModel);
  }

  @override
  Map<String, ControllerMethodProp> get extendRegisteredMethodProp => {
        NodeProps.fontSize:
            ControllerMethodProp(setFontSize, NodeProps.fontSizeSp),
        defaultValue: ControllerMethodProp(setDefaultValue, ""),
        validator: ControllerMethodProp(setValidator, ""),
        editable: ControllerMethodProp(setEditable, true),
        caretColorReact:
            ControllerMethodProp(setCaretColor, Colors.transparent.value),
        caretColorVue:
            ControllerMethodProp(setCaretColorAlias, Colors.transparent.value),
        multiline: ControllerMethodProp(multiLine, true),
        returnKeyType: ControllerMethodProp(setReturnKeyType, ""),
        keyboardType: ControllerMethodProp(setKeyboardType, ""),
        NodeProps.fontStyle: ControllerMethodProp(setFontStyle, "normal"),
        NodeProps.fontFamily: ControllerMethodProp(setFontFamily, "normal"),
        NodeProps.fontWeight: ControllerMethodProp(setFontWeight, "normal"),
        NodeProps.lineHeight: ControllerMethodProp(setLineHeight, 0.0),
        maxLengthProp: ControllerMethodProp(maxLength, -1),
        onSelectionChange: ControllerMethodProp(setOnSelectionChange, false),
        NodeProps.letterSpacing: ControllerMethodProp(letterSpacing, -1),
        valueProp: ControllerMethodProp(value, ""),
        placeholder: ControllerMethodProp(placeHolder, ""),
        placeholderTextColorVue:
            ControllerMethodProp(setTextHitColorVue, 0xFF888888),
        placeholderTextColorReact:
            ControllerMethodProp(setTextHitColorReact, 0xFF888888),
        numberOfLines: ControllerMethodProp(setMaxLines, kMaxLineCount),
        underlineColor:
            ControllerMethodProp(setUnderlineColor, Colors.transparent.value),
        onChangeText: ControllerMethodProp(setOnChangeText, false),
        onEndEditing: ControllerMethodProp(setEndEditing, false),
        onFocus: ControllerMethodProp(setOnFocus, false),
        onBlur: ControllerMethodProp(setBlur, false),
        onContentSizeChange:
            ControllerMethodProp(setOnContentSizeChange, false),
        NodeProps.color:
            ControllerMethodProp(setColor, Colors.transparent.value),
        NodeProps.textAlign: ControllerMethodProp(setTextAlign, "auto"),
        NodeProps.textAlignVertical:
            ControllerMethodProp(setTextAlignVertical, "auto"),
        NodeProps.paddingTop: ControllerMethodProp(setPaddingTop, 0.0),
        NodeProps.paddingRight: ControllerMethodProp(setPaddingRight, 0.0),
        NodeProps.paddingBottom: ControllerMethodProp(setPaddingBottom, 0.0),
        NodeProps.paddingLeft: ControllerMethodProp(setPaddingLeft, 0.0),
      };

  @override
  String get name => className;

  @ControllerProps(NodeProps.fontSize)
  void setFontSize(TextInputRenderViewModel renderViewModel, double fontSize) {
    renderViewModel.fontSize = fontSize;
  }

  @ControllerProps(defaultValue)
  void setDefaultValue(
      TextInputRenderViewModel renderViewModel, String defaultValue) {
    renderViewModel.setValue(defaultValue);
  }

  @ControllerProps(validator)
  void setValidator(
      TextInputRenderViewModel renderViewModel, String strValidator) {
    renderViewModel.dispatcher.validator = strValidator;
  }

  @ControllerProps(editable)
  void setEditable(TextInputRenderViewModel renderViewModel, bool editable) {
    renderViewModel.editable = editable;
  }

  // 设置输入光标颜色  RN 语法 caret-color
  @ControllerProps(caretColorReact)
  void setCaretColor(
      TextInputRenderViewModel renderViewModel, int cursorColor) {
    renderViewModel.cursorColor = cursorColor;
  }

  //  设置输入光标颜色
  //For Vue.vue的前端语法，会把caret-color转化成caretColor
  @ControllerProps(caretColorVue)
  void setCaretColorAlias(
      TextInputRenderViewModel renderViewModel, int cursorColor) {
    renderViewModel.cursorColor = cursorColor;
  }

  @ControllerProps(multiline)
  void multiLine(TextInputRenderViewModel renderViewModel, bool multiline) {
    renderViewModel.setMultiLine(multiline);
  }

  @ControllerProps(returnKeyType)
  void setReturnKeyType(
      TextInputRenderViewModel renderViewModel, String returnKeyType) {
    renderViewModel.setTextInputType(returnKeyType);
  }

  @ControllerProps(keyboardType)
  void setKeyboardType(
      TextInputRenderViewModel renderViewModel, String keyboardType) {
    renderViewModel.setKeyboardType(keyboardType);
  }

  @ControllerProps(NodeProps.fontStyle)
  void setFontStyle(
      TextInputRenderViewModel renderViewModel, String fontStyleString) {
    renderViewModel.setFontStyle(fontStyleString);
  }

  @ControllerProps(NodeProps.fontWeight)
  void setFontWeight(
      TextInputRenderViewModel renderViewModel, String fontWeightString) {
    renderViewModel.setFontWeight(fontWeightString);
  }

  @ControllerProps(NodeProps.lineHeight)
  void setLineHeight(
      TextInputRenderViewModel renderViewModel, double lineHeight) {
    renderViewModel.lineHeight = lineHeight;
  }

  @ControllerProps(NodeProps.fontFamily)
  void setFontFamily(
      TextInputRenderViewModel renderViewModel, String fontFamily) {
    renderViewModel.fontFamily = fontFamily;
  }

  @ControllerProps(maxLengthProp)
  void maxLength(TextInputRenderViewModel renderViewModel, int maxLength) {
    renderViewModel.maxLength = maxLength;
  }

  @ControllerProps(onSelectionChange)
  void setOnSelectionChange(
      TextInputRenderViewModel renderViewModel, bool change) {
    renderViewModel.dispatcher.listenSelectionChange = change;
  }

  @ControllerProps(NodeProps.letterSpacing)
  void letterSpacing(
      TextInputRenderViewModel renderViewModel, double letterSpacing) {
    renderViewModel.letterSpacing = letterSpacing;
  }

  @ControllerProps(valueProp)
  void value(TextInputRenderViewModel renderViewModel, String value) {
    renderViewModel.setValue(value);
  }

  @ControllerProps(placeholder)
  void placeHolder(
      TextInputRenderViewModel renderViewModel, String placeholder) {
    renderViewModel.hint = placeholder;
  }

  @ControllerProps(placeholderTextColorVue)
  void setTextHitColorVue(TextInputRenderViewModel renderViewModel, int color) {
    renderViewModel.hintTextColor = color;
  }

  @ControllerProps(placeholderTextColorReact)
  void setTextHitColorReact(
      TextInputRenderViewModel renderViewModel, int color) {
    renderViewModel.hintTextColor = color;
  }

  @ControllerProps(numberOfLines)
  void setMaxLines(TextInputRenderViewModel renderViewModel, int numberOfLine) {
    renderViewModel.numberOfLine = numberOfLine;
  }

  @ControllerProps(underlineColor)
  void setUnderlineColor(
      TextInputRenderViewModel renderViewModel, int underlineColor) {
    renderViewModel.underLineColor = underlineColor;
  }

  @ControllerProps(onChangeText)
  void setOnChangeText(TextInputRenderViewModel renderViewModel, bool change) {
    renderViewModel.dispatcher.listenChangeText = change;
  }

  @ControllerProps(onEndEditing)
  void setEndEditing(TextInputRenderViewModel renderViewModel, bool change) {
    renderViewModel.dispatcher.listenEndEditing = change;
  }

  @ControllerProps(onFocus)
  void setOnFocus(TextInputRenderViewModel renderViewModel, bool change) {
    renderViewModel.dispatcher.listenFocus = change;
  }

  @ControllerProps(onBlur)
  void setBlur(TextInputRenderViewModel renderViewModel, bool change) {
    renderViewModel.dispatcher.listenFocus = change;
  }

  @ControllerProps(onContentSizeChange)
  void setOnContentSizeChange(
      TextInputRenderViewModel renderViewModel, bool contentSizeChange) {
    renderViewModel.dispatcher.listenContentSizeChange = contentSizeChange;
  }

  @ControllerProps(NodeProps.color)
  void setColor(TextInputRenderViewModel renderViewModel, int change) {
    renderViewModel.textColor = change;
  }

  @ControllerProps(NodeProps.textAlign)
  void setTextAlign(
      TextInputRenderViewModel renderViewModel, String textAlign) {
    renderViewModel.setTextAlign(textAlign);
  }

  @ControllerProps(NodeProps.textAlignVertical)
  void setTextAlignVertical(
      TextInputRenderViewModel renderViewModel, String? textAlignVertical) {
    if (textAlignVertical == null || "auto" == textAlignVertical) {
      renderViewModel.textAlignVertical = null;
    } else if ("top" == textAlignVertical) {
      renderViewModel.textAlignVertical = TextAlignVertical.top;
    } else if ("bottom" == textAlignVertical) {
      renderViewModel.textAlignVertical = TextAlignVertical.bottom;
    } else if ("center" == textAlignVertical) {
      renderViewModel.textAlignVertical = TextAlignVertical.center;
    }
  }

  @ControllerProps(NodeProps.paddingTop)
  void setPaddingTop(
      TextInputRenderViewModel renderViewModel, Object? paddingTop) {
    if (paddingTop is int) {
      renderViewModel.paddingTop = paddingTop.toDouble();
    } else if (paddingTop is double) {
      renderViewModel.paddingTop = paddingTop;
    } else {
      renderViewModel.paddingTop = 0.0;
    }
  }

  @ControllerProps(NodeProps.paddingRight)
  void setPaddingRight(
      TextInputRenderViewModel renderViewModel, Object? paddingRight) {
    if (paddingRight is int) {
      renderViewModel.paddingRight = paddingRight.toDouble();
    } else if (paddingRight is double) {
      renderViewModel.paddingRight = paddingRight;
    } else {
      renderViewModel.paddingRight = 0.0;
    }
  }

  @ControllerProps(NodeProps.paddingBottom)
  void setPaddingBottom(
      TextInputRenderViewModel renderViewModel, Object? paddingBottom) {
    if (paddingBottom is int) {
      renderViewModel.paddingBottom = paddingBottom.toDouble();
    } else if (paddingBottom is double) {
      renderViewModel.paddingBottom = paddingBottom;
    } else {
      renderViewModel.paddingBottom = 0.0;
    }
  }

  @ControllerProps(NodeProps.paddingLeft)
  void setPaddingLeft(
      TextInputRenderViewModel renderViewModel, Object? paddingLeft) {
    if (paddingLeft is int) {
      renderViewModel.paddingLeft = paddingLeft.toDouble();
    } else if (paddingLeft is double) {
      renderViewModel.paddingLeft = paddingLeft;
    } else {
      renderViewModel.paddingLeft = 0.0;
    }
  }

  @override
  void dispatchFunction(TextInputRenderViewModel renderViewModel,
      String functionName, VoltronArray array,
      {Promise? promise}) {
    switch (functionName) {
      case commandSetValue:
        var value = array.getString(0);
        if (value != null) {
          int pos = array.get(1);
          LogUtils.i("text_input", "js set value: $value, $pos");
          if (array.size() < 2) pos = array.getString(0)?.length ?? 0;
          renderViewModel.dispatcher.jsSetValue(array.getString(0), pos);
        }
        break;
      case clearFunction:
        renderViewModel.dispatcher.jsSetValue("", 0);
        break;
      case commandFocus:
        renderViewModel.focus();
        break;
      case commandKeyboardDismiss:
        renderViewModel.dismiss();
        break;
      case commandBlur:
        renderViewModel.blur();
        break;
      case commandGetValue:
        if (promise != null) {
          var resultMap = renderViewModel.dispatcher.jsGetValue();
          promise.resolve(resultMap);
        }
        break;
    }
  }
}

class FocusNodeProxy {
  FocusNode? node;
  bool _cacheIsFocus = false;
  VoidCallback? _focusChangeListener;

  FocusNode get realNode {
    return node ??= FocusNode();
  }

  void init() {
    node = FocusNode();
    _ensureListener();
    _ensureFocus();
  }

  void addListener(VoidCallback callback) {
    _focusChangeListener = callback;
    _ensureListener();
  }

  void _ensureListener() {
    var curListener = _focusChangeListener;
    if (curListener != null) {
      node?.addListener(curListener);
    }
  }

  void _ensureFocus() {
    if (_cacheIsFocus) {
      focus();
    }
  }

  void dispose() {
    node = null;
  }

  void unfocus() {
    _cacheIsFocus = false;
    node?.unfocus();
  }

  bool get hasFocus => node?.hasFocus ?? _cacheIsFocus;

  void focus() {
    _cacheIsFocus = true;
    node?.requestFocus();
  }
}

class TextEditingControllerProxy {
  TextEditingController? controller;
  TextEditingValue? _cacheTextEditingValue;
  VoidCallback? _textEditListener;

  void init() {
    controller = _newController;
    _ensureListener();
  }

  void addListener(VoidCallback? callback) {
    _textEditListener = callback;
    _ensureListener();
  }

  void _ensureListener() {
    var curListener = _textEditListener;
    if (curListener != null) {
      controller?.addListener(curListener);
    }
  }

  TextEditingController get _newController => _cacheTextEditingValue != null
      ? TextEditingController.fromValue(_cacheTextEditingValue)
      : TextEditingController.fromValue(TextEditingValue(
          text: "",
          selection: TextSelection.fromPosition(
              TextPosition(offset: 0, affinity: TextAffinity.downstream))));

  TextEditingController get realController {
    return controller ??= _newController;
  }

  set value(TextEditingValue value) {
    _cacheTextEditingValue = value;
    _ensureTextEditing();
  }

  TextEditingValue get value {
    return _cacheTextEditingValue ??= TextEditingValue(
        text: '',
        selection: TextSelection.fromPosition(
            TextPosition(offset: 0, affinity: TextAffinity.downstream)));
  }

  TextSelection get selection =>
      controller?.selection ??
      (_cacheTextEditingValue?.selection ??
          TextSelection.fromPosition(
              TextPosition(offset: 0, affinity: TextAffinity.downstream)));

  String get text {
    var v = controller?.value;
    // 这里要考虑iOS原生中文输入法中存在候选词的情况，候选词不算做输入文本
    if (v != null) {
      if (v.isComposingRangeValid) {
        return '${v.composing.textBefore(v.text)}${v.composing.textAfter(v.text)}';
      } else {
        return v.text;
      }
    }
    return _cacheTextEditingValue?.text ?? '';
  }

  set text(String? text) {
    value = value.copyWith(
      text: text,
      selection: const TextSelection.collapsed(offset: -1),
      composing: TextRange.empty,
    );
  }

  void _ensureTextEditing() {
    var curVal = _cacheTextEditingValue;
    if (curVal != null) {
      controller?.value = curVal;
    }
    if (controller == null) {
      _textEditListener?.call();
    }
  }

  void dispose() {
    controller = null;
  }

  void destroy() {
    _cacheTextEditingValue = null;
  }
}

class TextInputDispatcher {
  TextEditingControllerProxy controller;

  // 过滤输入文本的正则表达式
  String validator = "";

  // 事件相关
  bool listenSelectionChange = false;
  bool listenChangeText = false;
  bool listenEndEditing = false;
  bool listenFocus = false;
  bool listenContentSizeChange = false;

  EngineContext context;
  int id;

  String _oldText = "";
  bool _hasTextInput = false;

  String _jsSetValue = "";
  String _regexValidRepeat = "";

  bool hasFocus = false;

  TextInputDispatcher(this.context, this.id, this.controller);

  void onSelectionChanged(int selStart, int selEnd) {
    if (listenSelectionChange) {
      var selection = VoltronMap();
      selection.push("start", selStart);
      selection.push("end", selEnd);
      var paramsMap = VoltronMap();
      paramsMap.push("selection", selection);
      context.moduleManager
          .getJavaScriptModule<EventDispatcher>(
              enumValueToString(JavaScriptModuleType.EventDispatcher))
          ?.receiveUIComponentEvent(id, "onSelectionChange", paramsMap);
    }
  }

  void onFocusChange(bool focus) {
    if (hasFocus != focus) {
      hasFocus = focus;
      if (listenFocus) {
        var paramsMap = VoltronMap();
        paramsMap.push("text", text);
        if (hasFocus) {
          context.moduleManager
              .getJavaScriptModule<EventDispatcher>(
                  enumValueToString(JavaScriptModuleType.EventDispatcher))
              ?.receiveUIComponentEvent(id, "onFocus", paramsMap);
        } else {
          context.moduleManager
              .getJavaScriptModule<EventDispatcher>(
                  enumValueToString(JavaScriptModuleType.EventDispatcher))
              ?.receiveUIComponentEvent(id, "onBlur", paramsMap);
        }
      }
    }
  }

  void onEndEdit() {
    if (listenEndEditing) {
      var paramsMap = VoltronMap();
      paramsMap.push("text", text);
      context.moduleManager
          .getJavaScriptModule<EventDispatcher>(
              enumValueToString(JavaScriptModuleType.EventDispatcher))
          ?.receiveUIComponentEvent(id, "onEndEditing", paramsMap);
    }
  }

  void onChangeText(String changeText) {
    var isJsSetValue = _isJsSetValue(changeText);
    if (validator.isEmpty) {
      //如果没有正则匹配
      //如果文本输入过,判断是否两次相同
      if (_hasTextInput && _oldText == changeText) {
        return;
      }
      _oldText = changeText;
      _jsSetValue = "";
      _hasTextInput = true;
      if (!isJsSetValue) {
        //如果是前端设置下来的值,不再需要回调给前端.
        var paramsMap = VoltronMap();
        paramsMap.push("text", changeText);
        context.moduleManager
            .getJavaScriptModule<EventDispatcher>(
                enumValueToString(JavaScriptModuleType.EventDispatcher))
            ?.receiveUIComponentEvent(id, "onChangeText", paramsMap);
        LogUtils.d(
            TextInputController.tag, "afterTextChanged 1 通知前端文本变化=$changeText");
      }
    } else {
      //如果设置了正则表达式
      try {
        //如果当前的内容不匹配正则表达式
        if (!RegExp(validator).hasMatch(changeText) && changeText != "") {
          LogUtils.d(TextInputController.tag,
              "afterTextChanged 不符合正则表达式,需要设置回去=$changeText");
          //丢弃当前的内容,回退到上一次的值.上一次的值检查过,肯定是符合正则表达式的.
          controller.value = TextEditingValue(
              text: _oldText,
              selection: TextSelection.collapsed(offset: _oldText.length));
          //上一步的setText,将触发新一轮的beforeTextChanged,onTextChanged,afterTextChanged
          //为了避免前端收到两次内容同样的通知.记录一下正则匹配设置回去的值.
          _regexValidRepeat = _oldText;
          _hasTextInput = true;
        } else {
          //如果文本输入过,判断是否两次相同
          if (_hasTextInput && changeText == _oldText) {
            return;
          }
          _hasTextInput = true;
          _oldText = changeText;
          _jsSetValue = "";
          if (!isJsSetValue //如果是前端设置的一定不通知
              &&
              (isEmpty(_regexValidRepeat) //如果没有,输入过无效的内容
                  ||
                  _oldText != _regexValidRepeat)) {
            //如果本次输入的内容是上一次重复的蓉蓉
            var paramsMap = VoltronMap();
            paramsMap.push("text", changeText);
            context.moduleManager
                .getJavaScriptModule<EventDispatcher>(
                    enumValueToString(JavaScriptModuleType.EventDispatcher))
                ?.receiveUIComponentEvent(id, "onChangeText", paramsMap);
            LogUtils.d(TextInputController.tag,
                "afterTextChanged 2 通知前端文本变化= $changeText");
            _regexValidRepeat = "";
          }
        }
      } catch (error) {
        // 不知道外部的正则表达式,最好保护住
        LogUtils.e(TextInputController.tag, "change text error:$error");
      }
    }
  }

  bool _isJsSetValue(String value) {
    return !isEmpty(_jsSetValue) && value == _jsSetValue;
  }

  void jsSetValue(String? value, int pos) {
    if (value == null) {
      _jsSetValue = value ?? '';
      controller.text = value;
    } else {
      _jsSetValue = value;
      var offset = (pos < 0 || pos >= value.length) ? value.length : pos;
      controller.value = TextEditingValue(
          text: _jsSetValue,
          selection: TextSelection.fromPosition(
              TextPosition(offset: offset, affinity: TextAffinity.downstream)));
      // 这里设置时候也要通知到前端
      var paramsMap = VoltronMap();
      paramsMap.push("text", value);
      context.moduleManager
          .getJavaScriptModule<EventDispatcher>(
              enumValueToString(JavaScriptModuleType.EventDispatcher))
          ?.receiveUIComponentEvent(id, "onChangeText", paramsMap);
    }
  }

  VoltronMap jsGetValue() {
    var paramsMap = VoltronMap();
    paramsMap.push("text", text);
    return paramsMap;
  }

  String get text => controller.text;
}
