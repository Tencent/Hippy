//
// Tencent is pleased to support the open source community by making
// Hippy available.
//
// Copyright (C) 2019 THL A29 Limited, a Tencent company.
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
import 'dart:io';
import 'dart:ui' as ui;

import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:voltron_renderer/util.dart';

/// 平台相关能力的管理
class PlatformManager {
  final _kTag = 'PlatformManager';

  static final PlatformManager _singleton = PlatformManager();

  static PlatformManager getInstance() {
    return _singleton;
  }

  bool _hasInit = false;

  // 系统
  String _os = "unknown";

  // country
  String _country = '';

  // language
  String _language = '';

  // direction
  int _direction = 0;

  // ios iphone8,1 - android device name
  String _device = '';

  // ios nothing - android id
  String _deviceId = '';

  // ios nothing - android id
  String _codeName = '';

  // ios nothing - android api level
  int _apiLevel = 0;

  // ios 版本 - android android version
  String _osVersion = "1.0";

  // ios appName - android appName
  String _appName = "";

  // ios app version - android app version
  String _appVersion = "0";

  // ios packageName - android packageName
  String _packageName = "";

  // ios iPhone - android
  String _model = '';

  Future<dynamic> initPlatform() async {
    WidgetsFlutterBinding.ensureInitialized();
    if (!_hasInit) {
      _country = ui.window.locale.countryCode ?? '';
      _language = ui.window.locale.languageCode;
      _direction = Bidi.isRtlLanguage(ui.window.locale.languageCode) ? 1 : 0;
      var deviceInfoPlugin = DeviceInfoPlugin();
      var deviceData = <String, dynamic>{};
      final info = await PackageInfo.fromPlatform();
      try {
        if (Platform.isAndroid) {
          deviceData = _readAndroidBuildData(await deviceInfoPlugin.androidInfo);
          _os = 'android';
          _apiLevel = deviceData['version.sdkInt'] ?? 0;
          _osVersion = deviceData['version.release'] ?? '0';
          _device = deviceData['device'] ?? '';
          _model = deviceData['model'] ?? '';
          _appName = info.appName;
          _appVersion = info.version;
          _packageName = info.packageName;
        } else if (Platform.isIOS) {
          deviceData = _readIosDeviceInfo(await deviceInfoPlugin.iosInfo);
          _os = 'ios';
          _osVersion = deviceData['systemVersion'] ?? '1.0';
          _device = deviceData['utsname.machine'] ?? '';
          _model = deviceData['model'] ?? '';
          _deviceId = deviceData['id'];
          _codeName = deviceData['codename'];
          _appName = info.appName;
          _appVersion = info.version;
          _packageName = info.packageName;
        }
        _hasInit = true;
      } on PlatformException {
        LogUtils.e(_kTag, 'Failed to get platform version.');
        _hasInit = false;
      }
    }
  }

  String get os => _os;

  String get language => _language;

  String get country => _country;

  int get direction => _direction;

  int get apiLevel => _apiLevel;

  String get osVersion => _osVersion;

  String get device => _device;

  String get deviceId => _deviceId;

  String get codeName => _codeName;

  String get model => _model;

  String get appName => _appName;

  String get appVersion => _appVersion;

  String get packageName => _packageName;

  bool get isAndroid => _os == 'android';

  bool get isIOS => _os == 'ios';

  Map<String, dynamic> _readAndroidBuildData(AndroidDeviceInfo build) {
    return <String, dynamic>{
      'version.securityPatch': build.version.securityPatch,
      'version.sdkInt': build.version.sdkInt,
      'version.release': build.version.release,
      'version.previewSdkInt': build.version.previewSdkInt,
      'version.incremental': build.version.incremental,
      'version.codename': build.version.codename,
      'version.baseOS': build.version.baseOS,
      'board': build.board,
      'bootloader': build.bootloader,
      'brand': build.brand,
      'device': build.device,
      'display': build.display,
      'fingerprint': build.fingerprint,
      'hardware': build.hardware,
      'host': build.host,
      'id': build.id,
      'manufacturer': build.manufacturer,
      'model': build.model,
      'product': build.product,
      'supported32BitAbis': build.supported32BitAbis,
      'supported64BitAbis': build.supported64BitAbis,
      'supportedAbis': build.supportedAbis,
      'tags': build.tags,
      'type': build.type,
      'isPhysicalDevice': build.isPhysicalDevice,
      'androidId': build.androidId,
      'systemFeatures': build.systemFeatures,
    };
  }

  Map<String, dynamic> _readIosDeviceInfo(IosDeviceInfo data) {
    return <String, dynamic>{
      'name': data.name,
      'systemName': data.systemName,
      'systemVersion': data.systemVersion,
      'model': data.model,
      'localizedModel': data.localizedModel,
      'identifierForVendor': data.identifierForVendor,
      'isPhysicalDevice': data.isPhysicalDevice,
      'utsname.sysname': data.utsname.sysname,
      'utsname.nodename': data.utsname.nodename,
      'utsname.release': data.utsname.release,
      'utsname.version': data.utsname.version,
      'utsname.machine': data.utsname.machine,
    };
  }
}
