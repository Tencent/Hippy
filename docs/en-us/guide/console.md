# Log

Before Hippy 2.10.0, the front-end `console` modules implemented basic log output. At the same time, `console` it is integrated with the module that can output the front-end log to the native `ConsoleModule` module. When the four methods `console` of `log()`, `info()`, `warn()` and `error()` are called, the log will be output to the iOS native log and [Android logcat](//developer.android.com/studio/command-line/logcat). In this way, the output together with the native log will help to solve some problems that are difficult to find on the line. However, it is necessary to pay attention to shielding the normal information log output in the online package.

After Hippy 2.10.0, in order to correct `console` the call stack positioning problem, the `console` method  is separated from the `ConsoleModule` module. The `console` called `log()`, `info()`, `warn()` and `error()` methods no longer output the log to the native. If the front-end log needs to be output to the native, please directly use [Hippy-React ConsoleModule](hippy-react/modules?id=consolemodule) and [Hippy-Vue ConsoleModule](hippy-vue/vue-native?id=consolemodule) for description.

