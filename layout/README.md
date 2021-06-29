**HippyLayout** is a lightweight flex layout engine implemented in C++
and used as layout component for **Hippy** framework in android and ios platform.

Based on [W3C Flex Layout](https://www.w3.org/TR/css-flexbox-1/#layout-algorithm) algorithms,
it has some referrence from [chromium](https://www.chromium.org/) and [yoga](https://github.com/facebook/yoga), such as flex line in chromium and test cases & benchmark in yoga.


## Compile lib for android
please run ./android/build_flexbox_so.sh to build libflexbox.so
it rely on following conditions:
### How to compile:

1.make sure android sdk & ndk installed

2.install cmake tools for android sdk (you can install it in android studio)

3.modify build_flexbox_so.sh
  set "**ANDROID_NDK_HOME**, **CMAKE_MAKE_PROGRAM**" variable depend on your installed path

4.in bash enviroment, run build_flexbox_so.sh.

### How to use:
java interfaces is at java directory.
import these files and libflexbox.so in your project, 
then use `com.tencent.smtt.flexbox.FlexNode`(FlexNode.java) to layout.


## Used in ios
import files in engine directory to your project directly, **Hippy.h** has all methods that needed to layout


## Run test cases by gtest
test in linux/mac enviroment which have gcc and cmake  tools.
run `./gtest/build_run_gtest_for_hippy_layout.sh` before commit code. make sure all test cases passed

## Run benchmark test
test in linux/mac enviroment which have gcc and cmake ,unzip tools.

hippy-layout benchmark refers yoga's beanchmark test.
so we can compare layout performances between them.

run `./benchmark/hippy/build_run_hippy_layout_benchmark.sh` to do hippy layout performace test, it will 
clean and recompile code every time, then execute hippy benchmark test.

run `./benchmark/yoga/build_run_yoga_layout_benchmark.sh` to do yoga layout performace test, it will do
the following steps for test:
* clean compile enviroment(such as delete out/yogabenchmark dir etc.)
* download [the lastest yoga code](https://codeload.github.com/facebook/yoga/zip/master), if failed, should set a https proxy.
* compile and run yoga benchmark test

apart from these, we add a new benchmark test case which named `"Huge nested layout, no style width & height`
in `benchmark/hippy/HPBenchmark.cpp` and `/benchmark/yoga/YGBenchmark.cpp`. this test case will cost more time 
than the previous test case. it's the only different place from [yoga original benchmark](https://github.com/facebook/yoga/tree/master/benchmark).
