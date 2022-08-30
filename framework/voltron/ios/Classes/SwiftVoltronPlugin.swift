/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import Flutter
import UIKit

public class SwiftVoltronPlugin: NSObject, FlutterPlugin {
  public static func register(with registrar: FlutterPluginRegistrar) {
    let channel = FlutterMethodChannel(name: "voltron", binaryMessenger: registrar.messenger())
    let instance = SwiftVoltronPlugin()
    registrar.addMethodCallDelegate(instance, channel: channel)
  }

  public func handle(_ call: FlutterMethodCall, result: @escaping FlutterResult) {
    if call.method == "getPlatformVersion" {
        result("hello")
    } else if call.method == "getPlatformInfo" {
        var resultMap = [String: Any]()
        resultMap["os"] = "ios"
        resultMap["apiLevel"] = 0
        resultMap["osVersion"] = UIDevice.current.systemVersion
        resultMap["codeName"] = "codeName"
        resultMap["model"] = "iPhone"
        resultMap["deviceId"] = "000"
        resultMap["language"] = "en"
        resultMap["country"] = "china"
        resultMap["densityApi"] = 160
        result(resultMap)
    }
  }
}
