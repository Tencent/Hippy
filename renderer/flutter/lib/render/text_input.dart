import 'package:flutter/material.dart';

import '../common/voltron_array.dart';
import '../common/voltron_map.dart';
import '../controller/manager.dart';
import '../controller/props.dart';
import '../dom/prop.dart';
import '../dom/text.dart';
import '../engine/engine_context.dart';
import '../module/event_dispatcher.dart';
import '../module/module.dart';
import '../module/promise.dart';
import '../util/enum_util.dart';
import '../util/log_util.dart';
import '../util/string_util.dart';
import '../widget/text_input.dart';
import 'controller.dart';
import 'node.dart';
import 'tree.dart';
import 'view_model.dart';

class TextInputController extends VoltronViewController<TextInputRenderNode> {
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
  static const String commandKeyboardDismiss = "dissmiss";

  @override
  TextInputRenderNode createRenderNode(int id, VoltronMap? props, String name,
      RenderTree tree, ControllerManager controllerManager, bool lazy) {
    return TextInputRenderNode(
        id: id,
        props: props,
        className: name,
        root: tree,
        controllerManager: controllerManager,
        isLazy: lazy);
  }

  @override
  Widget createWidget(BuildContext context, TextInputRenderNode renderNode) {
    return TextInputWidget(renderNode.renderViewModel);
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
        numberOfLines: ControllerMethodProp(setMaxLines, TextNode.maxLineCount),
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
  void setFontSize(TextInputRenderNode textInput, double fontSize) {
    textInput.renderViewModel.fontSize = fontSize;
  }

  @ControllerProps(defaultValue)
  void setDefaultValue(TextInputRenderNode textInput, String defaultValue) {
    textInput.renderViewModel.setValue(defaultValue);
  }

  @ControllerProps(validator)
  void setValidator(TextInputRenderNode textInput, String strValidator) {
    textInput.renderViewModel.dispatcher.validator = strValidator;
  }

  @ControllerProps(editable)
  void setEditable(TextInputRenderNode textInput, bool editable) {
    textInput.renderViewModel.editable = editable;
  }

  // 设置输入光标颜色  RN 语法 caret-color
  @ControllerProps(caretColorReact)
  void setCaretColor(TextInputRenderNode textInput, int cursorColor) {
    textInput.renderViewModel.cursorColor = cursorColor;
  }

  //  设置输入光标颜色
  //For Vue.vue的前端语法，会把caret-color转化成caretColor
  @ControllerProps(caretColorVue)
  void setCaretColorAlias(TextInputRenderNode textInput, int cursorColor) {
    textInput.renderViewModel.cursorColor = cursorColor;
  }

  @ControllerProps(multiline)
  void multiLine(TextInputRenderNode textInput, bool multiline) {
    textInput.renderViewModel.setMultiLine(multiline);
  }

  @ControllerProps(returnKeyType)
  void setReturnKeyType(TextInputRenderNode view, String returnKeyType) {
    view.renderViewModel.setTextInputType(returnKeyType);
  }

  @ControllerProps(keyboardType)
  void setKeyboardType(TextInputRenderNode textInput, String keyboardType) {
    textInput.renderViewModel.setKeyboardType(keyboardType);
  }

  @ControllerProps(NodeProps.fontStyle)
  void setFontStyle(TextInputRenderNode view, String fontStyleString) {
    view.renderViewModel.setFontStyle(fontStyleString);
  }

  @ControllerProps(NodeProps.fontWeight)
  void setFontWeight(TextInputRenderNode view, String fontWeightString) {
    view.renderViewModel.setFontWeight(fontWeightString);
  }

  @ControllerProps(NodeProps.lineHeight)
  void setLineHeight(TextInputRenderNode view, double lineHeight) {
    view.renderViewModel.lineHeight = lineHeight;
  }

  @ControllerProps(NodeProps.fontFamily)
  void setFontFamily(TextInputRenderNode view, String fontFamily) {
    view.renderViewModel.fontFamily = fontFamily;
  }

  @ControllerProps(maxLengthProp)
  void maxLength(TextInputRenderNode view, int maxLength) {
    view.renderViewModel.maxLength = maxLength;
  }

  @ControllerProps(onSelectionChange)
  void setOnSelectionChange(TextInputRenderNode textInput, bool change) {
    textInput.renderViewModel.dispatcher.listenSelectionChange = change;
  }

  @ControllerProps(NodeProps.letterSpacing)
  void letterSpacing(TextInputRenderNode view, double letterSpacing) {
    view.renderViewModel.letterSpacing = letterSpacing;
  }

  @ControllerProps(valueProp)
  void value(TextInputRenderNode view, String value) {
    view.renderViewModel.setValue(value);
  }

  @ControllerProps(placeholder)
  void placeHolder(TextInputRenderNode view, String placeholder) {
    view.renderViewModel.hint = placeholder;
  }

  @ControllerProps(placeholderTextColorVue)
  void setTextHitColorVue(TextInputRenderNode input, int color) {
    input.renderViewModel.hintTextColor = color;
  }

  @ControllerProps(placeholderTextColorReact)
  void setTextHitColorReact(TextInputRenderNode input, int color) {
    input.renderViewModel.hintTextColor = color;
  }

  @ControllerProps(numberOfLines)
  void setMaxLines(TextInputRenderNode input, int numberOfLine) {
    input.renderViewModel.numberOfLine = numberOfLine;
  }

  @ControllerProps(underlineColor)
  void setUnderlineColor(TextInputRenderNode view, int underlineColor) {
    view.renderViewModel.underLineColor = underlineColor;
  }

  @ControllerProps(onChangeText)
  void setOnChangeText(TextInputRenderNode textInput, bool change) {
    textInput.renderViewModel.dispatcher.listenChangeText = change;
  }

  @ControllerProps(onEndEditing)
  void setEndEditing(TextInputRenderNode textInput, bool change) {
    textInput.renderViewModel.dispatcher.listenEndEditing = change;
  }

  @ControllerProps(onFocus)
  void setOnFocus(TextInputRenderNode textInput, bool change) {
    textInput.renderViewModel.dispatcher.listenFocus = change;
  }

  @ControllerProps(onBlur)
  void setBlur(TextInputRenderNode textInput, bool change) {
    textInput.renderViewModel.dispatcher.listenFocus = change;
  }

  @ControllerProps(onContentSizeChange)
  void setOnContentSizeChange(
      TextInputRenderNode textInput, bool contentSizeChange) {
    textInput.renderViewModel.dispatcher.listenContentSizeChange =
        contentSizeChange;
  }

  @ControllerProps(NodeProps.color)
  void setColor(TextInputRenderNode textInput, int change) {
    textInput.renderViewModel.textColor = change;
  }

  @ControllerProps(NodeProps.textAlign)
  void setTextAlign(TextInputRenderNode view, String textAlign) {
    view..renderViewModel.setTextAlign(textAlign);
  }

  @ControllerProps(NodeProps.textAlignVertical)
  void setTextAlignVertical(
      TextInputRenderNode view, String? textAlignVertical) {
    if (textAlignVertical == null || "auto" == textAlignVertical) {
      view.renderViewModel.textAlignVertical = null;
    } else if ("top" == textAlignVertical) {
      view.renderViewModel.textAlignVertical = TextAlignVertical.top;
    } else if ("bottom" == textAlignVertical) {
      view.renderViewModel.textAlignVertical = TextAlignVertical.bottom;
    } else if ("center" == textAlignVertical) {
      view.renderViewModel.textAlignVertical = TextAlignVertical.center;
    }
  }

  @ControllerProps(NodeProps.paddingTop)
  void setPaddingTop(TextInputRenderNode view, Object? paddingTop) {
    if (paddingTop is int) {
      view.renderViewModel.paddingTop = paddingTop.toDouble();
    } else if (paddingTop is double) {
      view.renderViewModel.paddingTop = paddingTop;
    } else {
      view.renderViewModel.paddingTop = 0.0;
    }
  }

  @ControllerProps(NodeProps.paddingRight)
  void setPaddingRight(TextInputRenderNode view, Object? paddingRight) {
    if (paddingRight is int) {
      view.renderViewModel.paddingRight = paddingRight.toDouble();
    } else if (paddingRight is double) {
      view.renderViewModel.paddingRight = paddingRight;
    } else {
      view.renderViewModel.paddingRight = 0.0;
    }
  }

  @ControllerProps(NodeProps.paddingBottom)
  void setPaddingBottom(TextInputRenderNode view, Object? paddingBottom) {
    if (paddingBottom is int) {
      view.renderViewModel.paddingBottom = paddingBottom.toDouble();
    } else if (paddingBottom is double) {
      view.renderViewModel.paddingBottom = paddingBottom;
    } else {
      view.renderViewModel.paddingBottom = 0.0;
    }
  }

  @ControllerProps(NodeProps.paddingLeft)
  void setPaddingLeft(TextInputRenderNode view, Object? paddingLeft) {
    if (paddingLeft is int) {
      view.renderViewModel.paddingLeft = paddingLeft.toDouble();
    } else if (paddingLeft is double) {
      view.renderViewModel.paddingLeft = paddingLeft;
    } else {
      view.renderViewModel.paddingLeft = 0.0;
    }
  }

  @override
  void dispatchFunction(
      TextInputRenderNode node, String functionName, VoltronArray array,
      {Promise? promise}) {
    switch (functionName) {
      case commandSetValue:
        var value = array.getString(0);
        if (value != null) {
          int pos = array.get(1);
          LogUtils.i("text_input", "js set value: $value, $pos");
          if (array.size() < 2) pos = array.getString(0)?.length ?? 0;
          node.renderViewModel.dispatcher.jsSetValue(array.getString(0), pos);
        }
        break;
      case clearFunction:
        node.renderViewModel.dispatcher.jsSetValue("", 0);
        break;
      case commandFocus:
        node.renderViewModel.focus();
        break;
      case commandKeyboardDismiss:
        node.renderViewModel.dismiss();
        break;
      case commandBlur:
        node.renderViewModel.blur();
        break;
      case commandGetValue:
        if (promise != null) {
          var resultMap = node.renderViewModel.dispatcher.jsGetValue();
          promise.resolve(resultMap);
        }
        break;
    }
  }
}

class TextInputRenderNode extends RenderNode<TextInputRenderViewModel> {
  TextInputRenderNode(
      {required int id,
      required String className,
      required RenderTree root,
      required ControllerManager controllerManager,
      VoltronMap? props,
      bool isLazy = false})
      : super(id, className, root, controllerManager, props, isLazy);

  @override
  TextInputRenderViewModel createRenderViewModel(EngineContext context) {
    return TextInputRenderViewModel(id, rootId, name, context);
  }
}

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

  int numberOfLine = TextNode.maxLineCount;

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
    textAlign = TextNode.parseTextAlign(textAlignStr);
  }

  void setFontWeight(String fontWeightStr) {
    fontWeight = TextNode.parseFontWeight(fontWeightStr);
  }

  void setFontStyle(String fontStyleStr) {
    fontStyle = TextNode.parseFontStyle(fontStyleStr);
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
