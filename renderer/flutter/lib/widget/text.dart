import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:provider/provider.dart';

import '../style/text.dart';
import '../viewmodel/text.dart';
import 'base.dart';
import 'div.dart';

class TextWidget extends FRStatefulWidget {
  final TextRenderViewModel renderViewModel;

  TextWidget(this.renderViewModel) : super(renderViewModel);

  @override
  State<StatefulWidget> createState() {
    return _TextWidgetState();
  }
}

class _TextWidgetState extends FRState<TextWidget> {
  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
        value: widget.renderViewModel,
        child: Consumer<TextRenderViewModel>(
          builder: (context, viewModel, widget) {
            return PositionWidget(viewModel, child: textView(viewModel));
          },
        ));
  }

  Widget textView(TextRenderViewModel textModel) {
    var data = textModel.data;
    if (textModel.padding != null && data != null) {
      return Container(
        alignment: textModel.getAlignment(),
        padding: textModel.padding,
        child: RichText(
            text: data.text,
            textAlign: data.textAlign,
            maxLines: data.maxLines,
            textScaleFactor: data.textScaleFactor,
            overflow: data.textOverflow),
      );
    } else {
      return Container();
    }
  }

  @override
  void dispose() {
    super.dispose();
    if (!widget.renderViewModel.isDispose) {
      widget.renderViewModel.onDispose();
    }
  }
}

class TextViewModel {
  final Size size;
  final EdgeInsets padding;
  final TextData data;

  const TextViewModel(this.padding, this.data, this.size);

  @override
  bool operator ==(Object other) =>
      other is TextViewModel &&
      other.padding == padding &&
      data == other.data &&
      size == other.size;

  @override
  int get hashCode => padding.hashCode | data.hashCode | size.hashCode;
}
