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
          _deviceId = deviceData['id'] ?? '';
          _codeName = deviceData['codename'] ?? '';
          _appName = info.appName;
          _appVersion = info.version;
          _packageName = info.packageName;
        } else if (Platform.isMacOS) {
          deviceData = _readMacOsDeviceInfo(await deviceInfoPlugin.macOsInfo);
          _os = 'macos';
          _osVersion = deviceData['osRelease'] ?? '1.0';
          _model = deviceData['model'] ?? '';
        } else if (Platform.isWindows) {
          deviceData = _readWindowsDeviceInfo(await deviceInfoPlugin.windowsInfo);
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
      /// 2022-10-05
      'version.securityPatch': build.version.securityPatch,
      /// 33
      'version.sdkInt': build.version.sdkInt,
      /// 13
      'version.release': build.version.release,
      /// 0
      'version.previewSdkInt': build.version.previewSdkInt,
      /// 9012097
      'version.incremental': build.version.incremental,
      /// REL
      'version.codename': build.version.codename,
      ///
      'version.baseOS': build.version.baseOS,
      /// coral
      'board': build.board,
      /// c2f2-0.5-8906123
      'bootloader': build.bootloader,
      /// google
      'brand': build.brand,
      /// coral
      'device': build.device,
      /// TP1A.221005.002
      'display': build.display,
      /// google/coral/coral:13/TP1A.221005.002/9012097:user/release-keys
      'fingerprint': build.fingerprint,
      /// coral
      'hardware': build.hardware,
      /// abfarm-release-rbe-64-00057
      'host': build.host,
      /// TP1A.221005.002
      'id': build.id,
      /// Google
      'manufacturer': build.manufacturer,
      /// Pixel 4 XL
      'model': build.model,
      /// coral
      'product': build.product,
      /// armeabi-v7a armeabi
      'supported32BitAbis': build.supported32BitAbis,
      /// arm64-v8a
      'supported64BitAbis': build.supported64BitAbis,
      /// arm64-v8a armeabi-v7a armeabi
      'supportedAbis': build.supportedAbis,
      /// release-keys
      'tags': build.tags,
      /// user
      'type': build.type,
      /// true false
      'isPhysicalDevice': build.isPhysicalDevice,
      /// f5d2b31131cab4ec
      'androidId': build.id,
      /// List include feature some like android.hardware.sensor.proximity、com.verizon.hardware.telephony.lte and so on
      'systemFeatures': build.systemFeatures,
    };
  }

  Map<String, dynamic> _readIosDeviceInfo(IosDeviceInfo data) {
    return <String, dynamic>{
      /// iPhone 13
      'name': data.name,
      /// iOS
      'systemName': data.systemName,
      /// 15.5
      /// 16.1
      'systemVersion': data.systemVersion,
      /// iPhone
      'model': data.model,
      /// iPhone
      'localizedModel': data.localizedModel,
      /// AFCBDC68-4DF0-4E0E-B326-FABB9A6D0E63
      'identifierForVendor': data.identifierForVendor,
      /// true false
      'isPhysicalDevice': data.isPhysicalDevice,
      /// Darwin
      'utsname.sysname': data.utsname.sysname,
      /// HENRYJIN-MC0.local - simulator
      /// iPhone-11 - real machine
      'utsname.nodename': data.utsname.nodename,
      /// 21.6.0
      'utsname.release': data.utsname.release,
      /// Darwin Kernel Version 21.6.0: Mon Aug 22 20:17:10 PDT 2022; root:xnu-8020.140.49~2/RELEASE_X86_64
      /// Darwin Kernel Version 22.1.0: Thu Oct  6 19:32:38 PDT 2022; root:xnu-8792.42.7~1/RELEASE_ARM64_T8030
      'utsname.version': data.utsname.version,
      /// x86_64 - simulator
      /// iPhone12,1 - real machine
      'utsname.machine': data.utsname.machine,
    };
  }

  Map<String, dynamic> _readMacOsDeviceInfo(MacOsDeviceInfo data) {
    return <String, dynamic>{
      'computerName': data.computerName,
      'hostName': data.hostName,
      'arch': data.arch,
      'model': data.model,
      'kernelVersion': data.kernelVersion,
      'osRelease': data.osRelease,
      'activeCPUs': data.activeCPUs,
      'memorySize': data.memorySize,
      'cpuFrequency': data.cpuFrequency,
      'systemGUID': data.systemGUID,
    };
  }

  Map<String, dynamic> _readWindowsDeviceInfo(WindowsDeviceInfo data) {
    return <String, dynamic>{
      'numberOfCores': data.numberOfCores,
      'computerName': data.computerName,
      'systemMemoryInMegabytes': data.systemMemoryInMegabytes,
    };
  }
}
