import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../viewmodel.dart';
import 'base.dart';
import 'div.dart';

class QrWidget extends FRStatefulWidget {
  final QrRenderViewModel renderViewModel;

  QrWidget(this.renderViewModel) : super(renderViewModel);

  @override
  State<StatefulWidget> createState() {
    return _QrWidgetState();
  }
}

class _QrWidgetState extends FRState<QrWidget> {
  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
        value: widget.renderViewModel,
        child: Consumer<QrRenderViewModel>(
          builder: (context, viewModel, widget) {
            return PositionWidget(viewModel, child: qrView(viewModel));
          },
        ));
  }

  Widget qrView(QrRenderViewModel viewModel) {
    var text = viewModel.text;
    if (text != null && text.isNotEmpty) {
      return QrImage(
        data: text,
        semanticsLabel: '',
        version: viewModel.version,
        errorCorrectionLevel: viewModel.level,
        padding: EdgeInsets.all(0),
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
