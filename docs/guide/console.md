# 日志

Hippy 2.10.0 之前，前端的 `console` 模块实现了基本的日志输出。 同时 `console` 与能够将前端日志输出到终端的 `ConsoleModule` 模块进行融合， 当调用 `console` 的 `log()`、`info()`、`warn()`、`error()` 四个方法时会将日志输出到 iOS 终端日志和 [Android logcat](//developer.android.com/studio/command-line/logcat)，这样跟终端日志一起输出有助于解决线上一些难以发现的问题，但要注意在线上包中屏蔽掉正常的信息日志输出。

Hippy 2.10.0 之后，为了修正 `console` 的调用栈定位问题，将 `console` 方法与 `ConsoleModule` 模块进行分离，调用 `console` 的 `log()`、`info()`、`warn()`、`error()` 方法不再将日志输出到终端，若需要将前端日志输出到终端，请直接使用 [HippyReact ConsoleModule](hippy-react/modules?id=consolemodule) 和 [HippyVue ConsoleModule](hippy-vue/vue-native?id=consolemodule) 说明。

