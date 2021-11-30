import '../widget/root.dart';

typedef EngineListener = void Function(EngineStatus statusCode, String? msg);

typedef ModuleListener = void Function(
    EngineStatus statusCode, String? msg, RootWidgetViewModel? rootWidget);

enum EngineState { unInit, onInit, onRestart, initError, inited, destroyed }

// Voltron engine mode
// normal ---  正常模式,具有最好的隔离已经运行速度
// low_memory --- 内存极简模式
enum EngineMode { normal, singleThread }

// Voltron engine Type
enum EngineType { rn, vue }

/// 引擎初始化过程中的错误码，对于Voltron sdk开发者调查Voltron sdk的使用者在使用过程中遇到的问题，很必须。
enum EngineStatus {
  ok, // 初始化过程，一切正常
  errBridge, // 初始化过程，initBridge错误
  errDevServer,
  wrongState, // 初始化过程，devServer错误
  wrongStateListen, // 状态错误。调用init函数时，引擎不在未初始化的状态
  initException, // 监听时状态已经错误，未知原因
  variableUnInit
}
