import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../render/text_input.dart';
import 'div.dart';

class TextInputWidget extends StatefulWidget {
  final TextInputRenderViewModel _viewModel;

  TextInputWidget(this._viewModel);

  @override
  State<StatefulWidget> createState() {
    return _TextInputWidgetState();
  }
}

class _TextInputWidgetState extends State<TextInputWidget> {
  @override
  void initState() {
    super.initState();
    widget._viewModel.onInit();
  }

  @override
  void didUpdateWidget(covariant TextInputWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget._viewModel != oldWidget._viewModel) {
      widget._viewModel.onInit();
    }
  }

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
        value: widget._viewModel,
        child: Consumer<TextInputRenderViewModel>(
          builder: (context, viewModel, widget) {
            return PositionWidget(viewModel, child: _textInput(viewModel));
          },
        ));
  }

  Widget _textInput(TextInputRenderViewModel inputModel) {
    return TextField(
      scrollPadding: EdgeInsets.all(0),
      decoration: InputDecoration(
        /// 解决文字居中问题
        focusedBorder: OutlineInputBorder(
            borderSide: BorderSide(width: 0, color: Colors.transparent)),
        disabledBorder: OutlineInputBorder(
            borderSide: BorderSide(width: 0, color: Colors.transparent)),
        enabledBorder: OutlineInputBorder(
            borderSide: BorderSide(width: 0, color: Colors.transparent)),
        border: OutlineInputBorder(
            borderSide: BorderSide(width: 0, color: Colors.transparent)),
        contentPadding: EdgeInsets.only(
            top: inputModel.paddingTop,
            right: inputModel.paddingRight,
            bottom: inputModel.paddingBottom,
            left: inputModel.paddingLeft),
        hintText: inputModel.hint,
        counterText: '',
        hintStyle: TextStyle(
          color: Color(inputModel.hintTextColor),
          fontSize: inputModel.fontSize,
        ),
      ),
      controller: inputModel.controller.realController,
      focusNode: inputModel.node.realNode,
      keyboardType: inputModel.textInputType,
      textInputAction: inputModel.textInputAction,
      textAlign: inputModel.textAlign,
      textAlignVertical: inputModel.textAlignVertical,
      maxLength: inputModel.maxLength > 0 ? inputModel.maxLength : null,
      // ignore: deprecated_member_use
      maxLengthEnforced: inputModel.maxLength > 0,
      obscureText: inputModel.obscureText,
      enabled: inputModel.editable,
      cursorColor: Color(inputModel.cursorColor),
      maxLines: inputModel.numberOfLine,
      onEditingComplete: () {
        inputModel.dispatcher.onEndEdit();
      },
      scrollPhysics: BouncingScrollPhysics(),
      style: TextStyle(
        color: Color(inputModel.textColor),
        fontSize: inputModel.fontSize,
        fontStyle: inputModel.fontStyle,
        fontWeight: inputModel.fontWeight,
        letterSpacing: inputModel.letterSpacing,
        fontFamily: inputModel.fontFamily,
        height: inputModel.lineHeight > 0
            ? inputModel.lineHeight / inputModel.fontSize
            : null,
        leadingDistribution: TextLeadingDistribution.even,
      ),
    );
  }

  @override
  void dispose() {
    super.dispose();
    if (!widget._viewModel.isDispose) {
      widget._viewModel.onDispose();
    }
  }
}
