# 日志

Hippy 的 `console` 模块实现了基本的日志输出，但要注意，它只支持 `log()`、`warn()`、`error()` 三个方法，别的暂时不支持。

同时 `console` 还会将日志输出到 iOS 的日志和 [Android logcat](//developer.android.com/studio/command-line/logcat)，这样跟终端日志一起输出有助于解决线上一些难以发现的问题，但要注意在线上包中屏蔽掉正常的信息日志输出。
