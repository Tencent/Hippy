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

import 'dart:async';
import 'dart:ffi';
import 'dart:typed_data';

import 'package:ffi/ffi.dart';
import 'package:flutter/services.dart';
import 'package:voltron_ffi/voltron_ffi.dart';

import 'define.dart';
import 'manager.dart';
import 'resource_data_holder.dart';

enum _VfsFuncType {
  invokeDart,
}

class _VfsApi {
  static const _kVfsRegisterHeader = "vfs_register";
  final DynamicLibrary _library = FfiManager().library;

  late final CreateVfsWrapperDartType _createVfsWrapper;
  late final DestroyVfsWrapperDartType _destroyVfsWrapper;
  late final OnDartInvokeDartType _onDartInvoke;
  late final OnInvokeDartCallbackDartType _onInvokeDartCallback;

  _VfsApi._internal() {
    _createVfsWrapper = _library.lookupFunction<CreateVfsWrapperNativeType,
        CreateVfsWrapperDartType>('CreateVfsWrapper');
    _destroyVfsWrapper = _library.lookupFunction<DestroyVfsWrapperNativeType,
        DestroyVfsWrapperDartType>('DestroyVfsWrapper');
    _onDartInvoke = _library.lookupFunction<OnDartInvokeNativeType,
        OnDartInvokeDartType>('OnDartInvoke');
    _onInvokeDartCallback = _library.lookupFunction<
        OnInvokeDartCallbackNativeType,
        OnInvokeDartCallbackDartType>('OnInvokeDartCallback');

    // 添加invokeDart回调
    var invokeDartRegisterFunc = FfiManager().library.lookupFunction<
            AddCallFuncNativeType<InvokeDartNativeType>,
            AddCallFuncDartType<InvokeDartNativeType>>(
        FfiManager().registerFuncName);
    var invokeDartFunc = Pointer.fromFunction<InvokeDartNativeType>(invokeDart);
    FfiManager().addRegisterFunc(_kVfsRegisterHeader,
        _VfsFuncType.invokeDart.index, invokeDartFunc, invokeDartRegisterFunc);
  }
}

Object? decodeObject(Pointer<Uint8> buffer, int length) {
  var dataList = buffer.cast<Uint8>().asTypedList(length);
  if (dataList.isNotEmpty) {
    return const StandardMessageCodec()
        .decodeMessage(dataList.buffer.asByteData());
  }
  return null;
}

void invokeDart(int id, int requestId,
    Pointer<Utf16> url, Pointer<Uint8> reqMeta, int reqMetaLen) {
  var manager = VfsManager.find(id);
  if (manager != null) {
    var urlString = url.toDartString();
    var reqMetaMap = decodeObject(reqMeta, reqMetaLen)?.safeAsMap<String, String>()??{};
    manager.nativeCallFetchResource(urlString, reqMetaMap, requestId);
  }
}

class DefaultVfsWrapper with NativeTraversalsWrapper {
  static const String _kUriKey = "url";
  static const String _kBufferKey = "buffer";
  static const String _kReqHeadersKey = "req_headers";
  static const String _kRspHeadersKey = "rsp_headers";
  static const String _kResultCodeKey = "result_code";
  final _VfsApi _api = _VfsApi._internal();
  int _id = 0;

  @override
  int get id => _id;
  bool get isInit => id >= 0;

  DefaultVfsWrapper();

  @override
  int initWrapper() {
    _id = _api._createVfsWrapper(FfiManager().id);
    return _id;
  }

  @override
  void destroyWrapper() {
    if (_id > 0) {
      _api._destroyVfsWrapper(_id);
    }
    _id = 0;
  }

  @override
  void doNativeTraversalsAsync(ResourceDataHolder holder, FetchResourceCallback callback) {
    if (!isInit) {
      holder.resultCode = FetchResultCode.ffiError;
      holder.errorMsg = 'call native processor error, wrapper is destroyed';
      callback(holder);
      return;
    }
    final paramsPair = encodeObject({
      _kUriKey: holder.url,
      _kReqHeadersKey: holder.requestHeaders??{}
    });

    if (paramsPair == null) {
      holder.resultCode = FetchResultCode.encodeParamsError;
      holder.errorMsg = 'call native processor error, invalid params';
      callback(holder);
      return;
    }

    _api._onDartInvoke(_id, paramsPair.left, paramsPair.right, generateCallback((value) {
      if (value is Map) {
        holder.resultCode =
            parseResultCode(value.safeGet<int>(_kResultCodeKey) ?? -1);
        holder.buffer = value.safeGet<Uint8List>(_kBufferKey);
        holder.responseHeaders =
            value.safeGetMap<String, String>(_kRspHeadersKey);
        if (holder.resultCode != FetchResultCode.ok) {
          holder.errorMsg = 'call native processor error';
        }
        callback(holder);
      } else {
        holder.resultCode = FetchResultCode.invalidResultError;
        holder.errorMsg = 'call native processor error, invalid result';
        callback(holder);
      }
    }));
  }

  @override
  Future<void> doNativeTraversalsSync(ResourceDataHolder holder) {
    var completer = Completer();
    if (!isInit) {
      holder.resultCode = FetchResultCode.ffiError;
      holder.errorMsg = 'call native processor error, wrapper is destroyed';
      completer.complete();
    } else {
      final paramsPair = encodeObject({
        _kUriKey: holder.url,
        _kReqHeadersKey: holder.requestHeaders ?? {}
      });

      if (paramsPair == null) {
        holder.resultCode = FetchResultCode.encodeParamsError;
        holder.errorMsg = 'call native processor error, invalid params';
        completer.complete();
      } else {
        _api._onDartInvoke(_id, paramsPair.left, paramsPair.right, generateCallback((value) {
          if (value is Map) {
            holder.resultCode =
                parseResultCode(value.safeGet<int>(_kResultCodeKey) ?? -1);
            holder.buffer = value.safeGet<Uint8List>(_kBufferKey);
            holder.responseHeaders =
                value.safeGetMap<String, String>(_kRspHeadersKey);
            if (holder.resultCode != FetchResultCode.ok) {
              holder.errorMsg = 'call native processor error';
            }
          } else {
            holder.resultCode = FetchResultCode.invalidResultError;
            holder.errorMsg = 'call native processor error, invalid result';
          }
          completer.complete();
        }));
      }
    }
    return completer.future;
  }

  @override
  void onTraversalsEndAsync(ResourceDataHolder holder) {
    if (holder.nativeRequestId <= 0) {
      return;
    }
    if (!isInit) {
      return;
    }
    final paramsPair = encodeObject({
      _kResultCodeKey: holder.resultCode.index,
      _kRspHeadersKey: holder.responseHeaders ?? {},
      _kBufferKey: holder.buffer ?? Uint8List(0)
    });

    if (paramsPair == null) {
      return;
    }

    _api._onInvokeDartCallback(
        _id, holder.nativeRequestId, paramsPair.left, paramsPair.right);
  }
}
