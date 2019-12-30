# 前端调试

# Hippy 调试原理

Hippy 是直接运行于手机的 JS 引擎中的，在 Android 上使用 WebSocket 通过 [Chrome DevTools Protocol](//chromedevtools.github.io/devtools-protocol/) 与电脑上的 Chrome 进行通讯调试，而 iOS 上使用内置 的 [JavaScriptCore](//developer.apple.com/documentation/javascriptcore) 与 [Safari](//www.apple.com.cn/cn/safari/) 连接进行调试。

[hippy-debug-server](//www.npmjs.com/package/hippy-debug-server) 就是为了解决调试模式下终端模式获取调试用 JS 文件，以及将 [Chrome DevTools Protocol](//chromedevtools.github.io/devtools-protocol/) 传输回调试器而诞生。

# 终端环境准备

我们推荐在终端代码中留一个后门，通过一定条件触发后进入调试模式，具体代码可以参考 [iOS](//github.com/Tencent/Hippy/blob/master/examples/ios-demo/HippyDemo/TestModule.m#L36) 和 [Android](//github.com/Tencent/Hippy/blob/master/examples/android-demo/example/src/main/java/com/tencent/mtt/hippy/example/module/TestModule.java#L31)，这里实现了一个 `TestModule`，当前端调用它的 `debug` 方法时就会进入调试模式，而终端可以通过其它方式进入。

# 调试 Javascript

尽管 Hippy 是前端框架，但依然运行在终端中，如果终端提供了后门可以直接链接调试服务，那可以直接用终端后门连接终端进行调试。

这里仅以官方范例为准，讲述如何进行调试。

# iOS

因为 Hippy 需要经过网络传输调试协议，我们建议使用 iOS 模拟器进行调试，真机上虽然也可以但会要求手机和开发机在同一个网络内，并且需要在手机中配置连接获取开发机上的调试服务。

同时，本方法也可以用 Safari 进行内置包（不连接开发机上的调试 JS 包）的调试。

具体流程：

1. 点击 [Xcode on Mac AppStore](//apps.apple.com/cn/app/xcode/id497799835?l=en&mt=12) 下载安装 Xcode。
2. 使用 Xcode 打开[Hippy iOS 范例工程](//github.com/Tencent/Hippy/tree/master/examples/ios-demo) 中的 `HippyDemo.xcodeproj` 工程文件，并点击运行，正常情况下应该可以启动模拟器，并运行之前内置的 Hippy 前端代码。
3. 打开前端范例工程 [hippy-react-demo](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo) 或者 [hippy-vue-demo](//github.com/Tencent/Hippy/tree/master/examples/hippy-vue-demo)，通过 `npm i` 安装完依赖之后，使用 `npm run hippy:dev` 启动编译，并另开一个终端窗口，运行 `npm run hippy:debug` 启动调试服务。
4. 回到模拟器，点击前端工程中的调试按钮，即可进入调试状态。hippy-react 有一个单独的页面，hippy-vue 在右上角。以 hippy-react 为例：

![iOS 模拟器](//puui.qpic.cn/vupload/0/1577796352672_tmjp70r3bma.png/0)

5. 打开 Safari，首先确保 `预置` -> `高级` -> `显示开发菜单` 正常勾上。
6. 然后按图打开 Safari 调试器即可开始调试工作。

![Safari 调试器](//puui.qpic.cn/vupload/0/1577796789605_xogl73o57yk.png/0)

7. 当 JS 文件发生改动时，自动编译会执行，但是终端却无法获知 JS 文件已经发生改变，需要通过 `Command + R` 键手动刷新一下。

# Android

Android 使用了 [adb](//developer.android.com/studio/command-line/adb) 的端口映射功能，解决了真机到开发机通讯问题，反而因为 ARM 模拟器运行效率问题，更加推荐使用真机进行调试。

具体流程：

1. 下载安装 [Android Studio](//developer.android.com/studio) （可能需要翻墙，也可以通过其它途径下载）。
2. 通过 Android Studio 打开[Hippy Android 范例工程](//github.com/Tencent/Hippy/tree/master/examples/android-demo)，当提示 ToolChain 需要更新时全部选择拒绝，安装好 SDK、NDK、和 cmake 3.6.4。
3. 通过数据线插上 Android 手机，并在 Android Studio 中点击运行，正常情况下手机应该已经运行起 `Hippy Demo` app。*编译如果出现问题请参考 [#39](//github.com/Tencent/Hippy/issues/3)*。
4. 回到手机上，首先确保手机的 `USB 调试模式` 已经打开 -- 一般在关于手机页面里连续点击 `Build` 可以进入`开发者模式`，再进入`开发者模式`界面后打开 `USB 调试模式`。
5. 打开前端范例工程 [hippy-react-demo](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo) 或者 [hippy-vue-demo](//github.com/Tencent/Hippy/tree/master/examples/hippy-vue-demo)，通过 `npm i` 安装完依赖之后，使用 `npm run hippy:dev` 启动编译，并另开一个终端窗口，运行 `npm run hippy:debug` 启动调试服务。
6. 回到手机上，点击前端工程中的调试按钮，即可进入调试状态。hippy-react 有一个单独的页面，hippy-vue 在右上角。以 hippy-react 为例：

![Android](//puui.qpic.cn/vupload/0/1577798072036_g2qmcvgi6n9.png/0)

7. 然后打开 [Chrome](//www.google.com/chrome/)，输入 `chrome://inspect`，首先确保 `Discover USB devices` 的复选框呈未选中状态，然后确保 `Discover network targets` 选中，并在右侧 `Configure` 按钮的弹窗中包含了 `localhost:38989` 调试服务地址，下方的 `Remote Target` 中应该会出现 `Hippy debug tools for V8` 字样，点击下方的 `inspect` 链接即可打开 Chrome 调试器。

![Chrome inspect](//puui.qpic.cn/vupload/0/1577798490075_9tezu60gzzo.png/0)

8. 当 JS 文件发生改动时，自动编译会执行，但是终端却无法获知 JS 文件已经发生改变，点击界面上的`小圆点`，选择弹出菜单中的 `Reload` 重新加载 JS 代码。

# 框架日志输出

无论是 hippy-react 还是 hippy-vue 都将和终端通讯的信息进行输出，包含了前终端的节点操作、事件收发。这些日志对于业务调试其实很有帮助，可以让开发了解到前端框架是如何将代码转译成终端可以理解的语法。

如果需要关闭日志，可以在 hippy-react 的 new Hippy 启动参数中增加 `silent: true`，或者 hippy-vue 项目的入口文件中，开启 `Vue.config.silent = true;`。
