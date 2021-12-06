import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/widgets.dart';

abstract class BaseTapGestureRecognizer
    extends PrimaryPointerGestureRecognizer {
  /// Creates a tap gesture recognizer.
  BaseTapGestureRecognizer({Object? debugOwner})
      : super(deadline: kPressTimeout, debugOwner: debugOwner);

  bool _sentTapDown = false;
  bool _wonArenaForPrimaryPointer = false;

  PointerDownEvent? _down;
  PointerUpEvent? _up;

  /// A pointer has contacted the screen, which might be the start of a tap.
  ///
  /// This triggers after the down event, once a short timeout ([deadline]) has
  /// elapsed, or once the gesture has won the arena, whichever comes first.
  ///
  /// The parameter `down` is the down event of the primary pointer that started
  /// the tap sequence.
  ///
  /// If this recognizer doesn't win the arena, [handleTapCancel] is called next.
  /// Otherwise, [handleTapUp] is called next.
  @protected
  void handleTapDown({PointerDownEvent down});

  /// A pointer has stopped contacting the screen, which is recognized as a tap.
  ///
  /// This triggers on the up event, if the recognizer wins the arena with it
  /// or has previously won.
  ///
  /// The parameter `down` is the down event of the primary pointer that started
  /// the tap sequence, and `up` is the up event that ended the tap sequence.
  ///
  /// If this recognizer doesn't win the arena, [handleTapCancel] is called
  /// instead.
  @protected
  void handleTapUp({PointerDownEvent down, PointerUpEvent up});

  /// A pointer that previously triggered [handleTapDown] will not end up
  /// causing a tap.
  ///
  /// This triggers once the gesture loses the arena, if [handleTapDown] has
  /// been previously triggered.
  ///
  /// The parameter `down` is the down event of the primary pointer that started
  /// the tap sequence; `cancel` is the cancel event, which might be null;
  /// `reason` is a short description of the cause if `cancel` is null, which
  /// can be "forced" if other gestures won the arena, or "spontaneous"
  /// otherwise.
  ///
  /// If this recognizer wins the arena, [handleTapUp] is called instead.
  @protected
  void handleTapCancel(
      {PointerDownEvent down, PointerCancelEvent cancel, String reason});

  @override
  void addAllowedPointer(PointerDownEvent event) {
    if (state == GestureRecognizerState.ready) {
      // `_down` must be assigned in this method instead of `handlePrimaryPointer`,
      // because `acceptGesture` might be called before `handlePrimaryPointer`,
      // which relies on `_down` to call `handleTapDown`.
      _down = event;
    }
    if (_down != null) {
      // This happens when this tap gesture has been rejected while the pointer
      // is down (i.e. due to movement), when another allowed pointer is added,
      // in which case all pointers are simply ignored. The `_down` being null
      // means that _reset() has been called, since it is always set at the
      // first allowed down event and will not be cleared except for reset(),
      super.addAllowedPointer(event);
    }
  }

  @override
  @protected
  void startTrackingPointer(int pointer, [Matrix4? transform]) {
    // The recognizer should never track any pointers when `_down` is null,
    // because calling `_checkDown` in this state will throw exception.
    assert(_down != null);
    super.startTrackingPointer(pointer, transform);
  }

  @override
  void handlePrimaryPointer(PointerEvent event) {
    if (event is PointerUpEvent) {
      _up = event;
      _checkUp();
    } else if (event is PointerCancelEvent) {
      resolve(GestureDisposition.rejected);
      if (_sentTapDown) {
        _checkCancel(event, '');
      }
      _reset();
    } else if (event.buttons != _down?.buttons) {
      resolve(GestureDisposition.rejected);
      var newPrimaryPointer = primaryPointer;
      if (newPrimaryPointer != null) {
        stopTrackingPointer(newPrimaryPointer);
      }
    }
  }

  @override
  void resolve(GestureDisposition disposition) {
    if (_wonArenaForPrimaryPointer &&
        disposition == GestureDisposition.rejected) {
      // This can happen if the gesture has been canceled. For example, when
      // the pointer has exceeded the touch slop, the buttons have been changed,
      // or if the recognizer is disposed.
      assert(_sentTapDown);
      _checkCancel(null, 'spontaneous');
      _reset();
    }
    super.resolve(disposition);
  }

  @override
  void didExceedDeadline() {
    _checkDown();
  }

  @override
  void acceptGesture(int pointer) {
    super.acceptGesture(pointer);
    if (pointer == primaryPointer) {
      _checkDown();
      _wonArenaForPrimaryPointer = true;
      _checkUp();
    }
  }

  @override
  void rejectGesture(int pointer) {
    super.rejectGesture(pointer);
    if (pointer == primaryPointer) {
      // Another gesture won the arena.
      assert(state != GestureRecognizerState.possible);
      if (_sentTapDown) _checkCancel(null, 'forced');
      _reset();
    }
  }

  void _checkDown() {
    var down = _down;
    if (_sentTapDown || down == null) {
      return;
    }
    handleTapDown(down: down);
    _sentTapDown = true;
  }

  void _checkUp() {
    var up = _up;
    var down = _down;
    if (!_wonArenaForPrimaryPointer || up == null || down == null) {
      return;
    }

    handleTapUp(down: down, up: up);
    _reset();
  }

  void _checkCancel(PointerCancelEvent? event, String note) {
    var down = _down;
    var cancel = event;
    if (down == null || cancel == null) {
      return;
    }

    handleTapCancel(down: down, cancel: cancel, reason: note);
  }

  void _reset() {
    _sentTapDown = false;
    _wonArenaForPrimaryPointer = false;
    _up = null;
    _down = null;
  }

  @override
  String get debugDescription => 'base tap';

  @override
  void debugFillProperties(DiagnosticPropertiesBuilder properties) {
    super.debugFillProperties(properties);
    properties.add(FlagProperty('wonArenaForPrimaryPointer',
        value: _wonArenaForPrimaryPointer, ifTrue: 'won arena'));
    properties.add(DiagnosticsProperty<Offset>('finalPosition', _up?.position,
        defaultValue: null));
    properties.add(DiagnosticsProperty<Offset>(
        'finalLocalPosition', _up?.localPosition,
        defaultValue: _up?.position));
    properties.add(
        DiagnosticsProperty<int>('button', _down?.buttons, defaultValue: null));
    properties.add(FlagProperty('sentTapDown',
        value: _sentTapDown, ifTrue: 'sent tap down'));
  }
}
