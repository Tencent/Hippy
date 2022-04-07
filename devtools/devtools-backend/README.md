## 项目介绍

DevTools Backend 是调试工具的服务后端，负责分发 DevTools Frontend 的调试协议，访问技术框架的调试数据进行适配返回。

## 快速上手

### 1、目录结构

```shell
├── CMakeLists.txt
├── cmake // cmake目录
│   ├── android
│   │   └── CMakeLists.txt // Android的cmake
│   └── ios
│       └── CMakeLists.txt // iOS的cmake
├── include  // 头文件
├── src // 源码目录
├── ios.toolchain.cmake // iOS cmake工具
├── libs // 打包的lib库
├── test  // 单测
└── third_party // 第三方目录
```
### 2、架构层次

![devtools 架构](http://imgcache.gtimg.cn/mie/act/img/public/202204/1649302251_devtools.png)

1）Tunnel Service

/tunnel 目录，处理与 Frontend 的消息通道，抽象与 Frontend 的收发消息通道，具体实现可以是基于 TCP 的 socket 或 websocket。

2）Domain Dispatch

/module 目录，消息协议的分发与实现，以 chrome debug protocol 为基础，扩展自定义的 domain 协议。对于想处理的 domain 协议进行注册监听。

3）DataProvider

/api 目录，抽象需要采集的调试数据接口，对外提供接口实现的注入。adapter 是外部框架需要实现的数据采集接口，notification 是外部框架的通知接口。

### 3、编译构建

#### 1）Android 集成

hippy/hippy/android/sdk/build.gradle 打开 devtools backend 开关：

```shell
                "-DSERVICE_ENABLE=1"   // DevTools 调试开关
```

#### 2）iOS集成

- 运行 js/examples/ios-demo/gen_devtools_proj.sh

### 4、运行单测

#### 1） 安装覆盖率插件

```
brew install lcov
```

#### 2）Terminal运行

```
cmake .
cd test
sh build.sh
```

#### 3）查看覆盖率报告

/devtools_backend/test/build/code_coverage_report
