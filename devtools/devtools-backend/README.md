## 项目介绍

DevTools Backend 是调试工具的服务后端，负责分发 DevTools Frontend 的调试协议，访问技术框架的调试数据进行适配返回。

## 快速上手 

#### 1、目录结构：

```shell
├── CMakeLists.txt
├── cmake // cmake目录
│   ├── android
│   │   └── CMakeLists.txt // Android的cmake
│   └── ios
│       └── CMakeLists.txt // iOS的cmake
├── include  // 头文件
├── src // 源码目录
├── android  // Android 工程目录，可作为子工程给Android工程引入
├── ios.toolchain.cmake // iOS cmake工具
├── lib // 打包的lib库
│   
├── README.md
└── third_party // 第三方目录

```

#### 2、编译构建 - Hippy 集成  

#### 1）Hippy 仓库拉取

```shell
git clone http://
cd hippy
git submodule update --init --recursive

## ios工程
cd hippy/examples/ios-demo
pod install

## android 工程
使用 android studio打开该目录 hippy/examples/android-demo/
```

#### 2）iOS集成：

- 修改podfile，新增：

```
    system("rm -rf libdevtoolsbackend")
    system("mkdir libdevtoolsbackend")
    # 指定到devtools_backend的cmakelist
    system("cmake ../../../devtools_backend/CMakeLists.txt -B libdevtoolsbackend -G Xcode -DMODULE_TOOLS=YES -DSERVICE_ENABLE=1 -DCMAKE_TOOLCHAIN_FILE=ios.toolchain.cmake -DPLATFORM=OS64COMBINED -DDEPLOYMENT_TARGET=12.0 -DENABLE_BITCODE=NO -DENABLE_ARC=YES")
```

- 将生成的`devtools_backend.xcodeproj`作为demo的子工程进行集成。

#### 3）Android 集成：

hippy/hippy/android/sdk/build.gradle 打开 devtools backend 开关：

```shell
                "-DALLOCATE_WITH_META=1",
                "-DSERVICE_ENABLE=1"   // DevTools 调试开关
```


#### 4、集成epc：

https://

##### 1. 代码规范-命令行场景

+ 安装

  mac/linux：

  ```bash
  /bin/bash -c "$(curl -fsSL https://mirrors.tencent.com/repository/generic/cli-market/env/unix-like/env-latest.sh)"
  ```

  windows：

  ```bash
  iwr https://mirrors.tencent.com/repository/generic/cli-market/env/windows/env-latest.ps1 -useb | iex
  ```

+ 扫描代码的方式：

  + 主动在仓库下执行命令：

    ```
    code-style   // fef help code-style 可以查看具体用法
    						 // 若工程根目录没有.code.yml 局部配置，默认使用 ~/.code-style/code-style.yml 全局配置
    ```

  + 代码提交时会自动触发

+ 自定义扫描配置

  根据需要，修改工程根目录下的 .code.yml 文件。

##### 2. 代码规范-添翼IDE插件场景

参考 tianyi，里面集成了code-style、codeDog、TAPD、工蜂Git和RDM4，提供代码评审、代码扫描、需求管理、持续集成等能力。

##### 3. 提交规范

+ 示例：

  ```
  fix: --bug=8767890 XXX     // ID号 7-9位
  feat: --task=8767890 XXX   // ID号 7-9位
  feat: --issue=12 xxx		   // ID号 位数不限
  ```

+ 详情：TDF工程化集成EPC-3.2提交日志规范

##### 4. 分支命名规范检查

+ 示例

  ```
  feature/${userID}_${storyID}
  bugfix/${userID}_${bugID}
  ```

+ 详情：TDF工程化集成EPC-3.3分支命名规范

##### 5. 屏蔽epc拦截

若想暂时屏蔽拦截：

```
git commit -nm "feat: xx" 
```



#### 5、运行单测：

##### 1. 安装覆盖率插件

```
brew install lcov
```

##### 2. Terminal运行

```
cmake .
cd test
sh build.sh
```

##### 3. 查看覆盖率报告

/devtools_backend/test/build/code_coverage_report

##### 4. 参考文档
https://
