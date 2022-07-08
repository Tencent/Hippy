# render/tdf

render/tdf 是基于tdfcore实现的一个Hippy渲染器。

构建说明（目前只支持源码构建）：

1. git clone current repo
2. git clone tdfcore（暂未开源） & 更新submodule (使用master最新commit构建)
3. Android Studio打开Hippy工程的根目录
4. 由于Hippy和tdfcore及其依赖库的编译参数差异，需做以下修改：
   1. 注释 buildconfig/cmake/compiler_toolchain.cmake 的 -Werror
   2. 注释 renderer/tdf/core/src/CMakeLists.txt 的 -Werror
   3. 修改 add_library(tdfcore ....) 的方式为 STATIC (因为Hippy要求使用静态库集成，而tdfcore在Android平台还是动态库集成)
   4. 修改 driver/js/android/build.gradle 的 externalNativeBuild 的 no-exceptions 为 exceptions ，因为 tdfcore 用了这个能力
5. 在 HippyEngineManagerImpl.java 中指定 mLinkHelper.createRenderer(TDF_RENDER) ，而不是 NATIVE_RENDER
6. 开启 gradle.propertiese 文件中的 ENABLE_TDF_RENDER