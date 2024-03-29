//
// Tencent is pleased to support the open source community by making
// Hippy available.
//
// Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

// Mocks generated by Mockito 5.3.0 from annotations
// in voltron_renderer/test/mock/render_context.dart.
// Do not manually edit this file.

// ignore_for_file: no_leading_underscores_for_library_prefixes
import 'dart:async' as _i3;

import 'package:flutter/cupertino.dart' as _i6;
import 'package:mockito/mockito.dart' as _i1;
import 'package:voltron_renderer/bridge/render_bridge.dart' as _i2;
import 'package:voltron_renderer/common.dart' as _i7;
import 'package:voltron_renderer/engine/dimension.dart' as _i5;
import 'package:voltron_renderer/style.dart' as _i4;
import 'package:voltron_renderer/render/render_context.dart' as _i8;

// ignore_for_file: type=lint
// ignore_for_file: avoid_redundant_argument_values
// ignore_for_file: avoid_setters_without_getters
// ignore_for_file: comment_references
// ignore_for_file: implementation_imports
// ignore_for_file: invalid_use_of_visible_for_testing_member
// ignore_for_file: prefer_const_constructors
// ignore_for_file: unnecessary_parenthesis
// ignore_for_file: camel_case_types
// ignore_for_file: subtype_of_sealed_class

/// A class which mocks [VoltronRenderBridgeManager].
///
/// See the documentation for Mockito's code generation for more information.
class MockVoltronRenderBridgeManager extends _i1.Mock implements _i2.VoltronRenderBridgeManager {
  MockVoltronRenderBridgeManager() {
    _i1.throwOnMissingStub(this);
  }

  @override
  int get workerManagerId => (super.noSuchMethod(
        Invocation.getter(#workerManagerId),
        returnValue: 0,
      ) as int);

  @override
  void init() => super.noSuchMethod(
        Invocation.method(#init, []),
        returnValueForMissingStub: null,
      );

  @override
  void bindRenderContext(_i8.RenderContext renderContext) => super.noSuchMethod(
        Invocation.method(#bindRenderContext, []),
        returnValueForMissingStub: null,
      );

  @override
  void initRenderApi() => super.noSuchMethod(
        Invocation.method(#initRenderApi, []),
        returnValueForMissingStub: null,
      );

  @override
  int createWorkerManager() => super.noSuchMethod(
        Invocation.method(#createWorkerManager, []),
        returnValueForMissingStub: null,
        returnValue: 1,
      );

  @override
  void destroyWorkerManager(int workerManagerId) => super.noSuchMethod(
        Invocation.method(#destroyWorkerManager, []),
        returnValueForMissingStub: null,
      );

  @override
  int createDomInstance() => (super.noSuchMethod(
        Invocation.method(#createDomInstance, []),
        returnValue: 0,
      ) as int);

  @override
  void destroyDomInstance(int? domInstanceId) => super.noSuchMethod(
        Invocation.method(#destroyDomInstance, [domInstanceId]),
        returnValueForMissingStub: null,
      );

  @override
  void addRoot(int? domInstanceId, int? rootId) =>
      super.noSuchMethod(Invocation.method(#addRoot, [domInstanceId, rootId]),
          returnValueForMissingStub: null);

  @override
  void removeRoot(int? domInstanceId, int? rootId) =>
      super.noSuchMethod(Invocation.method(#removeRoot, [domInstanceId, rootId]),
          returnValueForMissingStub: null);

  @override
  int createNativeRenderManager() =>
      (super.noSuchMethod(Invocation.method(#createNativeRenderManager, []), returnValue: 0)
          as int);

  @override
  _i3.Future<dynamic> destroyNativeRenderManager() =>
      (super.noSuchMethod(Invocation.method(#destroyNativeRenderManager, []),
          returnValue: _i3.Future<dynamic>.value()) as _i3.Future<dynamic>);

  @override
  _i3.Future<dynamic> updateNodeSize(int? rootId,
          {int? nodeId = 0, double? width = 0.0, double? height = 0.0}) =>
      (super.noSuchMethod(
          Invocation.method(
              #updateNodeSize, [rootId], {#nodeId: nodeId, #width: width, #height: height}),
          returnValue: _i3.Future<dynamic>.value()) as _i3.Future<dynamic>);

  @override
  _i3.Future<dynamic> notifyRender(int? renderManagerId) =>
      (super.noSuchMethod(Invocation.method(#notifyRender, [renderManagerId]),
          returnValue: _i3.Future<dynamic>.value()) as _i3.Future<dynamic>);

  @override
  _i3.Future<dynamic> callNativeFunction(String? callbackId, Object? params) =>
      (super.noSuchMethod(Invocation.method(#callNativeFunction, [callbackId, params]),
          returnValue: _i3.Future<dynamic>.value()) as _i3.Future<dynamic>);

  @override
  _i3.Future<dynamic> execNativeCallback(String? callbackId, Object? params) =>
      (super.noSuchMethod(Invocation.method(#execNativeCallback, [callbackId, params]),
          returnValue: _i3.Future<dynamic>.value()) as _i3.Future<dynamic>);

  @override
  _i3.Future<dynamic> execNativeEvent(int? rootId, int? id, String? event, Object? params) =>
      (super.noSuchMethod(Invocation.method(#execNativeEvent, [rootId, id, event, params]),
          returnValue: _i3.Future<dynamic>.value()) as _i3.Future<dynamic>);

  @override
  void destroy() =>
      super.noSuchMethod(Invocation.method(#destroy, []), returnValueForMissingStub: null);

  @override
  void postRenderOp(int? rootId, dynamic renderOp) =>
      super.noSuchMethod(Invocation.method(#postRenderOp, [rootId, renderOp]),
          returnValueForMissingStub: null);

  @override
  int calculateNodeLayout(int? instanceId, int? nodeId, _i4.FlexLayoutParams? layoutParams) =>
      (super.noSuchMethod(
          Invocation.method(#calculateNodeLayout, [instanceId, nodeId, layoutParams]),
          returnValue: 0) as int);
}

/// A class which mocks [DimensionChecker].
///
/// See the documentation for Mockito's code generation for more information.
class MockDimensionChecker extends _i1.Mock implements _i5.DimensionChecker {
  MockDimensionChecker() {
    _i1.throwOnMissingStub(this);
  }

  @override
  void checkUpdateDimension(
    _i6.BuildContext? uiContext,
    _i7.VoltronMap? dimensionMap,
    int? windowWidth,
    int? windowHeight,
    bool? shouldUseScreenDisplay,
    bool? systemUiVisibilityChanged,
  ) =>
      super.noSuchMethod(
        Invocation.method(
          #checkUpdateDimension,
          [
            uiContext,
            dimensionMap,
            windowWidth,
            windowHeight,
            shouldUseScreenDisplay,
            systemUiVisibilityChanged
          ],
        ),
        returnValueForMissingStub: null,
      );
}
