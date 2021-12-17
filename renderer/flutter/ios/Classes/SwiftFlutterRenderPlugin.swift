import Flutter
import UIKit

public class SwiftFlutterRenderPlugin: NSObject, FlutterPlugin {
  public static func register(with registrar: FlutterPluginRegistrar) {
    let channel = FlutterMethodChannel(name: "flutter_render", binaryMessenger: registrar.messenger())
    let instance = SwiftFlutterRenderPlugin()
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
