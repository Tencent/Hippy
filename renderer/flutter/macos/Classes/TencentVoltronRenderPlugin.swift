import Cocoa
import FlutterMacOS

public class TencentVoltronRenderPlugin: NSObject, FlutterPlugin {
  public static func register(with registrar: FlutterPluginRegistrar) {
    let channel = FlutterMethodChannel(name: "flutter_render", binaryMessenger: registrar.messenger)
    let instance = TencentVoltronRenderPlugin()
    registrar.addMethodCallDelegate(instance, channel: channel)
  }

  public func handle(_ call: FlutterMethodCall, result: @escaping FlutterResult) {
    switch call.method {
    case "getPlatformVersion":
      result("macOS " + ProcessInfo.processInfo.operatingSystemVersionString)
    case "getPlatformInfo":
      var resultMap = [String: Any]()
      resultMap["os"] = "ios"
      resultMap["apiLevel"] = 0
      resultMap["osVersion"] = "1.0"
      resultMap["codeName"] = "codeName"
      resultMap["model"] = "iPhone"
      resultMap["deviceId"] = "000"
      resultMap["language"] = "en"
      resultMap["country"] = "china"
      resultMap["densityApi"] = 160
      result(resultMap)
    default:
      result(FlutterMethodNotImplemented)
    }
  }
}
