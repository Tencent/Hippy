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
  static const String kClassName = "TextInput";
  static const String kTag = "TextInputController";

  static const String kDefaultValue = "defaultValue";
  static const String kValidator = "validator";
  static const String kEditable = "editable";
  static const String kCaretColorReact = "caret-color";
  static const String kCaretColorVue = "caretColor";
  static const String kMultiline = "multiline";
  static const String kReturnKeyType = "returnKeyType";
  static const String kKeyboardType = "keyboardType";
  static const String kMaxLengthProp = "maxLength";
  static const String kOnSelectionChange = "onSelectionChange";
  static const String kValueProp = "value";
  static const String kPlaceholder = "placeholder";
  static const String kPlaceholderTextColorReact = "placeholder-text-color";
  static const String kPlaceholderTextColorVue = "placeholderTextColor";
  static const String kNumberOfLines = "numberOfLines";
  static const String kUnderlineColor = "underlineColorAndroid";
  static const String kLineHeight = "lineHeight";
  static const String kOnChangeText = "onChangeText";
  static const String kOnEndEditing = "onEndEditing";
  static const String kOnFocus = "onFocus";
  static const String kOnBlur = "onBlur";
  static const String kOnContentSizeChange = "onContentSizeChange";

  static const String kClearFunction = "clear";
  static const String kCommandFocus = "focusTextInput";
  static const String kCommandBlur = "blurTextInput";
  static const String kCommandGetValue = "getValue";
  static const String kCommandSetValue = "setValue";
  // 注意这里由于js侧使用了错误拼写，这里暂时不能修改成正确的拼写，否则会导致无法成功调用
  static const String kCommandKeyboardDismiss = "dissmiss";

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
        NodeProps.kFontSize:
            ControllerMethodProp(setFontSize, NodeProps.kDefaultFontSizeSp),
        kDefaultValue: ControllerMethodProp(setDefaultValue, ""),
        kValidator: ControllerMethodProp(setValidator, ""),
        kEditable: ControllerMethodProp(setEditable, true),
        kCaretColorReact:
            ControllerMethodProp(setCaretColor, Colors.transparent.value),
        kCaretColorVue:
            ControllerMethodProp(setCaretColorAlias, Colors.transparent.value),
        kMultiline: ControllerMethodProp(multiLine, true),
        kReturnKeyType: ControllerMethodProp(setReturnKeyType, ""),
        kKeyboardType: ControllerMethodProp(setKeyboardType, ""),
        NodeProps.kFontStyle: ControllerMethodProp(setFontStyle, "normal"),
        NodeProps.kFontFamily: ControllerMethodProp(setFontFamily, "normal"),
        NodeProps.kFontWeight: ControllerMethodProp(setFontWeight, "normal"),
        NodeProps.kLineHeight: ControllerMethodProp(setLineHeight, 0.0),
        kMaxLengthProp: ControllerMethodProp(maxLength, -1),
        kOnSelectionChange: ControllerMethodProp(setOnSelectionChange, false),
        NodeProps.kLetterSpacing: ControllerMethodProp(letterSpacing, -1),
        kValueProp: ControllerMethodProp(value, ""),
        kPlaceholder: ControllerMethodProp(placeHolder, ""),
        kPlaceholderTextColorVue:
            ControllerMethodProp(setTextHitColorVue, 0xFF888888),
        kPlaceholderTextColorReact:
            ControllerMethodProp(setTextHitColorReact, 0xFF888888),
        kNumberOfLines: ControllerMethodProp(setMaxLines, kMaxLineCount),
        kUnderlineColor:
            ControllerMethodProp(setUnderlineColor, Colors.transparent.value),
        kOnChangeText: ControllerMethodProp(setOnChangeText, false),
        kOnEndEditing: ControllerMethodProp(setEndEditing, false),
        kOnFocus: ControllerMethodProp(setOnFocus, false),
        kOnBlur: ControllerMethodProp(setBlur, false),
        kOnContentSizeChange:
            ControllerMethodProp(setOnContentSizeChange, false),
        NodeProps.kColor:
            ControllerMethodProp(setColor, Colors.transparent.value),
        NodeProps.kTextAlign: ControllerMethodProp(setTextAlign, "auto"),
        NodeProps.kTextAlignVertical:
            ControllerMethodProp(setTextAlignVertical, "auto"),
        NodeProps.kPaddingTop: ControllerMethodProp(setPaddingTop, 0.0),
        NodeProps.kPaddingRight: ControllerMethodProp(setPaddingRight, 0.0),
        NodeProps.kPaddingBottom: ControllerMethodProp(setPaddingBottom, 0.0),
        NodeProps.kPaddingLeft: ControllerMethodProp(setPaddingLeft, 0.0),
      };

  @override
  String get name => kClassName;

  @ControllerProps(NodeProps.kFontSize)
  void setFontSize(TextInputRenderViewModel renderViewModel, double fontSize) {
    renderViewModel.fontSize = fontSize;
  }

  @ControllerProps(kDefaultValue)
  void setDefaultValue(
      TextInputRenderViewModel renderViewModel, String defaultValue) {
    renderViewModel.setValue(defaultValue);
  }

  @ControllerProps(kValidator)
  void setValidator(
      TextInputRenderViewModel renderViewModel, String strValidator) {
    renderViewModel.dispatcher.validator = strValidator;
  }

  @ControllerProps(kEditable)
  void setEditable(TextInputRenderViewModel renderViewModel, bool editable) {
    renderViewModel.editable = editable;
  }

  // 设置输入光标颜色  RN 语法 caret-color
  @ControllerProps(kCaretColorReact)
  void setCaretColor(
      TextInputRenderViewModel renderViewModel, int cursorColor) {
    renderViewModel.cursorColor = cursorColor;
  }

  //  设置输入光标颜色
  //For Vue.vue的前端语法，会把caret-color转化成caretColor
  @ControllerProps(kCaretColorVue)
  void setCaretColorAlias(
      TextInputRenderViewModel renderViewModel, int cursorColor) {
    renderViewModel.cursorColor = cursorColor;
  }

  @ControllerProps(kMultiline)
  void multiLine(TextInputRenderViewModel renderViewModel, bool multiline) {
    renderViewModel.setMultiLine(multiline);
  }

  @ControllerProps(kReturnKeyType)
  void setReturnKeyType(
      TextInputRenderViewModel renderViewModel, String returnKeyType) {
    renderViewModel.setTextInputType(returnKeyType);
  }

  @ControllerProps(kKeyboardType)
  void setKeyboardType(
      TextInputRenderViewModel renderViewModel, String keyboardType) {
    renderViewModel.setKeyboardType(keyboardType);
  }

  @ControllerProps(NodeProps.kFontStyle)
  void setFontStyle(
      TextInputRenderViewModel renderViewModel, String fontStyleString) {
    renderViewModel.setFontStyle(fontStyleString);
  }

  @ControllerProps(NodeProps.kFontWeight)
  void setFontWeight(
      TextInputRenderViewModel renderViewModel, String fontWeightString) {
    renderViewModel.setFontWeight(fontWeightString);
  }

  @ControllerProps(NodeProps.kLineHeight)
  void setLineHeight(
      TextInputRenderViewModel renderViewModel, double lineHeight) {
    renderViewModel.lineHeight = lineHeight;
  }

  @ControllerProps(NodeProps.kFontFamily)
  void setFontFamily(
      TextInputRenderViewModel renderViewModel, String fontFamily) {
    renderViewModel.fontFamily = fontFamily;
  }

  @ControllerProps(kMaxLengthProp)
  void maxLength(TextInputRenderViewModel renderViewModel, int maxLength) {
    renderViewModel.maxLength = maxLength;
  }

  @ControllerProps(kOnSelectionChange)
  void setOnSelectionChange(
      TextInputRenderViewModel renderViewModel, bool change) {
    renderViewModel.dispatcher.listenSelectionChange = change;
  }

  @ControllerProps(NodeProps.kLetterSpacing)
  void letterSpacing(
      TextInputRenderViewModel renderViewModel, double letterSpacing) {
    renderViewModel.letterSpacing = letterSpacing;
  }

  @ControllerProps(kValueProp)
  void value(TextInputRenderViewModel renderViewModel, String value) {
    renderViewModel.setValue(value);
  }

  @ControllerProps(kPlaceholder)
  void placeHolder(
      TextInputRenderViewModel renderViewModel, String placeholder) {
    renderViewModel.hint = placeholder;
  }

  @ControllerProps(kPlaceholderTextColorVue)
  void setTextHitColorVue(TextInputRenderViewModel renderViewModel, int color) {
    renderViewModel.hintTextColor = color;
  }

  @ControllerProps(kPlaceholderTextColorReact)
  void setTextHitColorReact(
      TextInputRenderViewModel renderViewModel, int color) {
    renderViewModel.hintTextColor = color;
  }

  @ControllerProps(kNumberOfLines)
  void setMaxLines(TextInputRenderViewModel renderViewModel, int numberOfLine) {
    renderViewModel.numberOfLine = numberOfLine;
  }

  @ControllerProps(kUnderlineColor)
  void setUnderlineColor(
      TextInputRenderViewModel renderViewModel, int underlineColor) {
    renderViewModel.underLineColor = underlineColor;
  }

  @ControllerProps(kOnChangeText)
  void setOnChangeText(TextInputRenderViewModel renderViewModel, bool change) {
    renderViewModel.dispatcher.listenChangeText = change;
  }

  @ControllerProps(kOnEndEditing)
  void setEndEditing(TextInputRenderViewModel renderViewModel, bool change) {
    renderViewModel.dispatcher.listenEndEditing = change;
  }

  @ControllerProps(kOnFocus)
  void setOnFocus(TextInputRenderViewModel renderViewModel, bool change) {
    renderViewModel.dispatcher.listenFocus = change;
  }

  @ControllerProps(kOnBlur)
  void setBlur(TextInputRenderViewModel renderViewModel, bool change) {
    renderViewModel.dispatcher.listenFocus = change;
  }

  @ControllerProps(kOnContentSizeChange)
  void setOnContentSizeChange(
      TextInputRenderViewModel renderViewModel, bool contentSizeChange) {
    renderViewModel.dispatcher.listenContentSizeChange = contentSizeChange;
  }

  @ControllerProps(NodeProps.kColor)
  void setColor(TextInputRenderViewModel renderViewModel, int change) {
    renderViewModel.textColor = change;
  }

  @ControllerProps(NodeProps.kTextAlign)
  void setTextAlign(
      TextInputRenderViewModel renderViewModel, String textAlign) {
    renderViewModel.setTextAlign(textAlign);
  }

  @ControllerProps(NodeProps.kTextAlignVertical)
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

  @ControllerProps(NodeProps.kPaddingTop)
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

  @ControllerProps(NodeProps.kPaddingRight)
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

  @ControllerProps(NodeProps.kPaddingBottom)
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

  @ControllerProps(NodeProps.kPaddingLeft)
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
      case kCommandSetValue:
        var value = array.getString(0);
        if (value != null) {
          int pos = array.get(1);
          LogUtils.i("text_input", "js set value: $value, $pos");
          if (array.size() < 2) pos = array.getString(0)?.length ?? 0;
          renderViewModel.dispatcher.jsSetValue(array.getString(0), pos);
        }
        break;
      case kClearFunction:
        renderViewModel.dispatcher.jsSetValue("", 0);
        break;
      case kCommandFocus:
        renderViewModel.focus();
        break;
      case kCommandKeyboardDismiss:
        renderViewModel.dismiss();
        break;
      case kCommandBlur:
        renderViewModel.blur();
        break;
      case kCommandGetValue:
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
        LogUtils.d(TextInputController.kTag,
            "afterTextChanged 1 通知前端文本变化=$changeText");
      }
    } else {
      //如果设置了正则表达式
      try {
        //如果当前的内容不匹配正则表达式
        if (!RegExp(validator).hasMatch(changeText) && changeText != "") {
          LogUtils.d(TextInputController.kTag,
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
            LogUtils.d(TextInputController.kTag,
                "afterTextChanged 2 通知前端文本变化= $changeText");
            _regexValidRepeat = "";
          }
        }
      } catch (error) {
        // 不知道外部的正则表达式,最好保护住
        LogUtils.e(TextInputController.kTag, "change text error:$error");
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
