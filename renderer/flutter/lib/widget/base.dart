import 'package:flutter/widgets.dart';

import '../adapter.dart';
import '../engine.dart';
import '../viewmodel.dart';

typedef ContextWrapper = BuildContext? Function();

abstract class FRStatefulWidget extends StatefulWidget {
  final RenderViewModel _viewModel;

  FRStatefulWidget(this._viewModel) : super(key: _viewModel.renderKey);

  @override
  RFStatefulElement createElement() {
    var elementTimePoint =
        ElementTimePoint(_viewModel.name, '', _viewModel.context);
    elementTimePoint.start();
    var result = RFStatefulElement(this);
    elementTimePoint.end();
    return result;
  }
}

class RFStatefulElement extends StatefulElement {
  RFStatefulElement(FRStatefulWidget widget) : super(widget);

  @override
  Widget build() {
    var fRWidget = widget as FRStatefulWidget;
    var time = BuildTimePoint(fRWidget._viewModel.name,
        fRWidget.runtimeType.toString(), fRWidget._viewModel.context);
    time.start();
    var result = super.build();
    time.end();
    return result;
  }
}

abstract class FRState<T extends FRStatefulWidget> extends State<T> {
  @mustCallSuper
  @override
  void initState() {
    super.initState();
    widget._viewModel.wrapper = () {
      return context;
    };
  }

  @mustCallSuper
  @override
  void dispose() {
    super.dispose();
    widget._viewModel.wrapper = null;
    if (!widget._viewModel.isDispose) {
      widget._viewModel.onDispose();
    }
  }
}

abstract class FRBaseStatelessWidget extends StatelessWidget {
  final String _name;
  final EngineContext _context;

  const FRBaseStatelessWidget(this._name, this._context);

  @override
  RFStatelessElement createElement() {
    var elementTime = ElementTimePoint(_name, '', _context);
    elementTime.start();
    var result = RFStatelessElement(this);
    elementTime.end();
    return result;
  }
}

class RFStatelessElement extends StatelessElement {
  RFStatelessElement(FRBaseStatelessWidget widget) : super(widget);

  @override
  Widget build() {
    var fRWidget = widget as FRBaseStatelessWidget;
    var buildPoint = BuildTimePoint(
        fRWidget._name, fRWidget.runtimeType.toString(), fRWidget._context);
    buildPoint.start();
    var result = super.build();
    buildPoint.end();
    return result;
  }
}
